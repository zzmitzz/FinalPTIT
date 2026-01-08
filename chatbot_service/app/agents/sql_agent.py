from typing import Any, Dict

from app.agents.base_agent import BaseAgent
from app.llms.prompt_templates import sql_agent_prompt
from app.llms.function_register import get_tool_declarations


class SQLAgent(BaseAgent):
    async def handle(
        self,
        user_message: str,
        context: Dict[str, Any],
    ) -> str:
        messages = [
            {"role": "system", "content": sql_agent_prompt()},
            {"role": "user", "content": user_message},
        ]

        response = await self.llm.generate(
            messages=messages,
            tools=get_tool_declarations(),
        )

        # Tool call required
        if not response.tool_call:
            return "I cannot retrieve that data."

        tool_name = response.tool_call["name"]
        args = response.tool_call["arguments"]

        # In real code, delegate to tool executor
        if tool_name == "execute_sql":
            query = args["query"]
            return f"[SQLAgent] Would execute query: {query}"

        return "Unsupported SQL operation."
