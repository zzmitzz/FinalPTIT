from app.utils.helpers import read_text_file
from app.data.chat_history_retrieve import ChatHistoryManager
from app.service.helper import initFirstChatHistory
from app.logic.chatbot import chat_with_groq, summarizeChatHistory

class ChatService:
    def __init__(self):
        self.chat_history_manager = ChatHistoryManager()
        self.cache_chat_data = {}  
    
    def chat(self, user_id: str, user_message: str):
        if user_id is None or user_message is None:
            raise ValueError("user_id and user_message are required")
        
        if user_id not in self.cache_chat_data:
            self.cache_chat_data[user_id] = self._initialize_chat_history(user_id)
        
        self.cache_chat_data[user_id].append({"role": "user", "content": user_message})
        
        response = chat_with_groq(user_message, chat_history=self.cache_chat_data[user_id])
        
        self.cache_chat_data[user_id].append({"role": "assistant", "content": response["response"]})
        
        self._persist_message(user_id, user_message, response["response"])
        
        if len(self.cache_chat_data[user_id]) > 20:
            self.cache_chat_data[user_id] = self.cache_chat_data[user_id][-20:]
        
        return response["response"]
    
    def _initialize_chat_history(self, user_id: str):
        if self.chat_history_manager.user_exists(user_id):
            return self.chat_history_manager.load_chat_history(user_id)[-10:]
        else:
            return [{"role": "system", "content": initFirstChatHistory()}]
    
    def _persist_message(self, user_id: str, user_msg: str, assistant_msg: str):
        self.chat_history_manager.append_message(user_id, {"role": "user", "content": user_msg})
        self.chat_history_manager.append_message(user_id, {"role": "assistant", "content": assistant_msg})
