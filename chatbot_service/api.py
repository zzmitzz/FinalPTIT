"""
Optional Flask API wrapper for the chatbot.
Install Flask first: pip install flask flask-cors
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from app.config import config
from app.db import init_db, seed_sample_data
from app.logic.chatbot import chat_with_gemini

app = Flask(__name__)
CORS(app)

# Initialize database on startup
init_db()
seed_sample_data()

# Store chat sessions (in production, use Redis or database)
chat_sessions = {}


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": config.GEMINI_MODEL
    })


@app.route('/chat', methods=['POST'])
def chat():
    """
    Chat endpoint
    
    Request body:
    {
        "message": "user message",
        "session_id": "optional session id"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                "error": "Message is required"
            }), 400
        
        message = data['message']
        session_id = data.get('session_id', 'default')
        
        # Get or create chat history for this session
        chat_history = chat_sessions.get(session_id, [])
        
        # Get response from chatbot
        result = chat_with_gemini(message, chat_history, verbose=False)
        
        # Update session history
        chat_sessions[session_id] = result['chat_history']
        
        return jsonify({
            "response": result['response'],
            "session_id": session_id
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route('/clear_session', methods=['POST'])
def clear_session():
    """Clear chat session"""
    data = request.get_json()
    session_id = data.get('session_id', 'default')
    
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    
    return jsonify({
        "message": f"Session {session_id} cleared"
    })


@app.route('/sessions', methods=['GET'])
def list_sessions():
    """List active sessions"""
    return jsonify({
        "sessions": list(chat_sessions.keys()),
        "count": len(chat_sessions)
    })


if __name__ == '__main__':
    try:
        config.validate()
        print("\n🚀 Starting Flask API server...")
        print("📡 API will be available at: http://localhost:5000")
        print("\nEndpoints:")
        print("  POST /chat - Send a message")
        print("  GET /health - Health check")
        print("  POST /clear_session - Clear chat history")
        print("  GET /sessions - List active sessions")
        print("\nExample curl:")
        print('  curl -X POST http://localhost:5000/chat \\')
        print('       -H "Content-Type: application/json" \\')
        print('       -d \'{"message": "How many users are there?"}\'')
        print()
        
        app.run(debug=True, host='0.0.0.0', port=5000)
    except ValueError as e:
        print(f"\n❌ Configuration Error: {e}")
        print("Please set up your .env file with GEMINI_API_KEY")
