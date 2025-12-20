"""
Session-related operations for the chatbot.
"""
from app.db import get_db
from sqlalchemy import text
from datetime import datetime

def get_sessions_by_event(event_id: str, date: str = None) -> dict:
    """
    Get all sessions for a specific event, optionally filtered by date.
    Args:
        event_id: ID of the event/conference (note: table uses event_id as FK)
        date: Date string (YYYY-MM-DD) to filter sessions
    """
    db = get_db()
    try:
        base_query = """
            SELECT s.id, s.title, s.description, s.start_time, s.end_time, s.place, s.capacity
            FROM sessions s
            WHERE s.event_id = :event_id 
        """
        params = {"event_id": event_id} # cast to int or str depending on schema, schema says event_id int ref events._id which is ObjectId... potential mismatch in schema description but assuming it works as FK
        # Wait, the schema in prompt says:
        # Table sessions { id int [pk] event_id int [ref: > events._id] ... }
        # But events._id is ObjectId. This is a common SQL/NoSQL mix or just a representation.
        # I will assume event_id is passed as is.
        
        if date:
            base_query += " AND DATE(s.start_time) = :date"
            params["date"] = date
            
        base_query += " ORDER BY s.start_time ASC"
        
        result = db.execute(text(base_query), params)
        rows = result.fetchall()
        columns = result.keys()
        
        sessions = [
            {col: str(val) for col, val in zip(columns, row)}
            for row in rows
        ]
        
        return {
            "success": True,
            "sessions": sessions,
            "count": len(sessions)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()

def search_sessions(query_text: str, event_id: str = None) -> dict:
    """
    Search sessions by title or description.
    """
    db = get_db()
    try:
        sql = "SELECT s.* FROM sessions s WHERE (s.title ILIKE :q OR s.description ILIKE :q)"
        params = {"q": f"%{query_text}%"}
        
        if event_id:
            sql += " AND s.event_id = :event_id"
            params["event_id"] = event_id
            
        result = db.execute(text(sql), params)
        rows = result.fetchall()
        columns = result.keys()
        
        sessions = [
            {col: str(val) for col, val in zip(columns, row)}
            for row in rows
        ]
        
        return {
            "success": True,
            "sessions": sessions
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()

def get_session_location(title_query: str) -> dict:
    """
    Find logical location of a session by title.
    """
    return search_sessions(title_query)

def get_sessions_at_location(place: str) -> dict:
    """
    Find what is happening at a specific place.
    """
    db = get_db()
    try:
        # Check current and future sessions at this place
        sql = """
            SELECT s.title, s.start_time, s.end_time, e.name as event_name
            FROM sessions s
            JOIN events e ON s.event_id = e._id
            WHERE s.place ILIKE :place
            ORDER BY s.start_time ASC
        """
        result = db.execute(text(sql), {"place": f"%{place}%"})
        rows = result.fetchall()
        columns = result.keys()
        
        activities = [
            {col: str(val) for col, val in zip(columns, row)}
            for row in rows
        ]
        
        return {
            "success": True,
            "activities": activities
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()

def get_next_session(event_id: str, current_time: str) -> dict:
    """
    Find the next starting session after a given time.
    current_time should be ISO format or compatible string.
    """
    db = get_db()
    try:
        sql = """
            SELECT * FROM sessions 
            WHERE event_id = :event_id AND start_time > :now
            ORDER BY start_time ASC
            LIMIT 1
        """
        result = db.execute(text(sql), {"event_id": event_id, "now": current_time})
        row = result.fetchone()
        
        if row:
            columns = result.keys()
            session = {col: str(val) for col, val in zip(columns, row)}
            return {"success": True, "session": session}
        else:
            return {"success": False, "message": "No upcoming sessions found."}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()

def get_session_count(event_id: str) -> dict:
    """
    Count total sessions for an event.
    """
    db = get_db()
    try:
        sql = "SELECT COUNT(*) FROM sessions WHERE event_id = :event_id"
        result = db.execute(text(sql), {"event_id": event_id})
        count = result.scalar()
        return {"success": True, "count": count}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()

def get_session_details(session_id: str) -> dict:
    """
    Get full details of a session including speakers and resources.
    """
    db = get_db()
    try:
        # Get basic session info
        current_session = db.execute(text("SELECT * FROM sessions WHERE id = :id"), {"id": session_id}).fetchone()
        if not current_session:
            return {"success": False, "message": "Session not found"}
            
        columns = current_session.keys()
        session_data = {col: str(val) for col, val in zip(columns, current_session)}
        
        # Get speakers
        speaker_sql = """
            SELECT s.full_name, s.bio, s.organization, ss.role
            FROM speakers s
            JOIN session_speakers ss ON s.id = ss.speaker_id
            WHERE ss.session_id = :sid
        """
        speakers_res = db.execute(text(speaker_sql), {"sid": session_id}).fetchall()
        speakers_cols = speakers_res.keys() if speakers_res else []
        speakers = [
            {col: str(val) for col, val in zip(speakers_cols, row)} 
            for row in speakers_res
        ]
        
        # Get resources
        resource_sql = "SELECT * FROM resources WHERE session_id = :sid"
        resources_res = db.execute(text(resource_sql), {"sid": session_id}).fetchall()
        res_cols = resources_res.keys() if resources_res else []
        resources = [
            {col: str(val) for col, val in zip(res_cols, row)} 
            for row in resources_res
        ]
        
        session_data["speakers"] = speakers
        session_data["resources"] = resources
        
        return {"success": True, "session": session_data}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        db.close()

