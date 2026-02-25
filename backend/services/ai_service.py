import json
from openai import OpenAI
import config

client = OpenAI(
    api_key=config.DASHSCOPE_API_KEY,
    base_url=config.DASHSCOPE_BASE_URL,
)


def chat_completion(messages, temperature=0.7):
    response = client.chat.completions.create(
        model=config.TEXT_MODEL,
        messages=messages,
        temperature=temperature,
    )
    return response.choices[0].message.content


def translate_long_text(text, chunk_size=2000):
    """Split long text into chunks and translate each one."""
    if not text:
        return ''

    paragraphs = text.split('\n')
    chunks = []
    current = ''

    for para in paragraphs:
        if len(current) + len(para) + 1 > chunk_size and current:
            chunks.append(current)
            current = para
        else:
            current = current + '\n' + para if current else para
    if current:
        chunks.append(current)

    translated_parts = []
    for i, chunk in enumerate(chunks):
        result = chat_completion([
            {'role': 'system', 'content': '你是专业的学术论文翻译专家，将英文论文翻译为中文，保持学术术语的准确性。直接输出翻译结果，不要添加任何说明。'},
            {'role': 'user', 'content': f'请翻译以下内容（第{i+1}段，共{len(chunks)}段）：\n\n{chunk}'}
        ])
        translated_parts.append(result)

    return '\n\n'.join(translated_parts)


def chat_completion_json(messages, temperature=0.7):
    prompt_suffix = '\n请以JSON格式返回结果，不要包含markdown代码块标记。'
    if messages and messages[-1]['role'] == 'user':
        messages[-1]['content'] += prompt_suffix

    text = chat_completion(messages, temperature)##‘’‘
    text = text.strip()
    if text.startswith('```'):
        text = text.split('\n', 1)[1] if '\n' in text else text[3:]
        if text.endswith('```'):
            text = text[:-3]
        text = text.strip()

    return json.loads(text)
