from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """Application settings."""
    
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Suricata Log Analyzer"
    VERSION: str = "1.0.0"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # File paths
    EVE_LOG_PATH: str = os.path.join("data", "eve.json")
    
    class Config:
        case_sensitive = True

settings = Settings() 