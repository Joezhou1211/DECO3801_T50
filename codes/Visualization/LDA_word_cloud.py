from wordcloud import WordCloud
import matplotlib.pyplot as plt
from gensim import corpora, models

final_lda_model = models.LdaModel.load('../../models/lda_model.gensim')
dictionary = corpora.Dictionary.load('../../data/processed/dictionary.gensim')
corpus = corpora.MmCorpus('../../data/processed/corpus.mm')


# 自定义函数将所有词汇转换为大写
def to_upper_case(frequencies):
    return {word.upper(): freq for word, freq in frequencies.items()}


# 创建一个大图，将所有词云汇聚在一起
num_topics = final_lda_model.num_topics
fig, axes = plt.subplots(2, (num_topics + 1) // 2, figsize=(20, 10), sharex=True, sharey=True)

# 生成每个主题的词云并汇聚到一张图中
for i, ax in enumerate(axes.flatten()):
    if i < num_topics:
        topic_words = dict(final_lda_model.show_topic(i, 200))
        topic_words_upper = to_upper_case(topic_words)

        wordcloud = WordCloud(width=800, height=600,
                              background_color='white',
                              max_words=200,
                              contour_width=3,
                              contour_color='steelblue',
                              random_state=21,
                              max_font_size=110).generate_from_frequencies(topic_words_upper)

        ax.imshow(wordcloud, interpolation='bilinear')
        ax.set_title(f'Topic {i}', fontsize=16)
        ax.axis('off')
    else:
        ax.axis('off')

# 调整子图布局
plt.tight_layout()
plt.savefig('LDA_wordcloud.png', format='png', bbox_inches='tight')
plt.show()
