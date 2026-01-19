from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings
import logging

logger = logging.getLogger(__name__)

# Define Base here to avoid circular imports
Base = declarative_base()

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database and create all tables"""
    try:
        # Import all models to ensure they're registered with Base
        from models.database_models import (
            User, UserRole, School, Cluster, Manual, Module, 
            ExportedPDF, Feedback
        )
        
        # Create all tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Verify tables were created
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"Database initialized with {len(tables)} tables: {', '.join(tables)}")
        
        # Verify critical tables exist
        required_tables = ['users', 'schools', 'clusters', 'manuals', 'modules']
        missing_tables = [t for t in required_tables if t not in tables]
        
        if missing_tables:
            logger.error(f"Missing required tables: {', '.join(missing_tables)}")
            raise Exception(f"Failed to create required tables: {', '.join(missing_tables)}")
        
        logger.info("All required tables verified successfully")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
