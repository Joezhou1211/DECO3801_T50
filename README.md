# Project Structure

```plaintext
t50_project/
├── backend/
│   ├── notebooks/
│   │   ├── NMF_modeling.ipynb
│   │   ├── Preprocess+LDA.ipynb
│   │   ├── sentiment.ipynb
│   ├── routes/
│   │   ├── api_routes.py
│   ├── services/
│   │   ├── data_importer.py
│   │   ├── elasticsearch_service.py
│   ├── static/
│   │   ├── search.html
│   ├── utils/
│   │   ├── CSV_to_Json.py
│   │   ├── LDA_visualization.html
│   │   ├── LDA_wordcloud.png
│   │   ├── 时间序列分析.py
│   ├── main.py
├── data/
│   ├── processed/
│   │   ├── corpus.mm
│   │   ├── corpus.mm.index
│   │   ├── daily_weighted_sentiment_vader.csv
│   │   ├── dictionary.gensim
│   │   ├── final_data.csv
│   │   ├── final_data.json
│   │   ├── final_nmf_model.pkl
│   │   ├── hourly_weighted_sentiment_vader.csv
│   │   ├── tweets_bushfire_related_keywords.csv
│   │   ├── tweets_with_final_nmf_topics_final.csv
│   │   ├── tweets_with_topics.csv
│   ├── raw/
│   │   ├── v_forest.bson
│   │   ├── v_forest.csv
├── frontend/
│   ├── vue-project/
│   │   ├── .vscode/
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   │   ├── base.css
│   │   │   │   ├── logo.svg
│   │   │   │   ├── main.css
│   │   │   ├── components/
│   │   │   │   ├── icons/
│   │   │   │   │   ├── IconCommunity.vue
│   │   │   │   │   ├── IconDocumentation.vue
│   │   │   │   │   ├── IconEcosystem.vue
│   │   │   │   │   ├── IconSupport.vue
│   │   │   │   │   ├── IconTooling.vue
│   │   │   ├── App.vue
│   │   │   ├── main.js
│   │   ├── .gitignore
│   │   ├── index.html
│   │   ├── jsconfig.json
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── README.md
│   │   ├── vite.config.js
│   ├── 2.css
│   ├── 2.html
│   ├── 2.js
│   ├── 3.css
│   ├── 4.css
│   ├── 4.html
│   ├── 5.html
│   ├── 5.js
│   ├── 6.html
│   ├── index.html
│   ├── logIn.html
│   ├── main.js
│   ├── styles.css
│   ├── user_icon.png
│   ├── map.js
├── models/
│   ├── scripts/
│   │   ├── AI训练（备用）.py
│   ├── trained/
│   │   ├── lda_model.gensim
│   │   ├── lda_model.gensim.expElogbeta.npy
│   │   ├── lda_model.gensim.id2word
│   │   ├── lda_model.gensim.state
├── .gitattributes
├── .gitignore
└── README.md
