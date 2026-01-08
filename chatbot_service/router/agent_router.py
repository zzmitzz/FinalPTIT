
from app.router.schemas import Intent
from app.router.intent_picker import LLMIntentPicker


class AgentRouter:
    def __init__(self, intent_picker: LLMIntentPicker):
        self.intent_picker = intent_picker

        self.intent_to_agent = {
            Intent.SQL: "SQLAgent",
            Intent.GENERAL: "GeneralAgent",
        }

    async def route(self, message: str) -> str:
        intent = await self.intent_picker.pick(message)
        return self.intent_to_agent[intent]