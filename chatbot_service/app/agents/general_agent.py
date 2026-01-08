from typing import Any, Dict

from app.agents.base_agent import BaseAgent
from app.llms.prompt_templates import general_agent_prompt


class GeneralAgent(BaseAgent):
    async def handle(
        self,
        user_message: str,
        context: Dict[str, Any],
    ) -> str:
        messages = [
            {"role": "system", "content": general_agent_prompt()},
            {"role": "user", "content": user_message},
        ]

        response = await self.llm.generate(messages)
        return response.content or "I am not sure how to answer that."