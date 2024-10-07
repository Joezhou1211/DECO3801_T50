from flask import Flask, render_template, send_from_directory
import os
from flask_cors import CORS
from backend.routes.api_routes import api

# 设置 Flask 应用
app = Flask(
    __name__,
    static_folder='../frontend/assets',  # 提供其他静态文件（如图片等）
    template_folder='../frontend/pages'  # HTML 页面路径
)

CORS(app)

# 注册 API 蓝图
app.register_blueprint(api, url_prefix='/api')


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


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
