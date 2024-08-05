import pyLDAvis
import pyLDAvis.gensim_models as gensimvis
from gensim import corpora, models

final_lda_model = models.LdaModel.load('../models/lda_model.gensim')
dictionary = corpora.Dictionary.load('../data/processed/dictionary.gensim')
corpus = corpora.MmCorpus('../data/processed/corpus.mm')

# 准备pyLDAvis数据，关闭并行处理
lda_display = gensimvis.prepare(final_lda_model, corpus, dictionary)

# 显示可视化界面
pyLDAvis.display(lda_display)

# 保存可视化结果到HTML文件
pyLDAvis.save_html(lda_display, 'LDA_visualization.html')
print("LDA visualization saved as HTML.")