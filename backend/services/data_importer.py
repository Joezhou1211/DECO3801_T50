import pandas as pd
from elasticsearch import Elasticsearch, helpers
import numpy as np
import json
import os
'''
This script imports the processed data from the 'final_data.json'(暂定) file to the Elasticsearch index.
'''

# 连接到ElasticSearch
es = Elasticsearch(hosts=["http://localhost:9200"])

# 索引名称
index_name = 'final_data_index'

# 检查索引是否存在，不存在则创建
if not es.indices.exists(index=index_name):
    es.indices.create(index=index_name)

# 读取CSV并转换为JSON
df = pd.read_csv('../../data/processed/final_data.csv')

# 将 NaN 值替换为 None   后期最终数据不应该有Nan 而是全部清洗且简化过的 这里为测试
df = df.replace({np.nan: None})

# 转换为记录格式
records = df.to_dict(orient='records')

# 批量导入数据到ElasticSearch
helpers.bulk(es, records, index=index_name)

print(f"Data has been successfully imported to the '{index_name}' index.")
