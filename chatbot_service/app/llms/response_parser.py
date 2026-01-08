from typing import Any
from .base import LLMResponse


class ResponseParser:
    @staticmethod
    def parse_openai(response: Any) -> LLMResponse:
        message = response.choices[0].message

        if message.get("tool_calls"):
            tool_call = message["tool_calls"][0]
            return LLMResponse(
                tool_call={
                    "name": tool_call["function"]["name"],
                    "arguments": tool_call["function"]["arguments"],
                },
                raw=response,
            )

        return LLMResponse(
            content=message.get("content"),
            raw=response,
        )

    @staticmethod
    def parse_llama(response: Any) -> LLMResponse:
        message = response.get("message", {})
        
        if message.get("tool_calls"):
            tool_call = message["tool_calls"][0]
            return LLMResponse(
                tool_call={
                    "name": tool_call["function"]["name"],
                    "arguments": tool_call["function"]["arguments"],
                },
                raw=response,
            )

        return LLMResponse(
            content=message.get("content"),
            raw=response,
        )
