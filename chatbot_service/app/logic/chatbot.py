from typing import List, Dict, Any
import json
import logging
from openai import OpenAI, APIError, APIConnectionError, RateLimitError
from config.config import config
from app.llms.function_register import FUNCTION_REGISTRY, get_tool_declarations
from app.agents.agent_router import AgentRouter, AgentType
from app.llms.prompt_templates import general_agent_prompt, sql_agent_prompt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = None
agent_router = None


def _get_client():
    global client
    if client is None:
        try:
            client = OpenAI(
                api_key=config.GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1"
            )
            logger.info("OpenAI client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
            raise
    return client


def _get_agent_router():
    global agent_router
    if agent_router is None:
        try:
            agent_router = AgentRouter()
            logger.info("AgentRouter initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AgentRouter: {e}")
            raise
    return agent_router


def chat_with_groq(user_message: str, chat_history=None, verbose=False):
    try:
        router = _get_agent_router()
        agent_type = router.route(user_message, chat_history)
        logger.info(f"Routed message to {agent_type.value} agent")
        
        if agent_type == AgentType.GENERAL:
            return _handle_general_chat(user_message, chat_history, verbose)
        else:
            return _handle_sql_agent(user_message, chat_history, verbose)
    except Exception as e:
        logger.error(f"Error in chat_with_groq: {e}")
        return {
            "response": "I'm experiencing technical difficulties. Please try again later.",
            "chat_history": chat_history or []
        }


def _handle_general_chat(user_message: str, chat_history: List[Dict], verbose: bool):
    try:
        messages = chat_history.copy() if chat_history else []
        
        if not messages or messages[0].get("role") != "system":
            messages.insert(0, {"role": "system", "content": general_agent_prompt()})
        
        messages.append({"role": "user", "content": user_message})
        
        openai_client = _get_client()
        response = openai_client.chat.completions.create(
            model=config.GROQ_MODEL,
            messages=messages,
        )
        
        final_response = response.choices[0].message.content or ""
        
        if verbose:
            print(f"\n🤖 [GeneralAgent]: {final_response}")
            print(f"{'='*60}\n")
        
        logger.info("GeneralAgent response generated successfully")
        return {
            "response": final_response,
            "chat_history": messages
        }
    except RateLimitError as e:
        logger.error(f"Rate limit exceeded: {e}")
        return {
            "response": "I'm receiving too many requests. Please wait a moment and try again.",
            "chat_history": chat_history or []
        }
    except APIConnectionError as e:
        logger.error(f"API connection error: {e}")
        return {
            "response": "Unable to connect to the AI service. Please check your connection.",
            "chat_history": chat_history or []
        }
    except APIError as e:
        logger.error(f"API error: {e}")
        return {
            "response": "An error occurred while processing your request.",
            "chat_history": chat_history or []
        }
    except Exception as e:
        logger.error(f"Unexpected error in _handle_general_chat: {e}")
        return {
            "response": "Something went wrong. Please try again.",
            "chat_history": chat_history or []
        }


def _handle_sql_agent(user_message: str, chat_history: List[Dict], verbose: bool):
    CONFIDENCE_THRESHOLD = 0.8
    
    def _parse_llm_response(content: str) -> tuple[str, float]:
        try:
            parsed = json.loads(content)
            response_text = parsed.get("response", content)
            confidence = float(parsed.get("confidence", 0.0))
            return response_text, confidence
        except (json.JSONDecodeError, ValueError, TypeError):
            return content, 0.0
    
    try:
        messages = []
        messages.append({"role": "system", "content": sql_agent_prompt()})
        
        if chat_history:
            for msg in chat_history[-6:]:
                if msg.get("role") in ["user", "assistant"] and msg.get("content"):
                    messages.append({"role": msg["role"], "content": msg["content"]})
        
        messages.append({"role": "user", "content": user_message})
        
        tools = get_tool_declarations()
        max_iterations = 10
        iteration = 0
        openai_client = _get_client()
        
        while iteration < max_iterations:
            iteration += 1
            logger.info(f"SQLAgent iteration {iteration}/{max_iterations}")
            
            try:
                response = openai_client.chat.completions.create(
                    model=config.GROQ_MODEL,
                    messages=messages,
                    tools=tools if tools else None,
                    tool_choice="auto" if tools else None
                )
            except (RateLimitError, APIConnectionError, APIError) as e:
                logger.error(f"API error during SQLAgent iteration: {e}")
                return {
                    "response": "I encountered an issue while retrieving data. Please try again.",
                    "chat_history": chat_history
                }
            
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
                    
                    try:
                        function_args = json.loads(tool_call.function.arguments)
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to parse function arguments: {e}")
                        result = {"error": f"Invalid function arguments for {function_name}"}
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": json.dumps(result)
                        })
                        continue
                    
                    if verbose:
                        print(f"🔧 [SQLAgent] Calling: {function_name}({function_args})")
                    
                    logger.info(f"Executing function: {function_name}")
                    
                    if function_name in FUNCTION_REGISTRY:
                        func = FUNCTION_REGISTRY[function_name]["function"]
                        try:
                            result = func(**function_args)
                            logger.info(f"Function {function_name} executed successfully")
                        except Exception as e:
                            logger.error(f"Error executing {function_name}: {e}")
                            result = {"error": f"Error executing {function_name}: {str(e)}"}
                    else:
                        logger.warning(f"Unknown function requested: {function_name}")
                        result = {"error": f"Unknown function: {function_name}"}
                        
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(result)
                    })
            else:
                raw_content = assistant_message.content or ""
                final_response, confidence = _parse_llm_response(raw_content)
                
                if verbose:
                    print(f"\n🤖 [SQLAgent]: {final_response}")
                    print(f"📊 Confidence: {confidence:.2f}")
                    print(f"{'='*60}\n")
                
                logger.info(f"SQLAgent response generated with confidence: {confidence:.2f}")
                
                if confidence > CONFIDENCE_THRESHOLD:
                    logger.info(f"Confidence {confidence:.2f} exceeds threshold {CONFIDENCE_THRESHOLD}, stopping iteration")
                    return {
                        "response": final_response,
                        "chat_history": chat_history
                    }
                
                if iteration >= max_iterations:
                    return {
                        "response": final_response,
                        "chat_history": chat_history
                    }
                
                messages.append({"role": "assistant", "content": raw_content})
                messages.append({
                    "role": "user", 
                    "content": "Please try to improve your response or gather more information to better address my request."
                })
        
        logger.warning("SQLAgent reached maximum iterations")
        return {
            "response": "I apologize, but I've reached the maximum number of function calls. Please try rephrasing your question.",
            "chat_history": chat_history
        }
    except Exception as e:
        logger.error(f"Unexpected error in _handle_sql_agent: {e}")
        return {
            "response": "An error occurred while processing your request.",
            "chat_history": chat_history or []
        }



def summarizeChatHistory(chat_history: List[Dict[str, Any]]) -> str:
    try:
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
        
        openai_client = _get_client()
        response = openai_client.chat.completions.create(
            model=config.GROQ_MODEL,
            messages=messages,
        )
        
        logger.info("Chat history summarized successfully")
        return response.choices[0].message.content or ""
    except Exception as e:
        logger.error(f"Error summarizing chat history: {e}")
        return ""

