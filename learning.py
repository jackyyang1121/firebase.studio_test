from transformers import GPT2Tokenizer, GPT2LMHeadModel
from googleapiclient.discovery import build
import os

YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY')

# 初始化 GPT-2 模型與 tokenizer
tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
model = GPT2LMHeadModel.from_pretrained('gpt2')

# 用 GPT-2 生成複雜計畫
def generate_complex_plan(goal):
    prompt = f"Generate a detailed multi-week learning plan for: {goal}"
    inputs = tokenizer(prompt, return_tensors='pt', max_length=50, truncation=True)
    outputs = model.generate(
        inputs['input_ids'],
        max_length=300,
        num_return_sequences=1,
        no_repeat_ngram_size=2,
        top_k=50,
        top_p=0.95,
        temperature=0.7,
        pad_token_id=tokenizer.eos_token_id
    )
    plan_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    plan_lines = plan_text.split('. ')
    plan = [line.strip() for line in plan_lines if line.strip()]
    return plan

# 用 GPT-2 直接回答問題
def answer_question(question):
    prompt = f"Answer the following question in detail: {question}"
    inputs = tokenizer(prompt, return_tensors='pt', max_length=50, truncation=True)
    outputs = model.generate(
        inputs['input_ids'],
        max_length=150,  # 答案長度可調整
        num_return_sequences=1,
        no_repeat_ngram_size=2,
        top_k=50,
        top_p=0.95,
        temperature=0.7,
        pad_token_id=tokenizer.eos_token_id
    )
    answer_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    # 去掉 prompt 部分，只保留答案
    answer = answer_text.replace(prompt, '').strip()
    return answer

# 搜尋 YouTube 影片
def search_youtube(goal):
    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    req = youtube.search().list(q=f"{goal} tutorial", part='snippet', maxResults=3, type='video')
    res = req.execute()
    videos = [{'title': item['snippet']['title'], 'videoId': item['id']['videoId']} for item in res['items']]
    return videos