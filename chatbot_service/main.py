"""
Main entry point for the SQL Chatbot with Gemini AI.
Initializes the database and starts the interactive chat.
"""
import sys
from app.config import config
from app.db import init_db
from app.logic.chatbot import run_interactive_chat, chat_with_gemini


def setup():
    """Initialize database and seed data"""
    print("🔧 Setting up database...")
    init_db()
    print("✅ Database ready!\n")


def main():
    """Main application entry point"""
    try:
        # Validate configuration
        config.validate()
        
        # Setup database
        setup()
        
        # Check if running in demo mode
        if len(sys.argv) > 1 and sys.argv[1] == "--demo":
            print("🎯 Running in demo mode...\n")
            
            # Demo queries
            demo_queries = [
                "How many users are in the database?",
                "Show me all users with gmail email addresses",
                "Get users between age 25 and 35",
                "What is the name of user with ID 1?"
            ]
            
            for query in demo_queries:
                print(f"{'='*60}")
                print(f"Demo Query: {query}")
                print(f"{'='*60}")
                result = chat_with_gemini(query, verbose=True)
                print()
        else:
            # Run interactive mode
            run_interactive_chat()
            
    except ValueError as e:
        print(f"\n❌ Configuration Error: {e}")
        print("\nPlease ensure you have set up your .env file with:")
        print("  GEMINI_API_KEY=your_api_key_here")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!\n")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
