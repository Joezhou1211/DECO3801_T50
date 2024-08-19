import pandas as pd

# read the data
file = '../../data/processed/final_data.csv'  # path to the CSV file
df = pd.read_csv(file)

# to JSON
json_records = df.to_dict(orient='records')

# save the JSON data
with open('../../data/processed/final_data.json', 'w') as f:  # path to the JSON file
    import json
    json.dump(json_records, f)
