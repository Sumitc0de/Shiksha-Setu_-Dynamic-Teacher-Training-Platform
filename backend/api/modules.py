from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import os
from core.database import get_db
from models.database_models import Module, Manual, Cluster, ExportedPDF
from models.teacher_models import TeacherContact
from schemas.api_schemas import ModuleResponse, GenerateModuleRequest, FeedbackCreate, FeedbackResponse
from services.rag_engine import RAGEngine
from services.ai_engine import AIAdaptationEngine
from services.whatsapp_service import WhatsAppService
from core.config import settings
import logging

# PDF Exporting requirements
from services.pdf_export_service import PDFExportService
pdf_service = PDFExportService()
whatsapp_service = WhatsAppService()


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/modules", tags=["Modules"])

rag_engine = RAGEngine()
ai_engine = AIAdaptationEngine()

@router.post("/generate", response_model=ModuleResponse, status_code=status.HTTP_201_CREATED)
async def generate_module(
    request: GenerateModuleRequest,
    db: Session = Depends(get_db)
):
    """Generate an adapted training module for a specific cluster"""
    
    # Validate manual exists and is indexed
    manual = db.query(Manual).filter(Manual.id == request.manual_id).first()
    if not manual:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Manual with ID {request.manual_id} not found"
        )
    
    if not manual.indexed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Manual must be indexed before generating modules"
        )
    
    # Validate cluster exists
    cluster = db.query(Cluster).filter(Cluster.id == request.cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID {request.cluster_id} not found"
        )
    
    try:
        # Step 1: Retrieve relevant content from manual using RAG
        logger.info(f"Retrieving context for topic: {request.topic}")
        original_content = rag_engine.get_context_for_topic(
            topic=request.topic,
            manual_id=request.manual_id,
            max_chunks=3
        )
        
        if not original_content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No relevant content found for topic '{request.topic}' in manual"
            )
        
        # Step 2: Build cluster profile dict
        cluster_profile = {
            "name": cluster.name,
            "region_type": cluster.region_type,
            "language": cluster.language,
            "infrastructure_constraints": cluster.infrastructure_constraints or "None specified",
            "key_issues": cluster.key_issues or "None specified",
            "grade_range": cluster.grade_range or "Not specified"
        }
        
        # Step 3: Generate adapted content using AI
        logger.info(f"Generating adapted content for cluster: {cluster.name}")
        adaptation_result = await ai_engine.adapt_content(
            source_content=original_content,
            cluster_profile=cluster_profile,
            topic=request.topic
        )
        
        # Step 4: Create module record
        module = Module(
            title=request.topic,
            manual_id=request.manual_id,
            cluster_id=request.cluster_id,
            original_content=original_content[:5000],  # Store first 5000 chars
            adapted_content=adaptation_result['adapted_content'],
            language=cluster.language,
            approved=False
        )
        
        db.add(module)
        db.commit()
        db.refresh(module)
        
        logger.info(f"Module generated successfully with ID: {module.id}")
        return module
        
    except Exception as e:
        logger.error(f"Error generating module: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating module: {str(e)}"
        )

@router.get("/", response_model=List[ModuleResponse])
async def list_modules(
    skip: int = 0, 
    limit: int = 100,
    cluster_id: int = None,
    manual_id: int = None,
    db: Session = Depends(get_db)
):
    """List all generated modules with optional filters"""
    query = db.query(Module)
    
    if cluster_id:
        query = query.filter(Module.cluster_id == cluster_id)
    if manual_id:
        query = query.filter(Module.manual_id == manual_id)
    
    modules = query.offset(skip).limit(limit).all()
    return modules

@router.get("/{module_id}", response_model=ModuleResponse)
async def get_module(module_id: int, db: Session = Depends(get_db)):
    """Get a specific module by ID"""
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module with ID {module_id} not found"
        )
    return module

# Auto PDF Export when Module is Approved
@router.patch(
    "/{module_id}/approve",
    summary="Approve a module and generate its PDF",
    responses={
        200: {
            "description": "Module approved and PDF generated successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "status": "success",
                        "message": "Module approved and PDF generated successfully",
                        "module_id": 1,
                        "language": "hi",
                        "pdf_id": 10
                    }
                }
            },
        }
    },
)
async def approve_module(
    module_id: int,
    db: Session = Depends(get_db)
):
    """Approve a module, export its PDF (preserving language), and send it via WhatsApp.

    The PDF is generated from the module's adapted content without re-translation.
    All teacher contacts registered for the module's cluster will receive the PDF
    via WhatsApp, and per-teacher delivery status is returned in the response.
    """
    # Step 1: Fetch module
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=404,
            detail=f"Module with ID {module_id} not found"
        )

    # Step 2: Mark approved
    module.approved = True
    db.commit()
    db.refresh(module)

    # Step 3: Auto-export PDF (LANGUAGE PRESERVED)
    pdf_result = pdf_service.generate_module_pdf(
        module_title=module.title,
        module_content=module.adapted_content,
        language=module.language or "unknown"
    )

    # Step 4: Create a new ExportedPDF record for this approval event
    pdf_record = ExportedPDF(
        module_id=module.id,
        filename=pdf_result["filename"],
        file_path=pdf_result["file_path"],
        language=module.language,
    )
    db.add(pdf_record)
    db.commit()
    db.refresh(pdf_record)

    # Step 5: Return approval + PDF info, including pdf_id
    return {
        "status": "success",
        "message": "Module approved and PDF generated successfully",
        "module_id": module.id,
        "language": module.language,
        "pdf_id": pdf_record.id,
    }


