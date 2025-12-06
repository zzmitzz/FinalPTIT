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
    """Initialize database tables"""
    from app.models import user
    Base.metadata.create_all(bind=engine)


def seed_sample_data():
    """Seed the database with sample data"""
    from app.models.user import User
    
    db = get_db()
    try:
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("Database already contains data. Skipping seed.")
            return
        
        # Sample users
        users = [
            User(name="Alice Johnson", email="alice@example.com", age=28),
            User(name="Bob Smith", email="bob@gmail.com", age=35),
            User(name="Charlie Brown", email="charlie@yahoo.com", age=42),
            User(name="Diana Wilson", email="diana@gmail.com", age=31),
            User(name="Eve Davis", email="eve@example.com", age=25),
        ]
        
        db.add_all(users)
        db.commit()
        print(f"Successfully seeded {len(users)} users")
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()
