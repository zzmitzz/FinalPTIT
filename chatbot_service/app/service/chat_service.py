import logging
from app.data.chat_history_retrieve import ChatHistoryManager
from app.service.helper import initFirstChatHistory
from app.logic.chatbot import chat_with_groq, summarizeChatHistory

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self):
        try:
            self.chat_history_manager = ChatHistoryManager()
            self.cache_chat_data = {}
            logger.info("ChatService initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize ChatService: {e}")
            raise
    
    def chat(self, user_id: str, user_message: str):
        try:
            if user_id is None or user_message is None:
                raise ValueError("user_id and user_message are required")
            
            if user_id not in self.cache_chat_data:
                self.cache_chat_data[user_id] = self._initialize_chat_history(user_id)
                logger.info(f"Initialized chat history for user: {user_id}")
            
            self.cache_chat_data[user_id].append({"role": "user", "content": user_message})
            
            response = chat_with_groq(user_message, chat_history=self.cache_chat_data[user_id])
            
            self.cache_chat_data[user_id].append({"role": "assistant", "content": response["response"]})
            
            self._persist_message(user_id, user_message, response["response"])
            
            if len(self.cache_chat_data[user_id]) > 20:
                self.cache_chat_data[user_id] = self.cache_chat_data[user_id][-20:]
                logger.debug(f"Trimmed chat history for user: {user_id}")
            
            logger.info(f"Chat processed successfully for user: {user_id}")
            return response["response"]
        except ValueError as e:
            logger.warning(f"Validation error in chat: {e}")
            raise
        except Exception as e:
            logger.error(f"Error processing chat for user {user_id}: {e}")
            return "I'm experiencing technical difficulties. Please try again."
    
    def _initialize_chat_history(self, user_id: str):
        try:
            if self.chat_history_manager.user_exists(user_id):
                history = self.chat_history_manager.load_chat_history(user_id)[-10:]
                logger.info(f"Loaded existing chat history for user: {user_id}")
                return history
            else:
                logger.info(f"Creating new chat history for user: {user_id}")
                return [{"role": "system", "content": initFirstChatHistory()}]
        except Exception as e:
            logger.error(f"Error initializing chat history for user {user_id}: {e}")
            return [{"role": "system", "content": initFirstChatHistory()}]
    
    def _persist_message(self, user_id: str, user_msg: str, assistant_msg: str):
        try:
            self.chat_history_manager.append_message(user_id, {"role": "user", "content": user_msg})
            self.chat_history_manager.append_message(user_id, {"role": "assistant", "content": assistant_msg})
            logger.debug(f"Persisted messages for user: {user_id}")
        except Exception as e:
            logger.error(f"Error persisting messages for user {user_id}: {e}")
