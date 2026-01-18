import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))


from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from dotenv import load_dotenv
import os
import logging

from apscheduler.schedulers.background import BackgroundScheduler
from services.file_cleanup_service import FileCleanupService
from core.database import SessionLocal

scheduler = BackgroundScheduler()
cleanup_service = FileCleanupService()

# PDF Exporting
from api import exports
from fastapi.staticfiles import StaticFiles

# Load environment variables
load_dotenv()


# Auto PDF Cleanup
def run_pdf_cleanup():
    db = SessionLocal()
    try:
        cleanup_service.cleanup_old_pdfs(db)
    finally:
        db.close()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import database and routes
from core.database import init_db
from api import clusters_router, manuals_router, modules_router, translation_router
from api.auth import router as auth_router
from api.admin import router as admin_router
from api.schools import router as schools_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events"""
    # Startup
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized successfully")
    
    # Start PDF cleanup scheduler
    scheduler.add_job(
        run_pdf_cleanup,
        "interval",
        hours=24,   # runs once daily
        id="pdf_cleanup_job"
    )
    scheduler.start()
    logger.info("Started PDF cleanup scheduler")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    scheduler.shutdown()
    logger.info("Stopped PDF cleanup scheduler")

app = FastAPI(
    title="Shiksha-Setu API",
    description="Dynamic Teacher Training Platform - Backend API",
    version="1.0.0",
    lifespan=lifespan
)


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(request: Request, exc: RequestValidationError):
    """Log request validation failures with body to make 422s debuggable."""
    try:
        body_bytes = await request.body()
        body_text = body_bytes.decode("utf-8", errors="replace")
    except Exception:
        body_text = "<unavailable>"

    logger.error(
        "422 validation error: %s %s errors=%s body=%s",
        request.method,
        request.url.path,
        exc.errors(),
        body_text,
    )
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(schools_router, prefix="/api")
app.include_router(clusters_router)
app.include_router(manuals_router)
app.include_router(modules_router)
app.include_router(translation_router)
app.include_router(exports.router)


# PDF static exports directory (use absolute path so it works regardless of CWD)
exports_dir = backend_dir / "exports"
app.mount("/exports", StaticFiles(directory=str(exports_dir)), name="exports")


@app.get("/")
async def root():
    return {
        "message": "Shiksha-Setu API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "clusters": "/api/clusters",
            "manuals": "/api/manuals",
            "translation": "/api/translation",
            "modules": "/api/modules",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/favicon.ico")
async def favicon():
    # Return empty response to avoid 404 in logs
    return Response(status_code=204)

if __name__ == "__main__":
    import uvicorn
    # Use 127.0.0.1 for local access, or 0.0.0.0 for network access
    uvicorn.run(app, host="127.0.0.1", port=8000)
