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

    # Twilio WhatsApp configuration
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_whatsapp_number: Optional[str] = None  # e.g. "+1415XXXXXXX"

    # Public base URL for building absolute media URLs (e.g. "https://api.example.com")
    base_url: str = "http://localhost:8000"
    
    class Config:
        env_file = str(BACKEND_DIR / ".env")
        case_sensitive = False

settings = Settings()
