from app.llms.prompt_templates import general_agent_prompt


def initFirstChatHistory() -> str:
    return general_agent_prompt()
