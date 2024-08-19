from flask import Blueprint, request, jsonify
from backend.services.elasticsearch_service import es_service

api = Blueprint('api', __name__)


# Route to search for a query in the Elasticsearch index
@api.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')
    try:
        results = es_service.search(query)
        return jsonify(results)
    except Exception as e:
        print(f"Error during search: {e}")
        return jsonify({"error": str(e)}), 500