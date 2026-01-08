from typing import List, Dict, Any, Optional
import requests
import json
from config import config

from ..base import BaseLLMClient, LLMResponse
from ..response_parser import ResponseParser


class LLamaClient(BaseLLMClient):
    def __init__(self, api_url: str = None, model: str = "llama-3.3-70b-versatile"):
        self.api_url = api_url or "http://localhost:11434/api/chat"
        self.model = model

    async def generate(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None,
    ) -> LLMResponse:
        
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False
        }
        
        if tools:
            payload["tools"] = tools

        response = requests.post(
            self.api_url,
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        response.raise_for_status()
        result = response.json()
        
        return ResponseParser.parse_llama(result)
