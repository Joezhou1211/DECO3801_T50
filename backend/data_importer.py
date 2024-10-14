import pandas as pd
from elasticsearch import Elasticsearch, helpers

es = Elasticsearch(hosts=["http://localhost:9200"])

index_name = 'data_index'

if es.indices.exists(index=index_name):
    es.indices.delete(index=index_name)

es.indices.create(index=index_name)

df = pd.read_csv('../data/processed/Search_data.csv', parse_dates=['created_at_dt'])

records = df.to_dict(orient='records')

try:
    helpers.bulk(es, records, index=index_name)
except helpers.BulkIndexError as e:
    for error in e.errors:
        print(f"Failed document: {error}")

print(f"Data has been successfully imported to the '{index_name}' index.")