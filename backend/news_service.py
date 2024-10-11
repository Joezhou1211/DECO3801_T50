import google.generativeai as genai
from model_service import evaluate_news
from eventregistry import *
import requests

# Hardcoded API keys for demonstration purposes only
GENAI_API_KEY = 'AIzaSyDwDxPL00xsuAVFSPq6xIm3Iusln_Tk36M'
NEWS_API_KEY = 'fea2c064a1934601b064b4822e07b65f'
NEWSDATA_API_KEY = 'pub_555993741a58f73bc697735b9f243cb07692c'
EVENT_REGISTRY_API_KEY = 'a78a8d8f-fa26-4946-9a8a-46527cc47f1b'
GOOGLE_API_KEY = 'AIzaSyDX_Dzwj154NXJ2x1n6YhPELMWUjm6qxUc'
GOOGLE_CSE_ID = '4227cd65499e8472a'


# Gemini Configuration
def configure_gemini() -> genai.GenerativeModel:
    genai.configure(api_key=GENAI_API_KEY)

    generation_config = {
        "temperature": 0.3,
        "top_p": 0.9,
        "top_k": 40,
        "max_output_tokens": 10240,
        "response_mime_type": "text/plain"
    }

    gemini_model = genai.GenerativeModel(
        model_name="gemini-1.5-pro-002",
        generation_config=generation_config
    )
    return gemini_model

gemini_model = configure_gemini()


# Use the Gemini model to optimize the query
def gemini_optimize_query(query: str) -> str:
    prompt = (
        "Extract key information from the input to optimize it for a news search. "
        "Include the event, location, people, time, and any important details, "
        "and restructure them into a single concise sentence.\n"
        "Only return this refined query as a single sentence without any additional text.\n\n"
        f"Input: {query}"
    )

    chat_session = gemini_model.start_chat(history=[])
    response = chat_session.send_message(prompt)

    optimized_query = response.text.strip()
    logger.info(f"Optimized Query: {optimized_query}")
    return optimized_query


# Search Google News for relevant articles
def search_google_news(query: str):
    GOOGLE_API_URL = 'https://customsearch.googleapis.com/customsearch/v1'

    params = {
        'q': query,
        'key': GOOGLE_API_KEY,
        'cx': GOOGLE_CSE_ID,
        'num': 5,
        'safe': 'off',
    }

    try:
        response = requests.get(GOOGLE_API_URL, params=params, timeout=20)
        response.raise_for_status()
        search_data = response.json()

        # 提取搜索结果
        articles = []
        for item in search_data.get('items', []):
            metatags = item.get('pagemap', {}).get('metatags', [{}])[0]
            published_at = metatags.get('article:published_time', '')

            articles.append({
                'title': item.get('title', ''),
                'description': item.get('snippet', ''),
                'link': item.get('link', ''),
                'publishedAt': published_at
            })

        return articles
    except requests.exceptions.HTTPError as http_err:
        logger.error(f"HTTP error occurred: {http_err}")
    except Exception as e:
        logger.error(f"Error fetching news from Google Custom Search API: {e}")
    return []


# Combine results from multiple news sources
def aggregate_news_results(query: str):
    google_news = search_google_news(query)
    # 其他的搜索源查询函数也应该在此调用
    all_news = google_news  # 假设您集成了其他新闻来源

    # 去重
    unique_titles = list({article['title']: article for article in all_news}.values())
    return {i + 1: article for i, article in enumerate(unique_titles)}


# Analyze the event using the Gemini-1.5 model
def analyze_event(query: str):
    optimized_query = gemini_optimize_query(query)
    news_articles = aggregate_news_results(optimized_query)

    if not news_articles:
        return {
            "optimized_query": optimized_query,
            "evaluation": {
                "probability": 100.0,
                "reason": "No relevant news found. This suggests that the original news might be fake."
            }
        }

    evaluation = evaluate_news(query, news_articles)

    return {
        "optimized_query": optimized_query,
        "evaluation": evaluation
    }
