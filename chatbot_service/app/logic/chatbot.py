"""
Groq AI chatbot implementation with function calling.
Handles the conversation loop and function execution.
"""
from typing import List, Dict, Any
import json
import os
from openai import OpenAI
from app.config import config
from app.logic.router import FUNCTION_REGISTRY, get_tool_declarations

# Configure Groq client
client = OpenAI(
    api_key=config.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def chat_with_groq(user_message: str, chat_history=None, verbose=False):
    messages = chat_history.copy()
    messages.append({"role": "user", "content": user_message})
    tools = get_tool_declarations()
    max_iterations = 5
    iteration = 0
    
    while iteration < max_iterations:
        iteration += 1
        
        response = client.chat.completions.create(
            model=config.GROQ_MODEL,
            messages=messages,
            tools=tools if tools else None,
            tool_choice="auto" if tools else None
        )
        
        assistant_message = response.choices[0].message
        
        if assistant_message.tool_calls:
            messages.append({
                "role": "assistant",
                "content": assistant_message.content,
                "tool_calls": [
                    {
                        "id": tool_call.id,
                        "type": "function",
                        "function": {
                            "name": tool_call.function.name,
                            "arguments": tool_call.function.arguments
                        }
                    }
                    for tool_call in assistant_message.tool_calls
                ]
            })
            
            for tool_call in assistant_message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                if function_name in FUNCTION_REGISTRY:
                    func = FUNCTION_REGISTRY[function_name]["function"]
                    try:
                        result = func(**function_args)
                    except Exception as e:
                        result = {"error": f"Error executing {function_name}: {str(e)}"}
                else:
                    result = {"error": f"Unknown function: {function_name}"}
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result)
                })
        else:
            final_response = assistant_message.content or ""
            
            messages.append({
                "role": "assistant",
                "content": final_response
            })
            
            if verbose:
                print(f"\n🤖 Assistant: {final_response}")
                print(f"{'='*60}\n")
            
            return {
                "response": final_response,
                "chat_history": messages
            }
    
    final_response = "I apologize, but I've reached the maximum number of function calls. Please try rephrasing your question."
    
    return {
        "response": final_response,
        "chat_history": messages
    }


def summarizeChatHistory(chat_history: List[Dict[str, Any]]) -> str:
    instruction = (
        "Summarize the following conversation into stable facts and preferences. "
        "Include key topics discussed, user interests, and any specific requirements mentioned. "
        "Do not include greetings, transient details, or non-essential pleasantries. "
        "Keep the summary concise and focused on information that would be useful for future context."
    )
    
    messages = [
        {"role": "system", "content": instruction},
        {"role": "user", "content": f"Conversation history to summarize:\n{json.dumps(chat_history, indent=2)}"}
    ]
    
    response = client.chat.completions.create(
        model=config.GROQ_MODEL,
        messages=messages,
    )
    
    return response.choices[0].message.content or ""

