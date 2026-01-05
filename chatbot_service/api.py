"""
Optional Flask API wrapper for the chatbot.
Install Flask first: pip install flask flask-cors
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from app.config import config
from app.db import init_db
from app.logic.chatbot import chat_with_groq
from app.service.chat_service import ChatService
from app.data.chat_history_retrieve import ChatHistoryManager

app = Flask(__name__)
CORS(app)

# Initialize database on startup
init_db()


# Save map sessionID with the ChatService
session_chat = {}

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": config.GROQ_MODEL
    })


@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                "error": "Message is required"
            }), 400
        
        message = data['message']
        session_id = data.get('session_id', 'default')
        user_id = data.get('user_id', 'guest')

        chat_service = session_chat.get(session_id)
        if(chat_service is None):
            chat_service = ChatService()
            session_chat[session_id] = chat_service
        
        response = chat_service.chat(user_id, message)

        return jsonify({
            "response": response,
            "session_id": session_id
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == '__main__':
    try:
        config.validate()
        print("\n🚀 Starting Flask API server...")
        print("📡 API will be available at: http://localhost:5000")
        
        app.run(debug=True, host='0.0.0.0', port=5000)
    except ValueError as e:
        print(f"\n❌ Configuration Error: {e}")
        print("Please set up your .env file with GEMINI_API_KEY")
