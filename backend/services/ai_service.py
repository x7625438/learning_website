import json
from openai import OpenAI
import config

client = OpenAI(
    api_key=config.DASHSCOPE_API_KEY,
    base_url=config.DASHSCOPE_BASE_URL,
)


def chat_completion(messages, temperature=0.7, max_tokens=2000):
    response = client.chat.completions.create(
        model=config.TEXT_MODEL,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


def chat_completion_json(messages, temperature=0.7, max_tokens=2000):
    prompt_suffix = '\n请以JSON格式返回结果，不要包含markdown代码块标记。'
    if messages and messages[-1]['role'] == 'user':
        messages[-1]['content'] += prompt_suffix

    text = chat_completion(messages, temperature, max_tokens)
    text = text.strip()
    if text.startswith('```'):
        text = text.split('\n', 1)[1] if '\n' in text else text[3:]
        if text.endswith('```'):
            text = text[:-3]
        text = text.strip()

    return json.loads(text)
