"""
Function registry for chatbot function calling.
Maps function names to their implementations and schemas.
"""
from app.functions.sql_ops import (
    execute_sql_query,
    count_users,
    get_users_by_email_domain,
    get_users_by_age_range
)
from app.functions.user_ops import (
    get_user_info,
    get_all_users,
    search_users_by_name
)

# Function registry with Gemini-compatible schemas
FUNCTION_REGISTRY = {
    "execute_sql_query": {
        "function": execute_sql_query,
        "declaration": {
            "name": "execute_sql_query",
            "description": "Execute a SELECT SQL query on the database and return results. Only SELECT queries are allowed for safety. The database has a 'users' table with columns: id, name, email, age.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "SQL SELECT query to execute (e.g., 'SELECT * FROM users WHERE age > 30')"
                    }
                },
                "required": ["query"]
            }
        }
    },
    "count_users": {
        "function": count_users,
        "declaration": {
            "name": "count_users",
            "description": "Count the total number of users in the database",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    "get_users_by_email_domain": {
        "function": get_users_by_email_domain,
        "declaration": {
            "name": "get_users_by_email_domain",
            "description": "Get all users whose email addresses belong to a specific domain",
            "parameters": {
                "type": "object",
                "properties": {
                    "domain": {
                        "type": "string",
                        "description": "Email domain to search for (e.g., 'gmail.com', 'yahoo.com')"
                    }
                },
                "required": ["domain"]
            }
        }
    },
    "get_users_by_age_range": {
        "function": get_users_by_age_range,
        "declaration": {
            "name": "get_users_by_age_range",
            "description": "Get all users within a specific age range",
            "parameters": {
                "type": "object",
                "properties": {
                    "min_age": {
                        "type": "integer",
                        "description": "Minimum age (inclusive)"
                    },
                    "max_age": {
                        "type": "integer",
                        "description": "Maximum age (inclusive)"
                    }
                },
                "required": ["min_age", "max_age"]
            }
        }
    },
    "get_user_info": {
        "function": get_user_info,
        "declaration": {
            "name": "get_user_info",
            "description": "Get detailed information about a specific user by their ID",
            "parameters": {
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "integer",
                        "description": "The ID of the user to retrieve"
                    }
                },
                "required": ["user_id"]
            }
        }
    },
    "get_all_users": {
        "function": get_all_users,
        "declaration": {
            "name": "get_all_users",
            "description": "Get all users from the database with their complete information",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    "search_users_by_name": {
        "function": search_users_by_name,
        "declaration": {
            "name": "search_users_by_name",
            "description": "Search for users by name using partial matching",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Name or partial name to search for"
                    }
                },
                "required": ["name"]
            }
        }
    }
}


def get_tool_declarations():
    """Get list of tool declarations for Gemini"""
    return [reg["declaration"] for reg in FUNCTION_REGISTRY.values()]
