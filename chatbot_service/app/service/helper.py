import os
from app.utils.helpers import read_text_file

def initFirstChatHistory():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(current_dir, "init_prompt.txt")
    system_prompt = read_text_file(prompt_path)
    return system_prompt
