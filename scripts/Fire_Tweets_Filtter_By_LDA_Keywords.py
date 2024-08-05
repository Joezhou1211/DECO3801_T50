import pandas as pd

# 在执行LDA_visualization.py后得到了LDA_visualization.html文件 从其中总结出以下和山火相关新闻关键词
# 使用这些关键词
bushfire_keywords = [
    "climate", "change", "climatechange", "australia", "climateemergency", "climatecrisis",
    "bushfiredisaster", "australfires", "fire", "australian", "bushfires", "australiaburns",
    "scottmorrisonmp", "help", "support", "please", "donation", "team", "relief", "thanks",
    "charity", "australians", "affected", "wildlife", "fund", "fundraiser", "supporting",
    "australfire", "australiaburning", "koala", "animal", "love", "save", "firefighter",
    "proceeds", "nature", "bushfireaustralia", "nsw", "nswfires", "storm", "rain", "vicfires",
    "victoria", "warning", "weather", "community", "road", "update", "emergency", "state",
    "flood", "coast", "severe", "drought", "scottmorrison", "government", "bushfirecrisis",
    "climateemergency", "bushfiresaustralia", "kangaroo", "homes", "lost", "species", "extinction",
    "smoke", "bushfirecrisisaustralia", "melbourne", "recovery", "air", "good", "quality", "water",
    "bbc", "biodiversity", "canberra", "info", "watch", "advice", "rainfall", "insurance",
    "conservation"
]


# 加载数据
file_path = '/mnt/data/tweets_with_topics.csv'
df = pd.read_csv(file_path)

# 使用关键词过滤推文
df_bushfire_related = df[df['text'].str.contains('|'.join(bushfire_keywords), case=False, na=False)]

# 将过滤后的数据保存到新的CSV文件
output_path = '/mnt/data/tweets_bushfire_related_keywords.csv'
df_bushfire_related.to_csv(output_path, index=False, encoding='utf-8-sig')

print(f"保留了 {len(df_bushfire_related)} 条与山火相关的推文")
