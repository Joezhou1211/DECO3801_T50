import pandas as pd

# read the data
file = '../../data/processed/final_data.csv'
df = pd.read_csv(file)

# save the data as JSON
json_records = df.to_dict(orient='records')

# save the JSON data
with open('../../data/processed/final_data.json', 'w') as f:
    import json
    json.dump(json_records, f)
