"""
Organizer-related operations for the chatbot.
"""
from app.db import get_db
from sqlalchemy import text

def get_organizer_by_event(event_id: str) -> dict:
    """
    Get organizer details for a specific event.
    
    Args:
        event_id: The ID of the event
        
    Returns:
        Dictionary with organizer and organizer_details info
    """
    db = get_db()
    try:
        # Join events -> organizers -> organizer_details
        query = text("""
            SELECT o.name, o.email, o.phone, od.organization_name, od.website, od.address, od.description
            FROM events e
            JOIN organizers o ON e.organizer_id = o._id
            LEFT JOIN organizer_details od ON o._id = od.organizer_id
            WHERE e._id = :event_id
        """)
        
        result = db.execute(query, {"event_id": event_id})
        row = result.fetchone()
        
        if not row:
            return {
                "success": False,
                "message": "Organizer not found for this event"
            }
            
        columns = result.keys()
        organizer_info = {col: str(val) for col, val in zip(columns, row)}
        
        return {
            "success": True,
            "organizer": organizer_info
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()

def get_organizer_by_name(name: str) -> dict:
    """
    Search for organizer by name (either person name or organization name).
    """
    db = get_db()
    try:
        query = text("""
            SELECT o.name, o.email, o.phone, od.organization_name, od.website, od.address
            FROM organizers o
            LEFT JOIN organizer_details od ON o._id = od.organizer_id
            WHERE o.name ILIKE :name OR od.organization_name ILIKE :name
        """)
        
        result = db.execute(query, {"name": f"%{name}%"})
        rows = result.fetchall()
        columns = result.keys()
        
        organizers = [
            {col: str(val) for col, val in zip(columns, row)}
            for row in rows
        ]
        
        return {
            "success": True,
            "organizers": organizers,
            "count": len(organizers)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()
