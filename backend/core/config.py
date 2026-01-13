from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path

# Get the backend directory path
BACKEND_DIR = Path(__file__).parent.parent

class Settings(BaseSettings):
    groq_api_key: str
    indictrans2_model_dir: str = "./models/indictrans2"
    huggingface_token: Optional[str] = None
    database_url: str = "sqlite:///./shiksha_setu.db"
    chroma_persist_directory: str = "./chroma_db"
    environment: str = "development"
    debug: bool = True
    
    class Config:
        env_file = str(BACKEND_DIR / ".env")
        case_sensitive = False

settings = Settings()
