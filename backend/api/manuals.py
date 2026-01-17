from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
from core.database import get_db
from models.database_models import Manual
from schemas.api_schemas import ManualCreate, ManualResponse
from services.pdf_processor import PDFProcessor
from services.rag_engine import RAGEngine
from services.manual_adapter import get_manual_adapter_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/manuals", tags=["Manuals"])

pdf_processor = PDFProcessor()
rag_engine = RAGEngine()

@router.post("/upload", response_model=ManualResponse, status_code=status.HTTP_201_CREATED)
async def upload_manual(
    title: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and process a training manual PDF"""
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    try:
        # Save uploaded file
        file_content = await file.read()
        file_path = pdf_processor.save_uploaded_file(file_content, file.filename)
        
        # Get page count
        page_count = pdf_processor.get_page_count(file_path)
        
        # Create manual record
        manual = Manual(
            title=title,
            filename=file.filename,
            file_path=file_path,
            total_pages=page_count,
            indexed=False,
        )
        
        db.add(manual)
        db.commit()
        db.refresh(manual)

        # Attach a transient status attribute for the current response (not stored in DB)
        manual.processed = "pending"
        
        return manual
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading manual: {str(e)}"
        )

@router.post("/{manual_id}/index", response_model=ManualResponse)
async def index_manual(manual_id: int, db: Session = Depends(get_db)):
    """
    Index a manual for RAG search and generate AI-adapted content.
    
    This endpoint:
    1. Extracts text from the PDF
    2. Detects the document language
    3. Generates AI summary and key points in the same language
    4. Indexes content in ChromaDB for semantic search
    """
    
    manual = db.query(Manual).filter(Manual.id == manual_id).first()
    if not manual:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Manual with ID {manual_id} not found"
        )
    
    try:
        # Update status to processing
        manual.processed = "processing"
        db.commit()
        
        # Extract text from PDF
        logger.info(f"Extracting text from: {manual.file_path}")
        text = pdf_processor.extract_text(manual.file_path)
        
        if not text or len(text.strip()) < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract sufficient text from the PDF. The file may be scanned images or corrupt."
            )
        
        # Get the manual adapter service and generate AI adaptation
        logger.info(f"Generating AI adaptation for manual: {manual.title}")
        adapter_service = get_manual_adapter_service()
        adaptation_result = await adapter_service.adapt_manual(
            file_path=manual.file_path,
            extracted_text=text,
            manual_title=manual.title
        )
        
        # Store the adaptation results
        manual.extracted_text = adaptation_result["extracted_text"]
        manual.detected_language = adaptation_result["detected_language"]
        manual.adapted_summary = adaptation_result["adapted_summary"]
        manual.key_points = adaptation_result["key_points"]
        
        # Chunk the text for RAG indexing
        chunks = pdf_processor.chunk_text(text)
        
        # Index in RAG engine
        success = rag_engine.index_manual(manual.id, chunks)
        
        if success:
            manual.indexed = True
            manual.processed = "completed"
            db.commit()
            db.refresh(manual)
            
            logger.info(f"Manual '{manual.title}' indexed successfully with AI adaptation in {adaptation_result['detected_language']}")
            return manual
        else:
            manual.processed = "failed"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to index manual in vector store"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        manual.processed = "failed"
        db.commit()
        logger.error(f"Error indexing manual: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error indexing manual: {str(e)}"
        )

@router.get("/", response_model=List[ManualResponse])
async def list_manuals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all training manuals"""
    manuals = db.query(Manual).offset(skip).limit(limit).all()
    return manuals

@router.get("/{manual_id}", response_model=ManualResponse)
async def get_manual(manual_id: int, db: Session = Depends(get_db)):
    """Get a specific manual by ID"""
    manual = db.query(Manual).filter(Manual.id == manual_id).first()
    if not manual:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Manual with ID {manual_id} not found"
        )
    return manual

@router.delete("/{manual_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_manual(manual_id: int, db: Session = Depends(get_db)):
    """Delete a manual and its indexed content"""
    manual = db.query(Manual).filter(Manual.id == manual_id).first()
    if not manual:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Manual with ID {manual_id} not found"
        )
    
    # Delete from RAG engine
    if manual.indexed:
        rag_engine.delete_manual(manual.id)
    
    # Delete file
    if os.path.exists(manual.file_path):
        os.remove(manual.file_path)
    
    # Delete from database
    db.delete(manual)
    db.commit()
    
    return None
