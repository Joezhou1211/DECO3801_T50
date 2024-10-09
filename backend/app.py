from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import logging
from flask_cors import CORS
from elasticsearch_service import es_service
from news_service import analyze_event

# 设置 Flask 应用
app = Flask(
    __name__,
    static_folder='../frontend/assets',  # 提供其他静态文件（如图片等）
    template_folder='../frontend/pages'  # HTML 页面路径
)

# 启用 CORS，允许所有来源和请求方法
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


# 首页路由
@app.route('/')
def index():
    return render_template('index.html')


# 提供所有 HTML 页面路由，支持 /index.html、/map.html 等
@app.route('/<page>.html')
def render_page(page):
    return render_template(f'{page}.html')


# 提供 js 文件
@app.route('/js/<path:filename>')
def serve_js(filename):
    js_dir = os.path.join(os.path.dirname(__file__), '../frontend/js')
    return send_from_directory(js_dir, filename)


# 提供 css 文件
@app.route('/css/<path:filename>')
def serve_css(filename):
    css_dir = os.path.join(os.path.dirname(__file__), '../frontend/css')
    return send_from_directory(css_dir, filename)


# 提供 assets 文件（如图片等）
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)


# 提供 data/processed 路径的文件
@app.route('/data/processed/<path:filename>')
def serve_data(filename):
    data_dir = os.path.join(os.path.dirname(__file__), '../data/processed')
    return send_from_directory(data_dir, filename)


# API 路由 - 搜索
@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('query')
    try:
        results = es_service.search(query)
        return jsonify(results)
    except Exception as e:
        logger.error(f"Error during search: {e}")
        return jsonify({"error": str(e)}), 500


# API 路由 - 按天获取主题
@app.route('/api/topics_by_day', methods=['GET'])
def get_topics_by_day():
    date = request.args.get('date')
    try:
        results = es_service.get_top_topics_by_day(date)
        return jsonify(results)
    except Exception as e:
        logger.error(f"Error during topic retrieval: {e}")
        return jsonify({"error": str(e)}), 500


# API 路由 - 检查新闻真实性
@app.route('/api/check-news', methods=['POST', 'OPTIONS'])
def analyze_news():
    # 处理 OPTIONS 预检请求
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
