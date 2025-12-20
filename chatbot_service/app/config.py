"""
Configuration management for the chatbot service.
Loads environment variables and provides centralized config access.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration class"""
    
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    DB_URL = os.getenv("DB_URL", "postgresql://iec:123456789%40@localhost:5432/event_db")
    
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        return True


config = Config()
