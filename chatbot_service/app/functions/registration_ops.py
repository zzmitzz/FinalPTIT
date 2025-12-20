"""
Registration-related operations for the chatbot.
"""
from app.db import get_db
from sqlalchemy import text

def check_registration_status(user_id: str, event_id: str) -> dict:
    """
    Check if a user is registered for an event.
    """
    db = get_db()
    try:
        query = text("""
            SELECT is_registered, created_at 
            FROM registration_register_event 
            WHERE registration_id = :user_id AND event_id = :event_id
        """)
        result = db.execute(query, {"user_id": user_id, "event_id": event_id})
        row = result.fetchone()
        
        if row:
            return {
                "success": True,
                "is_registered": row[0],
                "registered_at": str(row[1])
            }
        else:
            return {
                "success": True,
                "is_registered": False,
                "message": "User not associated with this event"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()
