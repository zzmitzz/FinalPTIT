"""
Function registry for chatbot function calling.
Maps function names to their implementations and schemas.
"""
from app.functions.event_ops import (
    get_all_events,
    search_events,
    get_event_details
)
from app.functions.organizer_ops import (
    get_organizer_by_event,
    get_organizer_by_name
)
from app.functions.session_ops import (
    get_sessions_by_event,
    search_sessions,
    get_session_location,
    get_sessions_at_location,
    get_next_session,
    get_session_count,
    get_session_details
)
from app.functions.category_ops import get_all_categories
from app.functions.registration_ops import check_registration_status
from app.functions.user_ops import get_user_info

# Function registry with Gemini-compatible schemas
FUNCTION_REGISTRY = {
    "get_session_details": {
        "function": get_session_details,
        "declaration": {
            "name": "get_session_details",
            "description": "Get detailed info about a session including speakers and resources.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "session_id": {"type": "STRING", "description": "Session ID"}
                },
                "required": ["session_id"]
            }
        }
    },
    "get_all_events": {
        "function": get_all_events,
        "declaration": {
            "name": "get_all_events",
            "description": "Get all events from the database using raw SQL.",
            "parameters": {
                "type": "OBJECT",
                "properties": {},
                "required": []
            }
        }
    },
    "get_event_details": {
        "function": get_event_details,
        "declaration": {
            "name": "get_event_details",
            "description": "Get details of a specific event.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "event_id": {"type": "STRING", "description": "The ID of the event"}
                },
                "required": ["event_id"]
            }
        }
    },
    "get_organizer_by_event": {
        "function": get_organizer_by_event,
        "declaration": {
            "name": "get_organizer_by_event",
            "description": "Get organizer info for an event.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "event_id": {"type": "STRING", "description": "The ID of the event"}
                },
                "required": ["event_id"]
            }
        }
    },
    "get_sessions_by_event": {
        "function": get_sessions_by_event,
        "declaration": {
            "name": "get_sessions_by_event",
            "description": "Get sessions for an event, optionally filtered by date.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "event_id": {"type": "STRING", "description": "The ID of the event"},
                    "date": {"type": "STRING", "description": "Filter by date (YYYY-MM-DD)"}
                },
                "required": ["event_id"]
            }
        }
    },
    "search_sessions": {
        "function": search_sessions,
        "declaration": {
            "name": "search_sessions",
            "description": "Search sessions by title or description.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "query_text": {"type": "STRING", "description": "Text to search in session title/desc"},
                    "event_id": {"type": "STRING", "description": "Optional event ID filter"}
                },
                "required": ["query_text"]
            }
        }
    },
    "get_sessions_at_location": {
        "function": get_sessions_at_location,
        "declaration": {
            "name": "get_sessions_at_location",
            "description": "Find sessions happening at a specific location/room.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "place": {"type": "STRING", "description": "Location name (e.g. 'Hall A')"}
                },
                "required": ["place"]
            }
        }
    },
    "get_next_session": {
        "function": get_next_session,
        "declaration": {
            "name": "get_next_session",
            "description": "Find the next starting session for an event.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "event_id": {"type": "STRING", "description": "The ID of the event"},
                    "current_time": {"type": "STRING", "description": "Current ISO timestamp"}
                },
                "required": ["event_id", "current_time"]
            }
        }
    },
    "check_registration_status": {
        "function": check_registration_status,
        "declaration": {
            "name": "check_registration_status",
            "description": "Check if a user is registered for an event.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "user_id": {"type": "STRING", "description": "User ID"},
                    "event_id": {"type": "STRING", "description": "Event ID"}
                },
                "required": ["user_id", "event_id"]
            }
        }
    },
    "get_user_info": {
        "function": get_user_info,
        "declaration": {
            "name": "get_user_info",
            "description": "Get detailed information about a specific user by their ID",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "user_id": {
                        "type": "INTEGER",
                        "description": "The ID of the user to retrieve"
                    }
                },
                "required": ["user_id"]
            }
        }
    },
}


def get_tool_declarations():
    tools = []
    for reg in FUNCTION_REGISTRY.values():
        gemini_decl = reg["declaration"]
        openai_tool = {
            "type": "function",
            "function": {
                "name": gemini_decl["name"],
                "description": gemini_decl["description"],
                "parameters": convert_gemini_params_to_openai(gemini_decl["parameters"])
            }
        }
        tools.append(openai_tool)
    
    return tools


def convert_gemini_params_to_openai(gemini_params):
    if not gemini_params:
        return {"type": "object", "properties": {}, "required": []}
    
    openai_params = {
        "type": gemini_params.get("type", "OBJECT").lower(),
        "properties": {},
        "required": gemini_params.get("required", [])
    }
    for prop_name, prop_schema in gemini_params.get("properties", {}).items():
        openai_params["properties"][prop_name] = {
            "type": prop_schema.get("type", "STRING").lower(),
            "description": prop_schema.get("description", "")
        }
    
    return openai_params
