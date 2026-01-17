from datetime import datetime, timedelta
import os
from models.database_models import ExportedPDF

RETENTION_DAYS = 7


class FileCleanupService:
    def cleanup_old_pdfs(self, db):
        cutoff = datetime.utcnow() - timedelta(days=RETENTION_DAYS)

        old_pdfs = (
            db.query(ExportedPDF)
            .filter(ExportedPDF.created_at < cutoff)
            .all()
        )

        deleted = 0

        for pdf in old_pdfs:
            if os.path.exists(pdf.file_path):
                os.remove(pdf.file_path)

            db.delete(pdf)
            deleted += 1

        db.commit()
        return deleted
