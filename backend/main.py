from flask import Flask, send_from_directory
from routes.api_routes import api
from flask_cors import CORS

app = Flask(__name__, static_url_path='', static_folder='static')

CORS(app)

app.register_blueprint(api, url_prefix='/api')


@app.route('/')
def serve_static():
    return send_from_directory(app.static_folder, 'search.html')
# 访问http://localhost:5001 接口  如果访问192.168.0.Page Design Doc:5001/接口会报错（CROS） 后期使用Nginx进行接口映射
# 用之前需要看一下elasticsearch_service.py的备注


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)


