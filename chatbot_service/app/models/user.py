"""
User model for database operations
"""
from sqlalchemy import Column, Integer, String
from app.db import Base


class User(Base):
    """User database model"""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    age = Column(Integer)
    
    def to_dict(self):
        """Convert user to dictionary""" 
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "age": self.age
        }
