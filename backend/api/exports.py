from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
import os


from core.database import get_db
from models.database_models import Module, ExportedPDF
from services.pdf_export_service import PDFExportService

router = APIRouter(prefix="/api/exports", tags=["Exports"])
pdf_service = PDFExportService()


@router.post("/module-pdf")
def export_module_pdf(
    module_id: int,
    db: Session = Depends(get_db)
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    # Generate PDF
    result = pdf_service.generate_module_pdf(
        module_title=module.title,
        module_content=module.adapted_content,
        language=module.language or "unknown"
    )

    # Save DB record (one row per export)
    pdf_record = ExportedPDF(
        module_id=module.id,
        filename=result["filename"],
        file_path=result["file_path"],
        language=module.language
    )

    db.add(pdf_record)
    db.commit()
    db.refresh(pdf_record)

    return {
        "status": "success",
        "pdf_id": pdf_record.id,
        "message": "PDF exported successfully"
    }



@router.get("/download/{pdf_id}")
def download_pdf(
    pdf_id: int,
    db: Session = Depends(get_db)
):
    """Download by path parameter: /api/exports/download/1"""
    pdf = db.query(ExportedPDF).filter(ExportedPDF.id == pdf_id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")

    if not os.path.exists(pdf.file_path):
        raise HTTPException(status_code=404, detail="File missing")

    return FileResponse(
        path=pdf.file_path,
        filename=pdf.filename,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{pdf.filename}"'
        }
    )

@router.delete("/{pdf_id}")
def delete_pdf(
    pdf_id: int,
    db: Session = Depends(get_db)
):
    pdf = db.query(ExportedPDF).filter(ExportedPDF.id == pdf_id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")

    # Delete file
    if os.path.exists(pdf.file_path):
        os.remove(pdf.file_path)

    # Delete DB record
    db.delete(pdf)
    db.commit()

    return {
        "status": "success",
        "message": "PDF deleted by admin"
    }
