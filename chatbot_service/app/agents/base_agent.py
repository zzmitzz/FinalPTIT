from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseAgent(ABC):
    def __init__(self, llm):
        self.llm = llm

    @abstractmethod
    async def handle(
        self,
        user_message: str,
        context: Dict[str, Any],
    ) -> str:
        """
        Process user message and return final response.
        """
        raise NotImplementedError