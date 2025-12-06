# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Set Up Environment
Create a `.env` file in the project root:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
DB_URL=sqlite:///./app.db
```

**Get your Gemini API key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key to your `.env` file

### Step 3: Run the Chatbot
```bash
# Interactive mode
python main.py

# Demo mode (see example queries)
python main.py --demo
```

---

## 💬 Example Conversations

### Example 1: Count Users
```
You: How many users are in the database?
🤖 Assistant: There are 5 users in the database.
```

### Example 2: Filter by Email Domain
```
You: Show me all users with gmail email addresses
🤖 Assistant: I found 2 users with Gmail addresses:
1. Bob Smith (bob@gmail.com)
2. Diana Wilson (diana@gmail.com)
```

### Example 3: Age Range Query
```
You: Get all users between age 25 and 35
🤖 Assistant: Here are the users in the age range 25-35:
1. Alice Johnson - 28 years old
2. Diana Wilson - 31 years old
3. Eve Davis - 25 years old
```

### Example 4: Direct SQL Query
```
You: Execute this query: SELECT name, email FROM users WHERE age > 30
🤖 Assistant: Here are the results:
1. Bob Smith - bob@gmail.com (35 years old)
2. Charlie Brown - charlie@yahoo.com (42 years old)
3. Diana Wilson - diana@gmail.com (31 years old)
```

### Example 5: Search by Name
```
You: Find users with 'son' in their name
🤖 Assistant: I found 2 users:
1. Alice Johnson (alice@example.com)
2. Diana Wilson (diana@gmail.com)
```

---

## 🧪 Testing

Run the test suite to verify all functions work:
```bash
python test_functions.py
```

This will test:
- User counting
- User retrieval
- Name search
- Email domain filtering
- Age range queries
- SQL query execution
- SQL safety checks

---

## 🛠️ Architecture Overview

```
┌─────────────────┐
│   User Input    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Gemini AI API  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Function Registry│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   SQL Ops or    │
│   User Ops      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Database    │
└─────────────────┘
```

---

## 📝 Adding New Functions

Want to add a new function? Follow these steps:

### 1. Create the Function
In `app/functions/your_module.py`:
```python
def my_new_function(param: str) -> dict:
    """Your function docstring"""
    # Your logic here
    return {"success": True, "result": "data"}
```

### 2. Register the Function
In `app/logic/router.py`, add to `FUNCTION_REGISTRY`:
```python
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
```

### 3. Test It!
The chatbot will automatically be able to call your new function!

---

## 🔒 Security Features

- **SQL Injection Protection**: Only SELECT queries allowed
- **Input Validation**: Email and age validation
- **Environment Variables**: No hardcoded credentials
- **Safe Execution**: All function calls are wrapped in try-catch

---

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY environment variable is required"
- Make sure you created a `.env` file
- Check that your API key is correct
- Verify the `.env` file is in the project root

### Database Issues
- Delete `app.db` and restart to reset the database
- Check that SQLite is working: `python -c "import sqlite3; print('OK')"`

### Import Errors
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.8+)

---

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Project Rules](generative_code_rules.md)
