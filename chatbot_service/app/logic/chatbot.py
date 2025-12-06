"""
Gemini AI chatbot implementation with function calling.
Handles the conversation loop and function execution.
"""
import json
import google.generativeai as genai
from app.config import config
from app.logic.router import FUNCTION_REGISTRY, get_tool_declarations

# Configure Gemini
genai.configure(api_key=config.GEMINI_API_KEY)


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


def chat_with_gemini(user_message: str, chat_history=None, verbose=False):
    """
    Main chatbot function using Gemini with function calling.
    
    Args:
        user_message: User's input message
        chat_history: Optional previous chat history
        verbose: Whether to print debug information
        
    Returns:
        Chatbot response
    """
    if chat_history is None:
        chat_history = []
    
    # Initialize model with function calling
    model = genai.GenerativeModel(
        model_name=config.GEMINI_MODEL,
        tools=get_tool_declarations()
    )
    
    # Start or continue chat
    chat = model.start_chat(history=chat_history, enable_automatic_function_calling=False)
    
    # Send user message
    response = chat.send_message(user_message)
    
    if verbose:
        print(f"\n{'='*60}")
        print(f"User: {user_message}")
        print(f"{'='*60}")
    
    # Handle function calling loop
    max_iterations = 5
    iteration = 0
    
    while iteration < max_iterations:
        iteration += 1
        
        # Check if model wants to call a function
        if response.candidates[0].content.parts:
            part = response.candidates[0].content.parts[0]
            
            if hasattr(part, 'function_call') and part.function_call:
                function_call = part.function_call
                
                if verbose:
                    print(f"\n🔧 Function Call: {function_call.name}")
                    print(f"   Arguments: {dict(function_call.args)}")
                
                # Execute the function
                result = execute_function_call(function_call)
                
                if verbose:
                    print(f"   Result: {result}")
                
                # Send function result back to model
                response = chat.send_message(
                    genai.protos.Content(
                        parts=[genai.protos.Part(
                            function_response=genai.protos.FunctionResponse(
                                name=function_call.name,
                                response={'result': result}
                            )
                        )]
                    )
                )
            else:
                # No function call, we have the final response
                break
        else:
            break
    
    # Extract final text response
    final_response = response.text
    
    if verbose:
        print(f"\n🤖 Assistant: {final_response}")
        print(f"{'='*60}\n")
    
    return {
        "response": final_response,
        "chat_history": chat.history
    }


def run_interactive_chat():
    """Run interactive chat session"""
    print("\n" + "="*60)
    print("🤖 SQL Chatbot with Gemini AI")
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
        
        if user_input.lower() in ['exit', 'quit', 'bye']:
            print("\n👋 Goodbye!\n")
            break
        
        if not user_input:
            continue
        
        try:
            result = chat_with_gemini(user_input, chat_history, verbose=False)
            print(f"\n🤖 Assistant: {result['response']}\n")
            chat_history = result['chat_history']
        except Exception as e:
            print(f"\n❌ Error: {e}\n")
