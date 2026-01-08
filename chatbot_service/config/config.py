"""
Configuration management for the chatbot service.
Loads environment variables and provides centralized config access.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration class"""
    
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    DB_URL = os.getenv("DB_URL", "postgresql://iec:123456789%40@db.ptit-boot-checkin.site:5432/event_db")
    
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        if not cls.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable is required")
        return True


config = Config()
