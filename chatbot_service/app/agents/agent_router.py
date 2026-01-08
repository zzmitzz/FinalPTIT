from enum import Enum
from typing import List, Dict
import logging
from openai import OpenAI, APIError, APIConnectionError, RateLimitError
from config.config import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AgentType(Enum):
    GENERAL = "general"
    SQL = "sql"


ROUTER_SYSTEM_PROMPT = """You are an intent classifier for a chatbot system. Your job is to analyze the user's message and determine which agent should handle it.

You must respond with ONLY one of these two words:
- "general" - for casual conversations, greetings, general questions, help requests, or any non-data queries
- "sql" - for queries requiring database lookups such as: events, sessions, speakers, organizers, schedules, locations, registrations, or any factual data retrieval

Examples:
- "Hello" -> general
- "How are you?" -> general
- "What events are happening tomorrow?" -> sql
- "Tell me about the sessions" -> sql
- "Who is the organizer of this event?" -> sql
- "Thanks for the help" -> general
- "What can you do?" -> general
- "Show me upcoming events" -> sql
- "List all sessions at Hall A" -> sql

Respond with ONLY the agent type, nothing else."""


class AgentRouter:
    def __init__(self):
        try:
            self.client = OpenAI(
                api_key=config.GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1"
            )
            self.model = "llama-3.1-8b-instant"
            logger.info("AgentRouter client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AgentRouter client: {e}")
            raise

    def route(self, user_message: str, chat_history: List[Dict[str, str]] = None) -> AgentType:
        try:
            recent_context = ""
            if chat_history and len(chat_history) > 0:
                recent_messages = chat_history[-4:]
                context_parts = []
                for msg in recent_messages:
                    if msg.get("role") in ["user", "assistant"]:
                        context_parts.append(f"{msg['role']}: {msg.get('content', '')}")
                if context_parts:
                    recent_context = f"\n\nRecent conversation:\n" + "\n".join(context_parts)

            messages = [
                {"role": "system", "content": ROUTER_SYSTEM_PROMPT},
                {"role": "user", "content": f"Classify this message: \"{user_message}\"{recent_context}"}
            ]

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.1,
                max_tokens=10
            )

            result = response.choices[0].message.content.strip().lower()
            logger.info(f"Router classified message as: {result}")

            if "sql" in result:
                return AgentType.SQL
            return AgentType.GENERAL
        except RateLimitError as e:
            logger.error(f"Rate limit exceeded in router: {e}")
            return AgentType.GENERAL
        except APIConnectionError as e:
            logger.error(f"API connection error in router: {e}")
            return AgentType.GENERAL
        except APIError as e:
            logger.error(f"API error in router: {e}")
            return AgentType.GENERAL
        except Exception as e:
            logger.error(f"Unexpected error in router: {e}")
            return AgentType.GENERAL
