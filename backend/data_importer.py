import pandas as pd
from elasticsearch import Elasticsearch, helpers
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CLOUD_ID = "500471660de245d89d7b444aee7b06b3:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDBkM2I2YjQ1MTZlNjQ1NDE4MGM2OTA1YjJhNTE5MjczJGE4YTI4M2UwYmU2NjQ4NzFiMzY0YjcxNTM1YjhkNzFj"
API_KEY = "MjEydmlwSUJxRDFPeEJTNEFHYXc6RkdqaEl1QUJTNDJzR0E1S2ZfTTNsZw=="

es = Elasticsearch(
    cloud_id=CLOUD_ID,
    api_key=API_KEY
)

index_name = 'final_data_index'

if es.ping():
    logger.info("Connected to Elasticsearch")
else:
    logger.error("Could not connect to Elasticsearch")
    exit()

if es.indices.exists(index=index_name):
    es.indices.delete(index=index_name)
    logger.info(f"Deleted existing index: {index_name}")

es.indices.create(index=index_name)
logger.info(f"Created new index: {index_name}")

df = pd.read_csv('../data/processed/Search_data.csv', parse_dates=['created_at_dt'])
logger.info(f"Read {len(df)} records from CSV file")

records = df.to_dict(orient='records')

try:
    success, failed = helpers.bulk(es, records, index=index_name, raise_on_error=False)
    logger.info(f"Successfully imported {success} documents")
    if failed:
        logger.warning(f"Failed to import {len(failed)} documents")
        for error in failed:
            logger.error(f"Failed document: {error}")
except Exception as e:
    logger.error(f"Error during bulk import: {str(e)}")

count = es.count(index=index_name)
logger.info(f"Total documents in index after import: {count['count']}")

print(f"Data import process completed for index '{index_name}'.")