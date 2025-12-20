"""
Database connection and session management.
Uses SQLAlchemy for ORM and connection pooling.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import config

engine = create_engine(
    config.DB_URL,
    connect_args={"check_same_thread": False} if "sqlite" in config.DB_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Get database session"""
    return SessionLocal()


def init_db():
    Base.metadata.create_all(bind=engine)
