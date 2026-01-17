from pydantic import BaseModel
from datetime import datetime


class PDFExportResponse(BaseModel):
    status: str
    message: str
    pdf_id: int
    download_url: str


class ExportedPDFResponse(BaseModel):
    id: int
    module_id: int
    filename: str
    language: str | None
    created_at: datetime

    class Config:
        from_attributes = True
