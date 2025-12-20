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
    # "count_users": {
    #     "function": count_users,
    #     "declaration": {
    #         "name": "count_users",
    #         "description": "Count the total number of users in the database",
    #         "parameters": {
    #             "type": "OBJECT",
    #             "properties": {},
    #             "required": []
    #         }
    #     }
    # },
    # "get_users_by_email_domain": {
    #     "function": get_users_by_email_domain,
    #     "declaration": {
    #         "name": "get_users_by_email_domain",
    #         "description": "Get all users whose email addresses belong to a specific domain",
    #         "parameters": {
    #             "type": "OBJECT",
    #             "properties": {
    #                 "domain": {
    #                     "type": "STRING",
    #                     "description": "Email domain to search for (e.g., 'gmail.com', 'yahoo.com')"
    #                 }
    #             },
    #             "required": ["domain"]
    #         }
    #     }
    # },
    # "get_users_by_age_range": {
    #     "function": get_users_by_age_range,
    #     "declaration": {
    #         "name": "get_users_by_age_range",
    #         "description": "Get all users within a specific age range",
    #         "parameters": {
    #             "type": "OBJECT",
    #             "properties": {
    #                 "min_age": {
    #                     "type": "INTEGER",
    #                     "description": "Minimum age (inclusive)"
    #                 },
    #                 "max_age": {
    #                     "type": "INTEGER",
    #                     "description": "Maximum age (inclusive)"
    #                 }
    #             },
    #             "required": ["min_age", "max_age"]
    #         }
    #     }
    # },
    # "get_user_info": {
    #     "function": get_user_info,
    #     "declaration": {
    #         "name": "get_user_info",
    #         "description": "Get detailed information about a specific user by their ID",
    #         "parameters": {
    #             "type": "OBJECT",
    #             "properties": {
    #                 "user_id": {
    #                     "type": "INTEGER",
    #                     "description": "The ID of the user to retrieve"
    #                 }
    #             },
    #             "required": ["user_id"]
    #         }
    #     }
    # },
    # "get_all_users": {
    #     "function": get_all_users,
    #     "declaration": {
    #         "name": "get_all_users",
    #         "description": "Get all users from the database with their complete information",
    #         "parameters": {
    #             "type": "OBJECT",
    #             "properties": {},
    #             "required": []
    #         }
    #     }
    # },
    # "search_users_by_name": {
    #     "function": search_users_by_name,
    #     "declaration": {
    #         "name": "search_users_by_name",
    #         "description": "Search for users by name using partial matching",
    #         "parameters": {
    #             "type": "OBJECT",
    #             "properties": {
    #                 "name": {
    #                     "type": "STRING",
    #                     "description": "Name or partial name to search for"
    #                 }
    #             },
    #             "required": ["name"]
    #         }
    #     }
    # }
}


def get_tool_declarations():
    """Get list of tool declarations for Gemini"""
    return [reg["declaration"] for reg in FUNCTION_REGISTRY.values()]
