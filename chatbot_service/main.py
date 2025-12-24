"""
Main entry point for the SQL Chatbot with Gemini AI.
Initializes the database and starts the interactive chat.
"""
import sys
from app.config import config
from app.db import init_db
from app.logic.chatbot import run_interactive_chat


def setup():
    """Initialize database and seed data"""
    print("🔧 Setting up database...")
    init_db()
    print("✅ Database ready!\n")


def main():
    """Main application entry point"""
    try:
        config.validate()
        setup()
        run_interactive_chat()
            
    except ValueError as e:
        print(f"\n❌ Configuration Error: {e}")
        print("\nPlease ensure you have set up your .env file with:")
        print("  GROQ_API_KEY=your_api_key_here")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!\n")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
