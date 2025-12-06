1. Project Goal

A Python-based chatbot using function calling, with clean separation between:

database layer

business logic

function registry

configuration

chatbot interface

The code must stay simple, testable, and easy to update.

2. Folder Structure (Starter Template)
project/
 ├── app/
 │    ├── __init__.py
 │    ├── config.py
 │    ├── db.py
 │    ├── models/
 │    │     ├── __init__.py
 │    │     ├── user.py
 │    ├── functions/
 │    │     ├── __init__.py
 │    │     ├── math_ops.py
 │    │     ├── user_ops.py
 │    ├── logic/
 │    │     ├── router.py
 │    │     ├── chatbot.py
 │    ├── utils/
 │    │     ├── helpers.py
 │    │     ├── validators.py
 ├── main.py
 ├── requirements.txt
 ├── README.md
 ├── PROJECT_RULES.md

3. File Purpose & Examples
3.1 config.py

Handles environment variables, model IDs, and settings.

import os

class Config:
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1")
    DB_URL = os.getenv("DB_URL", "sqlite:///./app.db")

config = Config()

3.2 db.py

Central database connector (e.g., SQLite + SQLAlchemy).

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import config

engine = create_engine(config.DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    return SessionLocal()

3.3 functions/math_ops.py

Simple functions with type-safe signatures.

def add_numbers(a: float, b: float) -> dict:
    return {"result": a + b}

3.4 functions/user_ops.py

More complex example.

from app.db import get_db
from app.models.user import User

def get_user_info(user_id: int) -> dict:
    db = get_db()
    user = db.query(User).filter(User.id == user_id).first()
    return {"id": user.id, "name": user.name} if user else {"error": "User not found"}

3.5 logic/router.py

Function registry for function calling.

from app.functions.math_ops import add_numbers
from app.functions.user_ops import get_user_info

FUNCTION_REGISTRY = {
    "add_numbers": {
        "function": add_numbers,
        "schema": {
            "type": "object",
            "properties": {
                "a": {"type": "number"},
                "b": {"type": "number"}
            },
            "required": ["a", "b"]
        }
    },
    "get_user_info": {
        "function": get_user_info,
        "schema": {
            "type": "object",
            "properties": {
                "user_id": {"type": "integer"}
            },
            "required": ["user_id"]
        }
    }
}

3.6 logic/chatbot.py

Best-practice function-calling pipeline.

from openai import OpenAI
from app.logic.router import FUNCTION_REGISTRY
from app.config import config

client = OpenAI()

def call_function_calling(messages):
    response = client.chat.completions.create(
        model=config.OPENAI_MODEL,
        messages=messages,
        functions=[
            {
                "name": name,
                "parameters": reg["schema"]
            }
            for name, reg in FUNCTION_REGISTRY.items()
        ]
    )
    
    message = response.choices[0].message
    if message.function_call:
        name = message.function_call.name
        args = message.function_call.arguments
        fn = FUNCTION_REGISTRY[name]["function"]
        result = fn(**args)
        messages.append({"role": "function", "name": name, "content": str(result)})
        return call_function_calling(messages)
    
    return message.content

3.7 main.py

Entry point.

from app.logic.chatbot import call_function_calling

def main():
    messages = [{"role": "user", "content": "Add 5 and 7"}]
    output = call_function_calling(messages)
    print(output)

if __name__ == "__main__":
    main()

4. Coding Rules

Strict rules for AI to follow when generating new code.

4.1 Structure

Follow the folder layout above.

Separate DB, logic, function registry, and config.

Functions must be isolated and JSON-serializable.

4.2 Style

PEP 8 naming and formatting.

Keep code simple, short files, no over-engineering.

Avoid deep nesting; prefer early returns.

4.3 Comments

Minimal comments; only when logic is not obvious.

Provide function docstrings.

4.4 DB Layer

No business logic inside database code.

Use a single DB connector.

4.5 Logic Layer

Do not import chatbot logic into functions.

Logic files must remain small and focused.

4.6 Errors

Raise exceptions when needed.

Do not use broad except:.

4.7 Security

Never hardcode credentials.

Always use environment variables.

4.8 Extensibility

Function registry must be easy to extend.

New functions go into functions/.

New logic must not break old logic.

5. Deployment Checklist

Code runs with no machine-dependent paths.

Works locally and inside Docker.

DB URL configurable from env var.

No sensitive data in commits.