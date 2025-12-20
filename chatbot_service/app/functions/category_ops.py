"""
Category-related operations for the chatbot.
"""
from app.db import get_db
from sqlalchemy import text

def get_all_categories() -> dict:
    """
    Get all active categories.
    """
    db = get_db()
    try:
        query = text("SELECT _id, name, description FROM categories WHERE is_active = true")
        result = db.execute(query)
        rows = result.fetchall()
        columns = result.keys()
        
        categories = [
            {col: str(val) for col, val in zip(columns, row)}
            for row in rows
        ]
        
        return {
            "success": True,
            "categories": categories
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()
