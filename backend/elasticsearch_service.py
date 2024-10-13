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
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ElasticSearchService:
    def __init__(self, index_name):
        self.es = Elasticsearch(hosts=["http://localhost:9200"])
        self.index_name = index_name

    def search(self, filters, page=1, page_size=50):
        """
        Perform a search with filters and return paginated results.
        """
        logger.info(f"Received filters: {filters}")

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

        # Text search
        if filters.get('query'):
            es_query["query"]["bool"]["must"].append({
                "match": {"text": filters['query']}
            })

        # Date range filter
        if filters.get('timeRangeStart') and filters.get('timeRangeEnd'):
            es_query["query"]["bool"]["filter"].append({
                "range": {
                    "created_at_dt": {
                        "gte": filters['timeRangeStart'],
                        "lte": filters['timeRangeEnd']
                    }
                }
            })

        # Location filter
        if filters.get('selectedLocations'):
            es_query["query"]["bool"]["filter"].append({
                "terms": {
                    "location": filters['selectedLocations']
                }
            })

        # Topic filter
        if filters.get('selectedTopics'):
            es_query["query"]["bool"]["filter"].append({
                "terms": {
                    "dominant_topic": filters['selectedTopics']
                }
            })

        # Numeric filters
        numeric_filters = {
            'retweet_count': 'retweet_count',
            'reply_count': 'reply_count',
            'quote_count': 'quote_count',
            'favourite_count': 'favourite_count',
            'influence_tweet_factor': 'influence_tweet_factor',
            'influence_user': 'influence_user',
            'extended_entities_count': 'extended_entities_count',
            'sentiment': 'sentiment'
        }

        for filter_key, es_field in numeric_filters.items():
            if filters.get(filter_key):
                filter_value = filters[filter_key]
                if isinstance(filter_value, dict):
                    range_query = {}
                    if 'min' in filter_value and isinstance(filter_value['min'], (int, float)):
                        range_query['gte'] = filter_value['min']
                    if 'max' in filter_value and isinstance(filter_value['max'], (int, float)):
                        range_query['lte'] = filter_value['max']
                    if range_query:
                        es_query["query"]["bool"]["filter"].append({
                            "range": {es_field: range_query}
                        })
                elif isinstance(filter_value, (int, float)):
                    es_query["query"]["bool"]["filter"].append({
                        "range": {es_field: {"gte": filter_value}}
                    })

        # Verified account filter
        if filters.get('verifiedAccount') and filters['verifiedAccount'] != 'all':
            es_query["query"]["bool"]["filter"].append({
                "term": {
                    "verified": filters['verifiedAccount'] == 'yes'
                }
            })

        # Node type filter
        if filters.get('nodeType') and filters['nodeType'] != 'all':
            es_query["query"]["bool"]["filter"].append({
                "term": {
                    "node_type": filters['nodeType']
                }
            })

        # Author keynode filter
        if filters.get('authorKeynode') and filters['authorKeynode'] != 'all':
            es_query["query"]["bool"]["filter"].append({
                "term": {
                    "author_keynode": filters['authorKeynode'] == 'yes'
                }
            })

        # Hashtag keynode filter
        if filters.get('hashtagKeynode') and filters['hashtagKeynode'] != 'all':
            es_query["query"]["bool"]["filter"].append({
                "term": {
                    "hashtag_keynode": filters['hashtagKeynode'] == 'yes'
                }
            })


        logger.info(f"Constructed ES query: {es_query}")

        try:
            response = self.es.search(index=self.index_name, body=es_query)
            results = []
            for hit in response['hits']['hits']:
                source = hit["_source"]
                source["_id"] = hit["_id"]
                results.append(source)
            return results
        except Exception as e:
            logger.error(f"Error executing ElasticSearch query: {str(e)}")
            raise

    def get_full_data(self, selected_ids):
        """
        Retrieve full data for download based on selected IDs.
        """
        if not selected_ids:
            logger.warning("No IDs provided for full data retrieval")
            return []

        es_query = {
            "query": {
                "terms": {
                    "_id": selected_ids
                }
            }
        }

        try:
            response = self.es.search(index=self.index_name, body=es_query, _source=True, size=len(selected_ids))
            full_data = [hit["_source"] for hit in response['hits']['hits']]
            return full_data
        except Exception as e:
            logger.error(f"Error retrieving full data: {str(e)}")
            raise


es_service = ElasticSearchService('final_data_index')