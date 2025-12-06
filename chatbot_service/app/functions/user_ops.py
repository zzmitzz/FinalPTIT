"""
User-related operations for the chatbot.
"""
from app.db import get_db
from app.models.user import User


def get_user_info(user_id: int) -> dict:
    """
    Get detailed information about a specific user.
    
    Args:
        user_id: The ID of the user to retrieve
        
    Returns:
        Dictionary with user information or error message
    """
    db = get_db()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return {
                "success": False,
                "error": f"User with ID {user_id} not found"
            }
        
        return {
            "success": True,
            "user": user.to_dict()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()


def get_all_users() -> dict:
    """
    Get all users from the database.
    
    Returns:
        Dictionary with all users
    """
    db = get_db()
    try:
        users = db.query(User).all()
        return {
            "success": True,
            "users": [user.to_dict() for user in users],
            "count": len(users)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()


def search_users_by_name(name: str) -> dict:
    """
    Search for users by name (partial match).
    
    Args:
        name: Name or partial name to search for
        
    Returns:
        Dictionary with matching users
    """
    db = get_db()
    try:
        users = db.query(User).filter(User.name.like(f"%{name}%")).all()
        
        return {
            "success": True,
            "users": [user.to_dict() for user in users],
            "count": len(users),
            "search_term": name
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()
