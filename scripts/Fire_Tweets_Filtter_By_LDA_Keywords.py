import pandas as pd
# 在执行LDA_visualization.py后得到了LDA_visualization.html文件 从其中总结出以下和山火相关新闻关键词
# 使用这些关键词将推文进行过滤 保留与山火相关的推文

# 加载数据
df = pd.read_csv('../data/processed/tweets_with_topics.csv')

bushfire_keywords = [
    "bushfiredisaster", "australfires", "fire", "australianfires", "bushfires",
    "australiaburns", "australianbushfiredisaster", "australianbushfires",
    "australfire", "australiaburning", "koala", "animal", "australianwildfires",
    "australianbushfire", "firefighter", "bushfireaustralia", "nswfires", "vicfires",
    "bushfirecrisis", "bushfiresaustralia", "bushfirecrisisaustralia"
]

# 使用关键词过滤推文
df_bushfire_related = df[
    df['text'].str.contains('|'.join(bushfire_keywords), case=False, na=False)
]
# 将过滤后的数据保存到新的CSV文件
output_path = '../data/processed/tweets_bushfire_related_keywords.csv'
df_bushfire_related.to_csv(output_path, index=False, encoding='utf-8-sig')

print(len(df_bushfire_related))  # 158902
