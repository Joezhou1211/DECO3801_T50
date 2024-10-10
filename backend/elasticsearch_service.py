"""
*** Instruction for Frontend team mates ***

Page Design Doc. Download ElasticSearch from https://www.elastic.co/downloads/elasticsearch.
2. Locate the downloaded file and open /config/elasticsearch.yml. Disable ElasticSearch authentication by setting xpack.security.enabled: true to xpack.security.enabled: false.
3. In terminal, '''cd to the elasticsearch-xx.xx.x file''', run '''./bin/elasticsearch''' in the terminal to start ElasticSearch (Port 9200).
   Check if it started successfully by opening http://localhost:9200/.
4. Install the ElasticSearch module by running pip install elasticsearch.
5. Import data into ElasticSearch by running data_importer.py. First, obtain final_data(old).csv from sentiment.ipynb and convert it to final_data.json using CSV_to_Json.py.
6. Run app.py to start the server. Access http://localhost:5001 to view and interact with the search page.


Next phase backend update plan:
Containerize ElasticSearch deployment using Docker.
Use Nginx for interface mapping.
Expand data frame interfaces based on frontend requirements.
"""

from elasticsearch import Elasticsearch


class ElasticSearchService:
    def __init__(self, index_name):
        self.es = Elasticsearch(hosts=["http://localhost:9200"])
        self.index_name = index_name

    def search(self, filters, page=1, page_size=50):
        """
        Search with filters and return paginated results.
        """
        es_query = {
            "query": {
                "bool": {
                    "must": [],
                    "filter": []
                }
            },
            "_source": ["_id", "deidentname", "text", "created_at_dt", "location", "dominant_topic",
                        "sentiment", "influence_tweet_factor", "influence_user", "retweet_count",
                        "reply_count", "quote_count", "favourite_count", "node_type",
                        "author_keynode", "hashtag_keynode", "extended_entities_count", "verified"],
            "size": page_size,
            "from": (page - 1) * page_size
        }

        # 搜索文本内容
        if filters.get('query'):
            es_query["query"]["bool"]["must"].append({
                "match": {"text": filters['query']}
            })

        # 按照时间范围过滤
        if filters.get('timeRangeStart') and filters.get('timeRangeEnd'):
            es_query["query"]["bool"]["filter"].append({
                "range": {
                    "created_at_dt": {
                        "gte": filters['timeRangeStart'],
                        "lte": filters['timeRangeEnd']
                    }
                }
            })

        # 按照地点过滤
        if filters.get('selectedLocations'):
            es_query["query"]["bool"]["filter"].append({
                "terms": {
                    "location": filters['selectedLocations']
                }
            })

        # 按照主题过滤
        if filters.get('selectedTopics'):
            es_query["query"]["bool"]["filter"].append({
                "terms": {
                    "dominant_topic": filters['selectedTopics']
                }
            })

        # 按照情绪过滤
        if filters.get('sentiment'):
            es_query["query"]["bool"]["filter"].append({
                "range": {
                    "sentiment": {"gte": filters['sentiment']}
                }
            })

        # 其他数值过滤器
        numeric_filters = {
            'retweet_count': 'retweet_count',
            'reply_count': 'reply_count',
            'quote_count': 'quote_count',
            'favourite_count': 'favourite_count',
            'influence_tweet_factor': 'influence_tweet_factor',
            'influence_user': 'influence_user',
            'extended_entities_count': 'extended_entities_count'
        }

        for filter_key, es_field in numeric_filters.items():
            if filters.get(filter_key):
                es_query["query"]["bool"]["filter"].append({
                    "range": {
                        es_field: {"gte": filters[filter_key]}
                    }
                })

        # 按照是否认证用户过滤
        if filters.get('verifiedAccount') and filters['verifiedAccount'] != 'all':
            es_query["query"]["bool"]["filter"].append({
                "term": {
                    "verified": filters['verifiedAccount'] == 'yes'
                }
            })

        # 按照节点类型过滤
        if filters.get('nodeType') and filters['nodeType'] != 'all':
            es_query["query"]["bool"]["filter"].append({
                "term": {
                    "node_type": filters['nodeType']
                }
            })

        # 按照作者为关键节点过滤
        if filters.get('authorKeynode') and filters['authorKeynode'] != 'all':
            es_query["query"]["bool"]["filter"].append({
                "term": {
                    "author_keynode": filters['authorKeynode'] == 'yes'
                }
            })

        # 按照 hashtag 为关键节点过滤
        if filters.get('hashtagKeynode') and filters['hashtagKeynode'] != 'all':
            es_query["query"]["bool"]["filter"].append({
                "term": {
                    "hashtag_keynode": filters['hashtagKeynode'] == 'yes'
                }
            })

        # 执行搜索查询
        response = self.es.search(index=self.index_name, body=es_query)
        results = []
        for hit in response['hits']['hits']:
            source = hit["_source"]
            source["_id"] = hit["_id"]  # Include _id for internal use (indexing)
            results.append(source)
        return results

    def get_full_data(self, selected_ids):
        """
        Get full data for download based on selected IDs.
        """
        es_query = {
            "query": {
                "terms": {
                    "_id": selected_ids
                }
            }
        }
        response = self.es.search(index=self.index_name, body=es_query, _source=True, size=len(selected_ids))
        full_data = [hit["_source"] for hit in response['hits']['hits']]
        return full_data


es_service = ElasticSearchService('final_data_index')


