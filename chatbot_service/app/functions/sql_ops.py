"""
SQL query operations for the chatbot.
These functions execute SQL queries safely and return results.
"""
from app.db import get_db
from app.models.user import User
from sqlalchemy import text


def execute_sql_query(query: str) -> dict:
    """
    Execute a SELECT SQL query and return results.
    
    Args:
        query: SQL SELECT query string
        
    Returns:
        Dictionary with query results or error message
    """
    db = get_db()
    try:
        # Only allow SELECT queries for safety
        query_lower = query.strip().lower()
        if not query_lower.startswith("select"):
            return {
                "error": "Only SELECT queries are allowed for safety",
                "allowed_example": "SELECT * FROM users"
            }
        
        result = db.execute(text(query))
        rows = result.fetchall()
        
        # Convert rows to list of dictionaries
        columns = result.keys()
        data = [dict(zip(columns, row)) for row in rows]
        
        return {
            "success": True,
            "data": data,
            "row_count": len(data)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()


def count_users() -> dict:
    """
    Count total number of users in the database.
    
    Returns:
        Dictionary with user count
    """
    db = get_db()
    try:
        count = db.query(User).count()
        return {
            "success": True,
            "count": count,
            "message": f"There are {count} users in the database"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()


def get_users_by_email_domain(domain: str) -> dict:
    """
    Get all users with email addresses from a specific domain.
    
    Args:
        domain: Email domain to search for (e.g., 'gmail.com')
        
    Returns:
        Dictionary with matching users
    """
    db = get_db()
    try:
        users = db.query(User).filter(User.email.like(f"%@{domain}")).all()
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


def get_users_by_age_range(min_age: int, max_age: int) -> dict:
    """
    Get all users within a specific age range.
    
    Args:
        min_age: Minimum age (inclusive)
        max_age: Maximum age (inclusive)
        
    Returns:
        Dictionary with matching users
    """
    db = get_db()
    try:
        users = db.query(User).filter(
            User.age >= min_age,
            User.age <= max_age
        ).all()
        
        return {
            "success": True,
            "users": [user.to_dict() for user in users],
            "count": len(users),
            "age_range": f"{min_age}-{max_age}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()
