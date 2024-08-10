from elasticsearch import Elasticsearch

'''
启用ElasticSearch并在前端执行搜索的方法（前端示例页面已完成: backend/static/index.html）
1. 下载ElasticSearch：https://www.elastic.co/downloads/elasticsearch
2. 找到下载的文件 打开/config/elasticsearch.yml: xpack.security.enabled: true -> xpack.security.enabled: false禁用elasticsearch的验证功能 
3. 终端运行‘ ./bin/elasticsearch ’ 启动ElasticSearch （端口9200 打开http://localhost:9200/ 可查看是否启动成功）
4. 在pycharm运行pip install elasticsearch 安装elasticsearch模块
5. 运行data_importer.py导入数据到ElasticSearch （需要先在sentiment.ipynb获取final_data.csv 并使用CSV_to_Json.py转换为final_data.json）
6. 运行main.py服务器 访问http://localhost:5001 可查看搜索页面并交互


后端更新备注：
使用docker容器化部署ElasticSearch
使用Nginx进行接口映射
根据前端需求拓展数据框接口
'''


class ElasticSearchService:
    def __init__(self, index_name):
        # 连接ElasticSearch实例
        self.es = Elasticsearch(hosts=["http://localhost:9200"])
        self.index_name = index_name

    def search(self, query):
        # 搜索text字段，返回id和text字段
        es_query = {
            "query": {
                "match": {
                    "text": query
                }
            },
            "_source": ["text"]
        }
        response = self.es.search(index=self.index_name, body=es_query)
        results = []
        for hit in response['hits']['hits']:  # 遍历搜索结果
            results.append({
                "id": hit["_id"],
                "text": hit["_source"]["text"]
            })
        return results


# 实例化
es_service = ElasticSearchService('final_data_index')
