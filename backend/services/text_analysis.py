from sentence_transformers import SentenceTransformer, util

# 加载 Sentence-BERT 模型
model = SentenceTransformer('all-MiniLM-L6-v2')


# 用于计算文本相似度
def analyze_text_similarity(input_text, news_title):
    # 获取输入文本和新闻标题的嵌入向量
    input_embedding = model.encode(input_text, convert_to_tensor=True)
    title_embedding = model.encode(news_title, convert_to_tensor=True)

    # 计算余弦相似度
    similarity_score = util.cos_sim(input_embedding, title_embedding).item()
    return round(similarity_score, 2)


# 假设一个预先定义好的可信度评分
SOURCE_TRUSTWORTHINESS = {
    'BBC News': 0.9,
    'Reuters': 0.8,
    'Unknown Source': 0.4,
}


# 用于分析新闻来源可信度
def analyze_source_trustworthiness(source_name):
    return SOURCE_TRUSTWORTHINESS.get(source_name, 0.5)

