from flask import Blueprint, request, jsonify
from backend.services.elasticsearch_service import es_service
from backend.services.news_search import search_news
from backend.services.text_analysis import analyze_text_similarity, analyze_source_trustworthiness

api = Blueprint('api', __name__)

@api.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')
    try:
        results = es_service.search(query)
        return jsonify(results)
    except Exception as e:
        print(f"Error during search: {e}")
        return jsonify({"error": str(e)}), 500


@api.route('/topics_by_day', methods=['GET'])
def get_topics_by_day():
    date = request.args.get('date')
    try:
        results = es_service.get_top_topics_by_day(date)
        return jsonify(results)
    except Exception as e:
        print(f"Error during topic retrieval: {e}")
        return jsonify({"error": str(e)}), 500


@api.route('/check-news', methods=['POST'])
def check_news():
    data = request.json
    query = data.get('query')

    if not query:
        return jsonify({"error": "No query provided"}), 400

    news_results = search_news(query)

    if not news_results:
        return jsonify({"message": "No related news found."})

    analysis_results = []
    for news in news_results:
        similarity_score = analyze_text_similarity(query, news['title'])
        source_trustworthiness = analyze_source_trustworthiness(news['source'])
        credibility_score = 0.5 * similarity_score + 0.5 * source_trustworthiness

        analysis_results.append({
            "title": news['title'],
            "source": news['source'],
            "url": news['url'],
            "similarity_score": similarity_score,
            "source_trustworthiness": source_trustworthiness,
            "credibility_score": credibility_score
        })

    return jsonify(analysis_results)