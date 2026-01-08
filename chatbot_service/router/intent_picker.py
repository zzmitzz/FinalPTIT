import logging
from enum import Enum
from typing import List, Dict, Any
import json
from openai import OpenAI
from config.config import config
from app.llms.base import BaseLLMClient
from app.router.schemas import Intent
from app.llms.prompt_templates import system_user_prompt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SYSTEM_PROMPT = system_user_prompt() 


class LLMIntentPicker:
    def __init__(self, llm: BaseLLMClient):
        self.llm = llm
        logger.info("LLMIntentPicker initialized")

    async def pick(self, user_message: str) -> Intent:
        try:
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ]

            response = await self.llm.generate(messages)

            raw_intent = (response.content or "").strip().lower()
            logger.info(f"Intent picked: {raw_intent}")

            try:
                return Intent(raw_intent)
            except ValueError:
                logger.warning(f"Unknown intent '{raw_intent}', defaulting to GENERAL")
                return Intent.GENERAL
        except Exception as e:
            logger.error(f"Error picking intent: {e}")
            return Intent.GENERAL