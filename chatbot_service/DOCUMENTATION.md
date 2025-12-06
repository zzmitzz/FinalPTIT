# SQL Chatbot Project - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Usage](#usage)
5. [API Reference](#api-reference)
6. [Function Reference](#function-reference)
7. [Development](#development)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## 📖 Project Overview

A production-ready chatbot powered by Google's Gemini AI that can execute SQL queries through natural language. Built following clean architecture principles with:

- **Function Calling**: Gemini AI automatically calls appropriate functions
- **SQL Safety**: Only SELECT queries allowed
- **Multiple Interfaces**: CLI, Web UI, and REST API
- **Clean Architecture**: Separated concerns (DB, Logic, Functions, Config)
- **Docker Ready**: Containerized for easy deployment

**Tech Stack:**
- Google Gemini AI (gemini-1.5-flash)
- SQLAlchemy ORM
- Flask REST API
- Vanilla HTML/CSS/JavaScript Web UI
- SQLite Database

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Interfaces                    │
│  ┌─────────┐  ┌─────────┐  ┌──────────────────┐   │
│  │   CLI   │  │ Web UI  │  │   REST API       │   │
│  └────┬────┘  └────┬────┘  └────────┬─────────┘   │
└───────┼───────────┼────────────────┼──────────────┘
        │           │                │
        └───────────┴────────────────┘
                    │
        ┌───────────▼────────────┐
        │   Chatbot Logic        │
        │   (chatbot.py)         │
        └───────────┬────────────┘
                    │
        ┌───────────▼────────────┐
        │   Gemini AI            │
        │   Function Calling     │
        └───────────┬────────────┘
                    │
        ┌───────────▼────────────┐
        │   Function Registry    │
        │   (router.py)          │
        └───────────┬────────────┘
                    │
        ┌───────────▼────────────┐
        │   Function Modules     │
        │  - sql_ops.py          │
        │  - user_ops.py         │
        └───────────┬────────────┘
                    │
        ┌───────────▼────────────┐
        │   Database Layer       │
        │   (db.py + models)     │
        └────────────────────────┘
```

### Component Breakdown

**1. Configuration Layer** (`app/config.py`)
- Environment variable management
- API key handling
- Database URL configuration

**2. Database Layer** (`app/db.py`, `app/models/`)
- SQLAlchemy ORM setup
- Database initialization
- Sample data seeding

**3. Function Layer** (`app/functions/`)
- `sql_ops.py`: SQL query execution, user counting, filtering
- `user_ops.py`: User retrieval, search operations

**4. Logic Layer** (`app/logic/`)
- `router.py`: Function registry with Gemini-compatible schemas
- `chatbot.py`: Gemini AI integration and conversation management

**5. Interface Layer**
- `main.py`: CLI interface
- `api.py`: Flask REST API
- `web/`: HTML/CSS/JS web interface

---

## 🚀 Installation

### Prerequisites
- Python 3.8 or higher
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- pip package manager

### Step-by-Step Setup

1. **Clone or navigate to the project:**
```bash
cd chatbot_service
```

2. **Create virtual environment (recommended):**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables:**
```bash
# Copy example .env file
cp .env.example .env

# Edit .env and add your API key
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-1.5-flash
DB_URL=sqlite:///./app.db
```

5. **Verify installation:**
```bash
python test_functions.py
```

---

## 💻 Usage

### Option 1: CLI (Command Line Interface)

**Interactive Mode:**
```bash
python main.py
```

**Demo Mode:**
```bash
python main.py --demo
```

### Option 2: Web Interface

1. **Start the API server:**
```bash
python api.py
```

2. **Open the web interface:**
   - Open `web/index.html` in your browser, or
   - Access via http://localhost:8080 if using Docker

### Option 3: REST API

**Start the server:**
```bash
python api.py
```

**Send requests:**
```bash
# Chat endpoint
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How many users are there?"}'

# Health check
curl http://localhost:5000/health

# List sessions
curl http://localhost:5000/sessions

# Clear session
curl -X POST http://localhost:5000/clear_session \
  -H "Content-Type: application/json" \
  -d '{"session_id": "your-session-id"}'
```

---

## 🔌 API Reference

### Endpoints

#### POST /chat
Send a message to the chatbot.

**Request:**
```json
{
  "message": "How many users are in the database?",
  "session_id": "optional-session-id"
}
```

**Response:**
```json
{
  "response": "There are 5 users in the database.",
  "session_id": "session-12345"
}
```

#### GET /health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "model": "gemini-1.5-flash"
}
```

#### POST /clear_session
Clear chat history for a session.

**Request:**
```json
{
  "session_id": "session-12345"
}
```

**Response:**
```json
{
  "message": "Session session-12345 cleared"
}
```

#### GET /sessions
List all active sessions.

**Response:**
```json
{
  "sessions": ["session-1", "session-2"],
  "count": 2
}
```

---

## 📚 Function Reference

### SQL Operations (`app/functions/sql_ops.py`)

#### `execute_sql_query(query: str)`
Execute a SELECT SQL query safely.

**Parameters:**
- `query` (string): SQL SELECT query

**Returns:**
```json
{
  "success": true,
  "data": [...],
  "row_count": 5
}
```

#### `count_users()`
Count total users in database.

**Returns:**
```json
{
  "success": true,
  "count": 5,
  "message": "There are 5 users in the database"
}
```

#### `get_users_by_email_domain(domain: str)`
Get users by email domain.

**Parameters:**
- `domain` (string): Email domain (e.g., "gmail.com")

**Returns:**
```json
{
  "success": true,
  "users": [...],
  "count": 2
}
```

#### `get_users_by_age_range(min_age: int, max_age: int)`
Get users within age range.

**Parameters:**
- `min_age` (integer): Minimum age
- `max_age` (integer): Maximum age

**Returns:**
```json
{
  "success": true,
  "users": [...],
  "count": 3,
  "age_range": "25-35"
}
```

### User Operations (`app/functions/user_ops.py`)

#### `get_user_info(user_id: int)`
Get specific user details.

#### `get_all_users()`
Retrieve all users.

#### `search_users_by_name(name: str)`
Search users by name (partial match).

---

## 🛠️ Development

### Adding New Functions

1. **Create function in `app/functions/`:**

```python
# app/functions/my_module.py
def my_new_function(param: str) -> dict:
    """Function description"""
    # Implementation
    return {"success": True, "result": data}
```

2. **Register in `app/logic/router.py`:**

```python
from app.functions.my_module import my_new_function

FUNCTION_REGISTRY = {
    # ... existing functions
    "my_new_function": {
        "function": my_new_function,
        "declaration": {
            "name": "my_new_function",
            "description": "What this function does",
            "parameters": {
                "type": "object",
                "properties": {
                    "param": {
                        "type": "string",
                        "description": "Parameter description"
                    }
                },
                "required": ["param"]
            }
        }
    }
}
```

3. **Test your function:**

```python
# test_functions.py
from app.functions.my_module import my_new_function

result = my_new_function("test")
print(result)
```

### Project Structure Explained

```
chatbot_service/
├── app/
│   ├── __init__.py           # Package init
│   ├── config.py             # Configuration & env vars
│   ├── db.py                 # Database connection
│   ├── models/               # Database models
│   │   ├── __init__.py
│   │   └── user.py          # User model
│   ├── functions/            # Function implementations
│   │   ├── __init__.py
│   │   ├── sql_ops.py       # SQL operations
│   │   └── user_ops.py      # User operations
│   ├── logic/                # Business logic
│   │   ├── router.py        # Function registry
│   │   └── chatbot.py       # Gemini integration
│   └── utils/                # Utilities
│       ├── helpers.py       # Helper functions
│       └── validators.py    # Input validation
├── web/                      # Web interface
│   ├── index.html           # HTML structure
│   ├── styles.css           # Styling
│   └── script.js            # JavaScript logic
├── main.py                   # CLI entry point
├── api.py                    # REST API server
├── test_functions.py         # Function tests
├── requirements.txt          # Python dependencies
├── Dockerfile               # Docker image
├── docker-compose.yml       # Docker Compose
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── README.md                # Project overview
├── QUICKSTART.md            # Quick start guide
└── DOCUMENTATION.md         # This file
```

---

## 🐳 Deployment

### Docker Deployment

1. **Build and run with Docker Compose:**
```bash
docker-compose up --build
```

2. **Access the services:**
   - API: http://localhost:5000
   - Web UI: http://localhost:8080

3. **Stop services:**
```bash
docker-compose down
```

### Manual Deployment

1. **Set up environment:**
```bash
export GEMINI_API_KEY=your_key
export GEMINI_MODEL=gemini-1.5-flash
export DB_URL=sqlite:///./data/app.db
```

2. **Run API server:**
```bash
python api.py
```

3. **Serve web interface:**
```bash
# Using Python's HTTP server
cd web
python -m http.server 8080
```

### Production Considerations

- Use PostgreSQL instead of SQLite for production
- Set up proper CORS configuration
- Use environment-specific .env files
- Implement rate limiting
- Add authentication for API endpoints
- Use a process manager (e.g., gunicorn, supervisor)
- Set up logging and monitoring
- Use HTTPS in production

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "GEMINI_API_KEY environment variable is required"

**Solution:**
- Create `.env` file in project root
- Add: `GEMINI_API_KEY=your_actual_key`
- Get key from https://makersuite.google.com/app/apikey

#### 2. "Cannot connect to API" (Web UI)

**Solution:**
```bash
# Make sure API server is running
python api.py

# Check if port 5000 is available
netstat -an | findstr 5000  # Windows
lsof -i :5000               # Linux/Mac
```

#### 3. Import errors

**Solution:**
```bash
# Reinstall dependencies
pip install -r requirements.txt

# Or install individually
pip install google-generativeai sqlalchemy python-dotenv flask flask-cors
```

#### 4. Database errors

**Solution:**
```bash
# Delete and recreate database
rm app.db  # or del app.db on Windows
python main.py
```

#### 5. "Function call failed"

**Solution:**
- Check function implementation in `app/functions/`
- Verify function is registered in `app/logic/router.py`
- Check function parameters match schema
- Look at error details in console output

### Debug Mode

Enable verbose output:

```python
# In main.py or api.py
result = chat_with_gemini(message, verbose=True)
```

### Logs

Check console output when running:
- `python main.py` for CLI logs
- `python api.py` for API logs
- Browser console (F12) for web UI logs

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review QUICKSTART.md
3. Check the code comments
4. Review Gemini AI documentation: https://ai.google.dev/docs

---

## 📄 License

This project follows the coding rules defined in `generative_code_rules.md`.

---

**Last Updated:** 2025-12-01
**Version:** 1.0.0
