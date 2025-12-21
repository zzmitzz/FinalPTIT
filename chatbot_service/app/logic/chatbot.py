"""
Groq AI chatbot implementation with function calling.
Handles the conversation loop and function execution.
"""
import json
from openai import OpenAI
from app.config import config
from app.logic.router import FUNCTION_REGISTRY, get_tool_declarations

# Configure Groq client
client = OpenAI(
    api_key=config.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def execute_function_call(function_call):
    """
    Execute a function call from Gemini.
    
    Args:
        function_call: Function call object from Gemini
        
    Returns:
        Function execution result
    """
    function_name = function_call.name
    function_args = function_call.args
    
    if function_name not in FUNCTION_REGISTRY:
        return {"error": f"Unknown function: {function_name}"}
    
    func = FUNCTION_REGISTRY[function_name]["function"]
    
    try:
        result = func(**function_args)
        return result
    except Exception as e:
        return {"error": f"Error executing {function_name}: {str(e)}"}


def chat_with_groq(user_message: str, chat_history=None, verbose=False):
    """
    Main chatbot function using Groq with function calling.
    
    Args:
        user_message: User's input message
        chat_history: Optional previous chat history (list of messages)
        verbose: Whether to print debug information
        
    Returns:
        Chatbot response
    """
    if chat_history is None:
        chat_history = []
        # Add system prompt for first message
        chat_history.append({
            "role": "system",
            "content": """You are a friendly and helpful event support assistant. Your role is to help users find information about events, sessions, speakers, and organizers.

IMPORTANT GUIDELINES:
- You should convert all the prompt into English to analyze and after processing, you should convert it back to original language.
- Respond in a conversational, natural, and friendly tone
- NEVER use tables, markdown tables, or structured data formats in your responses
- Present information in clear, easy-to-read sentences and paragraphs
- Use bullet points or numbered lists when listing multiple items
- Avoid technical jargon - speak like you're helping a friend
- Be concise but informative
- If you need to show multiple items, describe them in a flowing, narrative style
- Always be helpful and supportive
EXAMPLES OF GOOD RESPONSES:
- "I found 3 upcoming sessions for you! The first one is 'Introduction to AI' starting at 2 PM in Hall A. Then there's 'Web Development Basics' at 3 PM in Room B, and finally 'Data Science Workshop' at 4 PM in Hall C."
- "The event 'Tech Conference 2024' is organized by Tech Corp. It's scheduled for December 25th and will feature sessions on AI, web development, and cloud computing."

AVOID:
- Tables or structured formats
- Raw data dumps
- Technical database terminology
- Overly formal language

When you need information, use the available functions to query the database, then present the results in a friendly, conversational way."""
        })
    print("Chat history initialized")
    
    # Convert chat history to OpenAI format if needed
    messages = chat_history.copy()
    messages.append({"role": "user", "content": user_message})
    
    if verbose:
        print(f"\n{'='*60}")
        print(f"User: {user_message}")
        print(f"{'='*60}")
    
    # Get tool declarations in OpenAI format
    tools = get_tool_declarations()
    
    # Handle function calling loop
    max_iterations = 5
    iteration = 0
    
    while iteration < max_iterations:
        iteration += 1
        
        # Send message to Groq
        response = client.chat.completions.create(
            model=config.GROQ_MODEL,
            messages=messages,
            tools=tools if tools else None,
            tool_choice="auto" if tools else None
        )
        
        assistant_message = response.choices[0].message
        
        if verbose:
            print(f"\nIteration {iteration}")
            print(f"Response: {assistant_message}")
        
        # Check if model wants to call a function
        if assistant_message.tool_calls:
            # Add assistant message to history
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
            
            # Execute each function call
            for tool_call in assistant_message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                if verbose:
                    print(f"\n🔧 Function Call: {function_name}")
                    print(f"   Arguments: {function_args}")
                
                # Execute the function
                if function_name in FUNCTION_REGISTRY:
                    func = FUNCTION_REGISTRY[function_name]["function"]
                    try:
                        result = func(**function_args)
                    except Exception as e:
                        result = {"error": f"Error executing {function_name}: {str(e)}"}
                else:
                    result = {"error": f"Unknown function: {function_name}"}
                
                if verbose:
                    print(f"   Result: {result}")
                
                # Add function result to messages
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result)
                })
        else:
            # No function call, we have the final response
            final_response = assistant_message.content or ""
            
            # Add final assistant message to history
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
    
    # If we hit max iterations, return what we have
    final_response = "I apologize, but I've reached the maximum number of function calls. Please try rephrasing your question."
    
    return {
        "response": final_response,
        "chat_history": messages
    }


def run_interactive_chat():
    """Run interactive chat session"""
    print("\n" + "="*60)
    print("🤖 SQL Chatbot with Groq AI")
    print("="*60)
    print("\nYou can ask questions about the database!")
    print("Examples:")
    print("  - How many users are in the database?")
    print("  - Show me all users with gmail email addresses")
    print("  - Get users between age 25 and 35")
    print("  - Search for users named 'Alice'")
    print("\nType 'exit' or 'quit' to end the conversation.\n")
    
    chat_history = []
    
    while True:
        user_input = input("You: ").strip()
        print(user_input)
        
        if user_input.lower() in ['exit', 'quit', 'bye']:
            print("\n👋 Goodbye!\n")
            break
        
        if not user_input:
            print("\nPlease enter a valid message.\n")
            continue
    
        try:
            result = chat_with_groq(user_input, chat_history, verbose=False)
            print(f"\n🤖 Assistant: {result['response']}\n")
            chat_history = result['chat_history']
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"\n❌ Error: {e.__str__()}\n")
