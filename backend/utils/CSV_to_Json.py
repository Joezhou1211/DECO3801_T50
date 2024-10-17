import pandas as pd

# read the data
file = '../../../../../DECO/data/processed/final_data(old).csv'  # path to the CSV file
df = pd.read_csv(file)

# to JSON
json_records = df.to_dict(orient='records')

# save the JSON data
with open('../../../../../DECO/data/processed/final_data(full).json', 'w') as f:  # path to the JSON file
    import json
    json.dump(json_records, f)
