import pandas as pd
from elasticsearch import Elasticsearch, helpers
import numpy as np
'''
This script imports the processed data from the 'final_data.json'(for now only) file to the Elasticsearch index.
'''

# connect to the Elasticsearch cluster
es = Elasticsearch(hosts=["http://localhost:9200"])


index_name = 'final_data_index'
if not es.indices.exists(index=index_name):
    es.indices.create(index=index_name)

df = pd.read_csv('../../data/processed/final_data.csv')

# check if there are any NaN values in the dataframe
# final version should not have any NaN values
df = df.replace({np.nan: None})


records = df.to_dict(orient='records')

# import to the Elasticsearch index
helpers.bulk(es, records, index=index_name)

print(f"Data has been successfully imported to the '{index_name}' index.")
