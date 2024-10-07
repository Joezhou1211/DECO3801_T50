import requests

# 配置 News API 的密钥
NEWS_API_KEY = 'fea2c064a1934601b064b4822e07b65f'
NEWS_API_URL = 'https://newsapi.org/v2/everything'


def search_news(query):
    params = {
        'q': query,
        'apiKey': NEWS_API_KEY,
        'language': 'en',
        'sortBy': 'relevancy',
    }

    response = requests.get(NEWS_API_URL, params=params)
    news_data = response.json()

    if news_data.get('status') == 'ok':
        return [
            {
                'title': article['title'],
                'source': article['source']['name'],
                'url': article['url']
            }
            for article in news_data['articles']
        ]

    return []
