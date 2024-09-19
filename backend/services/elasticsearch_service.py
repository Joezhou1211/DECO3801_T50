from elasticsearch import Elasticsearch

'''
*** Instruction for Frontend team mates ***

Page Design Doc. Download ElasticSearch from https://www.elastic.co/downloads/elasticsearch.
2. Locate the downloaded file and open /config/elasticsearch.yml. Disable ElasticSearch authentication by setting xpack.security.enabled: true to xpack.security.enabled: false.
3. In terminal, cd to the elasticsearch-xx.xx.x file, run './bin/elasticsearch' in the terminal to start ElasticSearch (Port 9200). 
   Check if it started successfully by opening http://localhost:9200/.
4. Install the ElasticSearch module by running pip install elasticsearch.
5. Import data into ElasticSearch by running data_importer.py. First, obtain final_data.csv from sentiment.ipynb and convert it to final_data.json using CSV_to_Json.py.
6. Run main.py to start the server. Access http://localhost:5001 to view and interact with the search page.


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


es_service = ElasticSearchService('final_data_index')
