from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List
from core.database import get_db
from models.database_models import Module, Manual, Cluster, ExportedPDF, Feedback
from schemas.api_schemas import ModuleResponse, GenerateModuleRequest, FeedbackCreate, FeedbackResponse
from services.rag_engine import RAGEngine
from services.ai_engine import AIAdaptationEngine
import logging
import json
from datetime import datetime, timedelta
import os

# PDF Exporting requirements
from services.pdf_export_service import PDFExportService
pdf_service = PDFExportService()


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/modules", tags=["Modules"])

rag_engine = RAGEngine()
ai_engine = AIAdaptationEngine()

# Keep prompts small enough to avoid Groq TPM/token-limit errors
MAX_SOURCE_CHARS_FOR_AI = 2800

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
        
        logger.info(f"Retrieved {len(original_content)} characters of source content")
        logger.info(f"Source content preview: {original_content[:200]}...")
        
        # Step 2: Build cluster profile dict using correct field names
        cluster_profile = {
            "name": cluster.name,
            "region_type": cluster.region_type,
            "language": cluster.language,
            "infrastructure_constraints": cluster.infrastructure_constraints or "Not specified",
            "key_issues": cluster.key_issues or "None specified",
            "grade_range": cluster.grade_range or "Not specified",
        }

        target_language = (
            (request.target_language or "").strip().lower()
            or cluster.language.strip().lower()
            or "english"
        )
        
        # Step 3: Generate adapted content using AI (truncate context to control token usage)
        source_for_ai = original_content
        if source_for_ai and len(source_for_ai) > MAX_SOURCE_CHARS_FOR_AI:
            source_for_ai = source_for_ai[:MAX_SOURCE_CHARS_FOR_AI] + "\n\n[Excerpt truncated for token limits]"

        logger.info(f"Generating adapted content for cluster: {cluster.name}")
        try:
            adaptation_result = await ai_engine.adapt_content(
                source_content=source_for_ai,
                cluster_profile=cluster_profile,
                topic=request.topic,
                target_language=target_language,
            )
        except Exception as e:
            # If Groq rejects due to token limits, retry once with a smaller excerpt.
            msg = str(e)
            if "Request too large" in msg or "tokens per minute" in msg or "rate_limit_exceeded" in msg:
                smaller = (original_content or "")[:1200] + "\n\n[Excerpt truncated further due to token limits]"
                adaptation_result = await ai_engine.adapt_content(
                    source_content=smaller,
                    cluster_profile=cluster_profile,
                    topic=request.topic,
                    target_language=target_language,
                )
            else:
                raise
        
        # Step 4: Create module record with valid fields only
        module = Module(
            title=request.topic,
            manual_id=request.manual_id,
            cluster_id=request.cluster_id,
            original_content=original_content[:5000],  # Store first 5000 chars
            adapted_content=adaptation_result['adapted_content'],
            language=adaptation_result.get("output_language") or target_language,
            approved=False,
        )
        
        db.add(module)
        db.commit()
        db.refresh(module)
        
        logger.info(f"Module generated successfully with ID: {module.id}")
        return module

    except HTTPException:
        raise

    except Exception as e:
        logger.exception("Error generating module")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating module: {str(e)}"
        )


@router.get("/languages", response_model=Dict[str, str])
async def get_supported_languages():
    """Return supported output languages for module generation."""
    return ai_engine.get_supported_languages()

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
@router.patch("/{module_id}/approve")
async def approve_module(
    module_id: int,
    db: Session = Depends(get_db)
):
    """Approve a module and generate its PDF (PATCH)."""
    # Step 1: Fetch module
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=404,
            detail=f"Module with ID {module_id} not found"
        )

    # Step 2: Mark approved (stored in module_metadata)
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
    
    # Clean up dependent records/files first to avoid FK constraint issues.
    pdfs = db.query(ExportedPDF).filter(ExportedPDF.module_id == module_id).all()
    for pdf in pdfs:
        if pdf.file_path and os.path.exists(pdf.file_path):
            try:
                os.remove(pdf.file_path)
            except OSError:
                pass

    db.query(ExportedPDF).filter(ExportedPDF.module_id == module_id).delete(synchronize_session=False)
    db.query(Feedback).filter(Feedback.module_id == module_id).delete(synchronize_session=False)

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
