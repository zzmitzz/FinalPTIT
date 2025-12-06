"""
Input validators for the chatbot
"""
import re


def is_valid_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def is_valid_age(age: int) -> bool:
    """Validate age is reasonable"""
    return 0 < age < 150


def is_safe_sql(query: str) -> bool:
    """Check if SQL query is safe (SELECT only)"""
    query_lower = query.strip().lower()
    dangerous_keywords = ['drop', 'delete', 'insert', 'update', 'alter', 'create']
    
    if not query_lower.startswith('select'):
        return False
    
    for keyword in dangerous_keywords:
        if keyword in query_lower:
            return False
    
    return True
