from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
from core.database import get_db
from models.database_models import Manual
from schemas.api_schemas import ManualCreate, ManualResponse
from services.pdf_processor import PDFProcessor
from services.rag_engine import RAGEngine

router = APIRouter(prefix="/api/manuals", tags=["Manuals"])

pdf_processor = PDFProcessor()
rag_engine = RAGEngine()

@router.post("/upload", response_model=ManualResponse, status_code=status.HTTP_201_CREATED)
async def upload_manual(
    title: str,
    language: str,
    file: UploadFile = File(...),
    description: str = None,
    cluster_id: int = None,
    db: Session = Depends(get_db)
):
    """Upload and process a training manual PDF"""
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    # Validate cluster_id if provided
    if cluster_id:
        from models.database_models import Cluster
        cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
        if not cluster:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cluster with ID {cluster_id} not found"
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
            description=description,
            filename=file.filename,
            file_path=file_path,
            language=language,
            cluster_id=cluster_id,
            total_pages=page_count,
            indexed=False
        )
        
        db.add(manual)
        db.commit()
        db.refresh(manual)
        
        return manual
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading manual: {str(e)}"
        )

@router.post("/{manual_id}/index", response_model=ManualResponse)
async def index_manual(manual_id: int, db: Session = Depends(get_db)):
    """Index a manual for RAG search"""
    
    manual = db.query(Manual).filter(Manual.id == manual_id).first()
    if not manual:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Manual with ID {manual_id} not found"
        )
    
    try:
        # Extract text from PDF
        text = pdf_processor.extract_text(manual.file_path)
        
        # Chunk the text
        chunks = pdf_processor.chunk_text(text)
        
        # Index in RAG engine
        success = rag_engine.index_manual(manual.id, chunks)
        
        if success:
            manual.indexed = True
            db.commit()
            db.refresh(manual)
            return manual
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to index manual"
            )
            
    except Exception as e:
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
