from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path

# Get the backend directory path
BACKEND_DIR = Path(__file__).parent.parent

class Settings(BaseSettings):
    groq_api_key: Optional[str] = None
    indictrans2_model_dir: str = "./models/indictrans2"
    huggingface_token: Optional[str] = None
    database_url: str = "sqlite:///./shiksha_setu.db"
    # Use an absolute path inside the backend package so Chroma uses the
    # provided `backend/chroma_db/chroma.sqlite3` file reliably regardless
    # of the current working directory when the app is started.
    chroma_persist_directory: str = str(BACKEND_DIR / "chroma_db")
    environment: str = "development"
    debug: bool = True
    
    class Config:
        env_file = str(BACKEND_DIR / ".env")
        case_sensitive = False

settings = Settings()
