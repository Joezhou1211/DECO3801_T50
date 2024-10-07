from elasticsearch import Elasticsearch

'''
*** Instruction for Frontend team mates ***

Page Design Doc. Download ElasticSearch from https://www.elastic.co/downloads/elasticsearch.
2. Locate the downloaded file and open /config/elasticsearch.yml. Disable ElasticSearch authentication by setting xpack.security.enabled: true to xpack.security.enabled: false.
3. In terminal, cd to the elasticsearch-xx.xx.x file, run './bin/elasticsearch' in the terminal to start ElasticSearch (Port 9200). 
   Check if it started successfully by opening http://localhost:9200/.
4. Install the ElasticSearch module by running pip install elasticsearch.
5. Import data into ElasticSearch by running data_importer.py. First, obtain final_data.csv from sentiment.ipynb and convert it to final_data.json using CSV_to_Json.py.
6. Run app.py to start the server. Access http://localhost:5001 to view and interact with the search page.


Next phase backend update plan:
Containerize ElasticSearch deployment using Docker.
Use Nginx for interface mapping.
Expand data frame interfaces based on frontend requirements.
'''


class ElasticSearchService:
    def __init__(self, index_name):
        self.es = Elasticsearch(hosts=["http://localhost:9200"])   # connect to ElasticSearch
        self.index_name = index_name

    def search(self, query):  # search text field and return id and text
        """
        This function used on all pages to search for a query in the Elasticsearch index.
        :param query: The query to search for.
        :return: A list of search results.
        """
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
        for hit in response['hits']['hits']:
            results.append({
                "id": hit["_id"],
                "text": hit["_source"]["text"]
            })
        return results

    def get_top_topics_by_day(self, date):
        """
        This function is used to get the top topics for a given date.
        :param date:
        :return:
        """
        # Elasticsearch 聚合查询
        es_query = {
            "query": {
                "term": {"date": date}  # 根据日期过滤
            },
            "size": 10,  # 限制每天10个主题
            "sort": [
                {"tweet_count": "desc"}  # 按推文数量降序排列
            ]
        }

        response = self.es.search(index=self.index_name, body=es_query)

        # 处理结果，提取需要的字段
        results = []
        for hit in response['hits']['hits']:
            source = hit["_source"]
            results.append({
                "date": source["date"],
                "topic_name": source["topic_name"],
                "reply": source["reply_count"],
                "share": source["retweet_count"],
                "like": source["favourite_count"],
                "quote_count": source["quote_count"],
                "location": self.get_top_locations(source["location_counts"]),
                "positive_percentage": source["positive_percentage"],
                "neutral_percentage": source["neutral_percentage"],
                "negative_percentage": source["negative_percentage"],
                "fake_news_count": source["fake_news_count"],
                "fake_news_percentage": source["fake_news_percentage"],
                "dominant_sentiment": source["dominant_sentiment"],
                "tweet_count": source["tweet_count"]
            })
        return results

es_service = ElasticSearchService('final_data_index')
