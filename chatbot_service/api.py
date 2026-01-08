import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from config.config import config
from app.db import init_db
from app.logic.chatbot import chat_with_groq
from app.service.chat_service import ChatService
from app.data.chat_history_retrieve import ChatHistoryManager

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

session_chat = {}


def initialize_database():
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


@app.route('/health', methods=['GET'])
def health():
    try:
        return jsonify({
            "status": "healthy",
            "model": config.GROQ_MODEL
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500


@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            logger.warning("Chat request missing message field")
            return jsonify({
                "error": "Message is required"
            }), 400
        
        message = data['message']
        session_id = data.get('session_id', 'default')
        user_id = data.get('user_id', 'guest')

        logger.info(f"Chat request received - session: {session_id}, user: {user_id}")

        chat_service = session_chat.get(session_id)
        if chat_service is None:
            try:
                chat_service = ChatService()
                session_chat[session_id] = chat_service
                logger.info(f"Created new ChatService for session: {session_id}")
            except Exception as e:
                logger.error(f"Failed to create ChatService: {e}")
                return jsonify({
                    "error": "Failed to initialize chat service"
                }), 500
        
        response = chat_service.chat(user_id, message)

        logger.info(f"Chat response generated for session: {session_id}")
        return jsonify({
            "response": response,
            "session_id": session_id
        })
    except ValueError as e:
        logger.warning(f"Validation error in chat: {e}")
        return jsonify({
            "error": str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        return jsonify({
            "error": "An error occurred while processing your request"
        }), 500


if __name__ == '__main__':
    try:
        config.validate()
        logger.info("Configuration validated successfully")
        
        initialize_database()
        
        print("\n🚀 Starting Flask API server...")
        print("📡 API will be available at: http://localhost:5000")
        logger.info("Starting Flask server on port 5000")
        
        app.run(debug=True, host='0.0.0.0', port=5000)
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        print(f"\n❌ Configuration Error: {e}")
        print("Please set up your .env file with GROQ_API_KEY")
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        print(f"\n❌ Failed to start server: {e}")
