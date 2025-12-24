"""
Chat history management for storing and retrieving user conversations.
Each user's chat history is stored in a separate JSON file named {user_uuid}.json
"""
import json
import os
from pathlib import Path
from typing import List, Dict, Optional, Any
from datetime import datetime


class ChatHistoryManager:
    """Manages reading and writing chat history to JSON files"""
    
    def __init__(self, base_dir: Optional[str] = None):
        if base_dir is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            base_dir = os.path.join(current_dir, "chat_history")
        
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_file_path(self, user_uuid: str) -> Path:
        return self.base_dir / f"{user_uuid}.json"
    
    def load_chat_history(self, user_uuid: str) -> List[Dict[str, Any]]:
        file_path = self._get_file_path(user_uuid)
        
        if not file_path.exists():
            return []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('messages', [])
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON for user {user_uuid}: {e}")
            return []
        except Exception as e:
            print(f"Error loading chat history for user {user_uuid}: {e}")
            return []
    
    def save_chat_history(self, user_uuid: str, chat_history: List[Dict[str, Any]]) -> bool:

        file_path = self._get_file_path(user_uuid)
        
        try:
            data = {
                'user_uuid': user_uuid,
                'last_updated': datetime.now().isoformat(),
                'messages': chat_history
            }
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            return True
        except Exception as e:
            print(f"Error saving chat history for user {user_uuid}: {e}")
            return False
    
    def append_message(self, user_uuid: str, message: Dict[str, Any]) -> bool:
        chat_history = self.load_chat_history(user_uuid)
        chat_history.append(message)
        return self.save_chat_history(user_uuid, chat_history)
    
    def clear_chat_history(self, user_uuid: str) -> bool:

        file_path = self._get_file_path(user_uuid)
        
        try:
            if file_path.exists():
                file_path.unlink()
            return True
        except Exception as e:
            print(f"Error clearing chat history for user {user_uuid}: {e}")
            return False
    
    def user_exists(self, user_uuid: str) -> bool:

        return self._get_file_path(user_uuid).exists()
    
    def get_message_count(self, user_uuid: str) -> int:

        chat_history = self.load_chat_history(user_uuid)
        return len(chat_history)
    
    def get_last_message(self, user_uuid: str) -> Optional[Dict[str, Any]]:

        chat_history = self.load_chat_history(user_uuid)
        return chat_history[-1] if chat_history else None
    
    def list_all_users(self) -> List[str]:

        try:
            json_files = self.base_dir.glob("*.json")
            return [f.stem for f in json_files]
        except Exception as e:
            print(f"Error listing users: {e}")
            return []
