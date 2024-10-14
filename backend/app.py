from flask import Flask, request, jsonify, render_template, send_from_directory, send_file, Response
import os
import logging
from flask_cors import CORS
from elasticsearch_service import es_service
from news_service import analyze_event
import pandas as pd
import io
import csv


app = Flask(__name__, static_folder='../frontend/assets', template_folder='../frontend/pages')


CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/<page>.html')
def render_page(page):
    return render_template(f'{page}.html')


@app.route('/js/<path:filename>')
def serve_js(filename):
    js_dir = os.path.join(os.path.dirname(__file__), '../frontend/js')
    return send_from_directory(js_dir, filename)


@app.route('/css/<path:filename>')
def serve_css(filename):
    css_dir = os.path.join(os.path.dirname(__file__), '../frontend/css')
    return send_from_directory(css_dir, filename)


@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)


@app.route('/data/processed/<path:filename>')
def serve_data(filename):
    data_dir = os.path.join(os.path.dirname(__file__), '../data/processed')
    return send_from_directory(data_dir, filename)


@app.route('/api/search', methods=['POST'])
def search():
    filters = request.json
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 50))
    
    logger.info(f"Received search request. Page: {page}, Page Size: {page_size}, Filters: {filters}")
    
    try:
        results = es_service.search(filters, page=page, page_size=page_size)
        logger.info(f"Search completed. Total results: {results['total']}")
        return jsonify(results)
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        logger.exception("Full traceback:")
        return jsonify({"error": str(e)}), 500


@app.route('/api/download', methods=['POST'])
def download():
    selected_ids = request.json.get('selected_ids', [])
    if not selected_ids:
        return jsonify({"error": "No IDs provided"}), 400

    try:
        full_data = es_service.get_data(selected_ids)
        df = pd.DataFrame(full_data)

        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)

        return send_file(io.BytesIO(output.getvalue().encode('utf-8')),
                     mimetype='text/csv',
                     as_attachment=True,
                     download_name='selected_data.csv')
    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/download-all', methods=['GET'])
def download_all():
    try:
        full_data = es_service.get_all_data()

        def generate():
            data = io.StringIO()
            writer = csv.writer(data)
            
            if full_data:
                writer.writerow(full_data[0].keys())
            
            for row in full_data:
                writer.writerow(row.values())
                data.seek(0)
                yield data.read()
                data.seek(0)
                data.truncate(0)

        response = Response(generate(), mimetype='text/csv')
        response.headers.set("Content-Disposition", "attachment", filename="all_data.csv")
        return response
    except Exception as e:
        logger.error(f"Download all error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/locations', methods=['GET'])
def get_locations():
    try:
        locations = es_service.get_unique_locations()
        print("Fetched locations:", locations)  # 添加这行来打印获取的位置
        return jsonify(locations)
    except Exception as e:
        print("Error fetching locations:", str(e))  # 添加这行来打印错误
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/check-news', methods=['POST', 'OPTIONS'])
def analyze_news():
    if request.method == 'OPTIONS':
        response = jsonify({"message": "Preflight CORS check"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response, 200

    data = request.json
    if 'query' not in data:
        return jsonify({"error": "Query parameter is required"}), 400

    query = data['query']
    logger.info(f"Received query for analysis: {query}")

    try:
        results = analyze_event(query)
        return jsonify(results), 200
    except Exception as e:
        logger.error(f"Error analyzing query: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
