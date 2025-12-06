"""
Helper utilities for the chatbot
"""
import json
from typing import Any, Dict


def format_json(data: Any) -> str:
    """Format data as pretty JSON string"""
    return json.dumps(data, indent=2)


def truncate_text(text: str, max_length: int = 100) -> str:
    """Truncate text to maximum length"""
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."


def safe_dict_get(data: Dict, key: str, default: Any = None) -> Any:
    """Safely get value from dictionary"""
    return data.get(key, default)