@router.post(
    "/{module_id}/send-whatsapp",
    summary="Send module PDF to teachers via WhatsApp",
    responses={
        200: {
            "description": "WhatsApp delivery attempted for all registered teacher contacts.",
            "content": {
                "application/json": {
                    "example": {
                        "status": "success",
                        "module_id": 1,
                        "pdf_id": 10,
                        "whatsapp": {
                            "enabled": True,
                            "results": [
                                {
                                    "teacher_id": 5,
                                    "name": "Saraswati Madam",
                                    "phone_number": "+919812345678",
                                    "success": True,
                                    "message_sid": "SMxxxxxxxx",
                                    "status": "queued",
                                    "error": None,
                                }
                            ],
                        },
                    }
                }
            },
        }
    },
)
async def send_module_whatsapp(
    module_id: int,
    db: Session = Depends(get_db)
):
    """Send the module's PDF to all registered teacher contacts via WhatsApp.

    If no PDF has been exported yet for this module, a new one will be generated.
    The module should typically be approved before sending.
    """
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module with ID {module_id} not found",
        )

    # Prefer the most recent exported PDF for this module if it exists
    pdf_record = (
        db.query(ExportedPDF)
        .filter(ExportedPDF.module_id == module_id)
        .order_by(ExportedPDF.id.desc())
        .first()
    )

    if not pdf_record or not os.path.exists(pdf_record.file_path):
        # Generate a fresh PDF if none exists or file is missing
        pdf_result = pdf_service.generate_module_pdf(
            module_title=module.title,
            module_content=module.adapted_content,
            language=module.language or "unknown",
        )
        pdf_record = ExportedPDF(
            module_id=module.id,
            filename=pdf_result["filename"],
            file_path=pdf_result["file_path"],
            language=module.language,
        )
        db.add(pdf_record)
        db.commit()
        db.refresh(pdf_record)
    else:
        # Build a pdf_result-like dict from the existing record
        pdf_result = {
            "filename": pdf_record.filename,
            "file_path": pdf_record.file_path,
            "download_url": f"/exports/{pdf_record.filename}",
        }

    # Fetch teacher contacts for this module's cluster
    teacher_contacts = (
        db.query(TeacherContact)
        .filter(TeacherContact.cluster_id == module.cluster_id)
        .all()
    )

    whatsapp_results = []
    media_path = pdf_result.get("download_url") or f"/exports/{pdf_result['filename']}"
    base_url_clean = settings.base_url.rstrip("/")
    media_url = base_url_clean + media_path

    # If running locally (localhost/127.0.0.1), Twilio cannot fetch the file as media.
    # In that case we skip media_url and instead send the link in the message body only.
    is_local_base = any(host in base_url_clean for host in ["localhost", "127.0.0.1"])
    twilio_media_url = None if is_local_base else media_url

    if not teacher_contacts:
        logger.info(
            "No teacher contacts registered for cluster; WhatsApp send skipped",
            extra={"cluster_id": module.cluster_id},
        )

    for teacher in teacher_contacts:
        # If Twilio can access the media URL (non-local BASE_URL), send the PDF as an attachment
        # and keep the body simple. For local setups we fall back to a clickable link.
        if twilio_media_url is not None:
            body = (
                f"Dear {teacher.name or 'Teacher'}, your training module "
                f"'{module.title}' is now approved. Please find the PDF attached."
            )
        else:
            body = (
                f"Dear {teacher.name or 'Teacher'}, your training module "
                f"'{module.title}' is now approved. Download your PDF here: {media_url}"
            )

        result = whatsapp_service.send_whatsapp_message(
            to_number=teacher.phone_number,
            body=body,
            media_url=twilio_media_url,
        )
        whatsapp_results.append(
            {
                "teacher_id": teacher.id,
                "name": teacher.name,
                "phone_number": teacher.phone_number,
                "success": result.get("success", False),
                "message_sid": result.get("message_sid"),
                "status": result.get("status"),
                "error": result.get("error"),
            }
        )

    return {
        "status": "success",
        "module_id": module.id,
        "pdf_id": pdf_record.id,
        "whatsapp": {
            "enabled": whatsapp_service.is_configured(),
            "results": whatsapp_results,
        },
    }


@router.get("/{module_id}/approve")
async def approve_module_get(
    module_id: int,
    db: Session = Depends(get_db)
):
    """GET alias for approving a module and exporting PDF.

    Allows browser-friendly calls to /api/modules/{id}/approve.
    """
    return await approve_module(module_id=module_id, db=db)


@router.delete("/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_module(module_id: int, db: Session = Depends(get_db)):
    """Delete a module"""
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module with ID {module_id} not found"
        )
    
    db.delete(module)
    db.commit()
    
    return None

@router.post("/{module_id}/feedback", response_model=FeedbackResponse)
async def submit_feedback(
    module_id: int,
    feedback: FeedbackCreate,
    db: Session = Depends(get_db)
):
    """Submit feedback for a module"""
    
    # Verify module exists
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module with ID {module_id} not found"
        )
    
    from models.database_models import Feedback
    db_feedback = Feedback(**feedback.model_dump())
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    
    return db_feedback
