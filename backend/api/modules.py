from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.database_models import Module, Manual, Cluster
from schemas.api_schemas import ModuleResponse, GenerateModuleRequest, FeedbackCreate, FeedbackResponse
from services.rag_engine import RAGEngine
from services.ai_engine import AIAdaptationEngine
import logging

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

@router.patch("/{module_id}/approve")
async def approve_module(module_id: int, db: Session = Depends(get_db)):
    """Approve a module for distribution"""
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module with ID {module_id} not found"
        )
    
    module.approved = True
    db.commit()
    db.refresh(module)
    
    return {"message": "Module approved successfully", "module_id": module_id}

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
