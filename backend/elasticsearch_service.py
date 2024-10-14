from elasticsearch import Elasticsearch
import logging

CLOUD_ID = "500471660de245d89d7b444aee7b06b3:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDBkM2I2YjQ1MTZlNjQ1NDE4MGM2OTA1YjJhNTE5MjczJGE4YTI4M2UwYmU2NjQ4NzFiMzY0YjcxNTM1YjhkNzFj"
API_KEY = "MjEydmlwSUJxRDFPeEJTNEFHYXc6RkdqaEl1QUJTNDJzR0E1S2ZfTTNsZw=="

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ElasticSearchService:
    def __init__(self, index_name):
        self.es = Elasticsearch(
            cloud_id=CLOUD_ID,
            api_key=API_KEY
        )
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
            "size": page_size,
            "from": (page - 1) * page_size
        }

        # Text search
        if filters.get('query'):
            es_query["query"]["bool"]["must"].append({
                "match": {"text": filters['query']}
            })

        # Sorting 
        if filters.get('sort_field') and filters.get('sort_order'):
            es_query["sort"] = [{
                filters['sort_field']: {
                    "order": filters['sort_order']
                }
            }]

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
            es_query["query"]["bool"]["must"].append({
                "terms": {
                    "location.keyword": filters['selectedLocations']
                }
            })

        # Topic filter
        if filters.get('selectedTopics'):
            es_query["query"]["bool"]["filter"].append({
                "terms": {
                    "dominant_topic": [int(topic) for topic in filters['selectedTopics']]
                }
            })

        # Sentiment filter
        if filters.get('selectedSentiments'):
            es_query["query"]["bool"]["filter"].append({
                "terms": {
                    "sentiment.keyword": filters['selectedSentiments']
                }
            })

        # Numeric filters
        numeric_filters = {
            'retweetCount': 'retweet_count',
            'replyCount': 'reply_count',
            'quoteCount': 'quote_count',
            'favouriteCount': 'favourite_count',
            'influenceTweetFactor': 'influence_tweet_factor',
            'influenceUser': 'influence_user',
            'extendedEntities': 'extended_entities_count'
        }

        for filter_key, es_field in numeric_filters.items():
            if filters.get(filter_key):
                filter_value = filters[filter_key]
                if isinstance(filter_value, dict):
                    range_query = {}
                    if 'min' in filter_value:
                        range_query['gte'] = filter_value['min']
                    if 'max' in filter_value:
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

        # Time filter 
        if filters.get('sort_field') and filters.get('sort_order'):
            if filters['sort_field'] == 'created_at_dt':
                es_query["sort"] = [{
                    "created_at_dt": {
                        "order": filters['sort_order'],
                        "format": "strict_date_optional_time_nanos"
                    }
                }]
            else:
                es_query["sort"] = [{
                    filters['sort_field']: {
                        "order": filters['sort_order']
                            }
                        }]


        logger.info(f"Constructed ES query: {es_query}")

        try:
            count_query = {"query": es_query["query"]}
            count_response = self.es.count(index=self.index_name, body=count_query)
            total_count = count_response['count']

            es_query["_source"] = ["_id", "deidentname", "text", "created_at_dt", "location", "dominant_topic",
                                "sentiment", "influence_tweet_factor", "influence_user", "retweet_count",
                                "reply_count", "quote_count", "favourite_count", "node_type",
                                "author_keynode", "hashtag_keynode", "extended_entities_count", "verified"]
            response = self.es.search(index=self.index_name, body=es_query)
            results = []
            for hit in response['hits']['hits']:
                source = hit["_source"]
                source["_id"] = hit["_id"]
                results.append(source)
            logger.info(f"Found {total_count} Entries, returning page {page} with {len(results)} results")
            return {
                "total": total_count,
                "page": page,
                "page_size": page_size,
                "results": results
            }
        except Exception as e:
            logger.error(f"Error executing ElasticSearch query: {str(e)}")
            logger.exception("Full traceback:")
            raise

    def get_data(self, selected_ids):
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
            },
            "_source": True  
        }

        try:
            response = self.es.search(index=self.index_name, body=es_query, size=len(selected_ids))
            full_data = [hit["_source"] for hit in response['hits']['hits']]
            return full_data
        except Exception as e:
            logger.error(f"Error retrieving full data: {str(e)}")
            raise

    def get_all_data(self):
        """
        Retrieve all data from the index using the Scroll API.
        """
        try:
            results = []
            resp = self.es.search(
                index=self.index_name,
                body={"query": {"match_all": {}}},
                scroll='2m',  
                size=10000
            )

            scroll_id = resp['_scroll_id']
            results.extend([hit["_source"] for hit in resp['hits']['hits']])

            while len(resp['hits']['hits']):
                resp = self.es.scroll(scroll_id=scroll_id, scroll='2m')
                scroll_id = resp['_scroll_id']
                results.extend([hit["_source"] for hit in resp['hits']['hits']])

            return results
        except Exception as e:
            logger.error(f"Error retrieving all data: {str(e)}")
            raise
        
    def get_unique_locations(self):
        try:
            aggs_query = {
                "aggs": {
                    "unique_locations": {
                        "terms": {
                            "field": "location.keyword",
                            "size": 1000
                        }
                    }
                },
                "size": 0
            }

            response = self.es.search(index=self.index_name, body=aggs_query)
            locations = [bucket['key'] for bucket in response['aggregations']['unique_locations']['buckets']]
            return locations
        except Exception as e:
            print("Error in get_unique_locations:", str(e))  
            raise
    
es_service = ElasticSearchService('final_data_index')