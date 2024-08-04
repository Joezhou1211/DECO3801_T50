import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF

# 加载数据
df = pd.read_csv('tweets_with_topics.csv')

# 检查并处理缺失值
df['cleaned_text'] = df['cleaned_text'].fillna('')

# 确保所有数据都是字符串类型
df['cleaned_text'] = df['cleaned_text'].astype(str)


# 使用 TfidfVectorizer 将文本转换为TF-IDF矩阵
vectorizer = TfidfVectorizer(
    max_features=2000,          # 最大特征数量
    stop_words='english',       # 使用英语停用词
    ngram_range=(1, 2),         # 提取单词和双词短语
    max_df=0.95,                # 忽略在95%以上文档中出现的词汇
    min_df=5                    # 忽略在少于5个文档中出现的词汇
)
tfidf_matrix = vectorizer.fit_transform(df['cleaned_text'])

# 训练 NMF 模型
num_topics = 10
nmf_model = NMF(n_components=num_topics, random_state=1)
W = nmf_model.fit_transform(tfidf_matrix)
H = nmf_model.components_
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
# 将每个推文的主题分布添加到数据框中
for i in range(num_topics):
    df[f'topic_{i}'] = W[:, i]

# 显示数据框的前几行
df.head()

# 保存结果
df.to_csv('tweets_with_nmf_topics.csv', index=False)