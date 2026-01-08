import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.config import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

engine = None
SessionLocal = None
Base = declarative_base()


def _get_engine():
    global engine
    if engine is None:
        try:
            connect_args = {}
            if "sqlite" in config.DB_URL:
                connect_args = {"check_same_thread": False}
            
            engine = create_engine(config.DB_URL, connect_args=connect_args)
            logger.info("Database engine created successfully")
        except Exception as e:
            logger.error(f"Failed to create database engine: {e}")
            raise
    return engine


def get_db():
    global SessionLocal
    try:
        if SessionLocal is None:
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_get_engine())
            logger.info("Database session factory created")
        return SessionLocal()
    except Exception as e:
        logger.error(f"Failed to get database session: {e}")
        raise


def init_db():
    try:
        engine = _get_engine()
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}")
        raise
