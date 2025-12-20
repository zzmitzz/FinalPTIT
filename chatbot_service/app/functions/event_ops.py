"""
Event-related operations for the chatbot.
"""
from app.db import get_db
from sqlalchemy import text

def get_all_events() -> dict:
    """
    Get all events from the database using raw SQL.
    
    Returns:
        Dictionary with all events query result
    """
    db = get_db()
    try:
        # Retrieve all events
        result = db.execute(text("SELECT * FROM events"))
        rows = result.fetchall()
        
        # Convert to list of dicts
        columns = result.keys()
        events = [
            {col: str(val) for col, val in zip(columns, row)}
            for row in rows
        ]
        
        return {
            "success": True,
            "events": events,
            "count": len(events)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()

def search_events(query_text: str = None, category_name: str = None, 
                  start_date: str = None, end_date: str = None) -> dict:
    """
    Search events with various filters.
    
    Args:
        query_text: Search term for event name or description
        category_name: Filter by category name
        start_date: Filter events starting on or after this date
        end_date: Filter events ending on or before this date
    """
    db = get_db()
    try:
        sql = """
            SELECT e._id, e.name, e.description, e.start_time, e.end_time, e.location
            FROM events e
            WHERE e.deleted = false
        """
        params = {}
        
        if query_text:
            sql += " AND (e.name ILIKE :q OR e.description ILIKE :q)"
            params["q"] = f"%{query_text}%"
            
        if start_date:
            sql += " AND e.start_time >= :start_date"
            params["start_date"] = start_date
            
        if end_date:
            sql += " AND e.end_time <= :end_date"
            params["end_date"] = end_date
        
        print("SQL:", sql)
        print("Params:", params)
        result = db.execute(text(sql), params)
        rows = result.fetchall()
        columns = result.keys()
        print("Rows:", rows)
        events = [
            {col: str(val) for col, val in zip(columns, row)}
            for row in rows
        ]
        
        return {
            "success": True,
            "events": events,
            "count": len(events)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()

def get_event_details(event_id: str) -> dict:
    """
    Get comprehensive details for a single event.
    """
    db = get_db()
    try:
        # Get event info with category and organizer name
        sql = """
            SELECT e.*, c.name as category_name, o.name as organizer_name
            FROM events e
            JOIN categories c ON e.category_id = c._id
            JOIN organizers o ON e.organizer_id = o._id
            WHERE e._id = :id
        """
        result = db.execute(text(sql), {"id": event_id})
        row = result.fetchone()
        
        if not row:
            return {"success": False, "message": "Event not found"}
            
        columns = result.keys()
        event = {col: str(val) for col, val in zip(columns, row)}
        
        return {
            "success": True,
            "event": event
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()
