from typing import List, Dict, Any, Optional
import json
import os
from openai import OpenAI
from config import config

from ..base import BaseLLMClient, LLMResponse
from ..response_parser import ResponseParser



class OpenAIClient(BaseLLMClient):
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        self.client = OpenAI(
            api_key=config.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1"
        )
        self.model = model

    async def generate(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None,
    ) -> LLMResponse:

        response = self.client.chat.completions.create(
            model=config.GROQ_MODEL,
            messages=messages,
            tools=tools if tools else None,
            tool_choice="auto" if tools else None
        )

        return ResponseParser.parse_openai(response)