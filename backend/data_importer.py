import pandas as pd
from elasticsearch import Elasticsearch, helpers
import numpy as np

'''
This script imports the processed data from the final_data.csv file to the Elasticsearch index.
'''

# Connect to the Elasticsearch cluster
es = Elasticsearch(hosts=["http://localhost:9200"])

# Define the index name
index_name = 'final_data_index'

# Delete the existing index if it exists
if es.indices.exists(index=index_name):
    es.indices.delete(index=index_name)
    print(f"Old index '{index_name}' deleted.")

# Create a new index
es.indices.create(index=index_name)
print(f"New index '{index_name}' created.")

# Read the CSV file into a DataFrame
df = pd.read_csv('../data/processed/final_data(old).csv')

# Replace NaN values with None
df = df.replace({np.nan: None})

# Convert DataFrame to a list of dictionaries (records)
records = df.to_dict(orient='records')

# Bulk import the data to Elasticsearch
helpers.bulk(es, records, index=index_name)

print(f"Data has been successfully imported to the '{index_name}' index.")
