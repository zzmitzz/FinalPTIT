from typing import Any, Dict, List, Optional
from abc import ABC, abstractmethod

class LLMResponse:
    def __init__(
        self,
        content: Optional[str] = None,
        tool_call: Optional[Dict[str, Any]] = None,
        raw: Optional[Any] = None,
    ):
        self.content = content
        self.tool_call = tool_call
        self.raw = raw


class BaseLLMClient(ABC):

    @abstractmethod
    async def generate(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None,
    ) -> LLMResponse:
        raise NotImplementedError