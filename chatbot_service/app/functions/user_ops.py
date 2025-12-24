from app.db import get_db
from sqlalchemy import text

def get_user_info(user_id):
    db = get_db()
    try:

        result = db.execute(text("SELECT * FROM users WHERE id = :user_id"), {"user_id": user_id}).fetchone()
        
        if not result:
            return {
                "success": False,
                "message": "User not found"
            }
            
        columns = result.keys()
        user_info = {col: str(val) for col, val in zip(columns, result)}
        
        return {
            "success": True,
            "user": user_info
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()
