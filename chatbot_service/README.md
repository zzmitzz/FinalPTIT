# SQL Chatbot with Gemini AI

A Python-based chatbot that uses Google's Gemini AI with function calling to execute SQL queries and provide natural language responses.

## Features

- Natural language to SQL query conversion
- Function calling with Gemini AI
- SQLite database with sample data
- Clean separation of concerns (DB, Logic, Functions, Config)
- Easy to extend with new functions

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file with your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
DB_URL=sqlite:///./app.db
```

3. Run the application:
```bash
python main.py
```

## Project Structure

```
chatbot_service/
├── app/
│   ├── __init__.py
│   ├── config.py          # Configuration and environment variables
│   ├── db.py              # Database connection and setup
│   ├── models/            # Database models
│   │   ├── __init__.py
│   │   └── user.py
│   ├── functions/         # Function implementations
│   │   ├── __init__.py
│   │   ├── sql_ops.py     # SQL query functions
│   │   └── user_ops.py    # User-related functions
│   ├── logic/             # Business logic
│   │   ├── router.py      # Function registry
│   │   └── chatbot.py     # Gemini chatbot logic
│   └── utils/             # Utilities
│       ├── helpers.py
│       └── validators.py
├── main.py                # Entry point
├── requirements.txt
└── README.md
```

## Usage Examples

```python
# Ask about users
"How many users are in the database?"

# Query specific data
"Show me all users with email containing 'gmail'"

# Get user information
"What is the name of user with ID 1?"
```

## Extending the Chatbot

To add new functions:

1. Create a function in `app/functions/`
2. Add the function to `FUNCTION_REGISTRY` in `app/logic/router.py`
3. The chatbot will automatically use it!
