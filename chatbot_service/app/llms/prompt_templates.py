import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PROMPTS_DIR = Path(__file__).parent / "prompts_assets"


def general_agent_prompt() -> str:
    try:
        with open(PROMPTS_DIR / "general_agent_prompt.txt", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        logger.error("general_agent_prompt.txt not found")
        return "You are a helpful assistant."
    except Exception as e:
        logger.error(f"Error reading general_agent_prompt.txt: {e}")
        return "You are a helpful assistant."


def sql_agent_prompt() -> str:
    try:
        with open(PROMPTS_DIR / "sql_agent_prompt.txt", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        logger.error("sql_agent_prompt.txt not found")
        return "You are a SQL assistant that helps users query data."
    except Exception as e:
        logger.error(f"Error reading sql_agent_prompt.txt: {e}")
        return "You are a SQL assistant that helps users query data."


def system_user_prompt() -> str:
    try:
        with open(PROMPTS_DIR / "system_user_prompt.txt", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        logger.error("system_user_prompt.txt not found")
        return "You are an intent classifier."
    except Exception as e:
        logger.error(f"Error reading system_user_prompt.txt: {e}")
        return "You are an intent classifier."
