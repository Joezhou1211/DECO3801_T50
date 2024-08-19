# DECO3801 Project 50T: Analyzing Misinformation on Twitter During the 2019-20 Australian Bushfires

## 1. Project Overview

### 1.1 Project Description
The 2019-20 Australian bushfires highlighted the vital role of social media platforms, particularly Twitter, in the dissemination of information and the expression of public sentiment. However, these platforms also became conduits for fake news and misinformation, which had the potential to exacerbate public anxiety and spread false narratives. This project is dedicated to analyzing nearly 500,000 tweets from this period to uncover genuine public reactions, identify key discussion topics, and assess the impact of misinformation.

Based on background research, the platform is specifically designed for media professionals, policymakers, and researchers who are keen to understand the public's response during this crisis. It focuses on identifying potential patterns of fake or misleading information by evaluating the credibility of shared content through methods such as detecting extreme sentiment scores, analyzing account statuses, and implementing fake news detection techniques. The findings will be presented via an interactive visual platform, enabling users to dynamically explore the data, grasp public sentiment, and recognize the role of misinformation during the bushfires. Ultimately, the platform aims to enhance users' understanding of public reactions during crises, inform media coverage and policy decisions, and strengthen the ability of researchers to critically evaluate misinformation.

### 1.2 Project Intent
This project endeavors to construct a rigorous analytical framework that bridges the gap between complex data analysis and the critical needs of media professionals, policymakers, and academic researchers. Through the visualization of emotional responses and the application of advanced methodologies for detecting misinformation, the platform will facilitate a nuanced understanding of the dynamics of public sentiment and the dissemination of false information during the bushfires. The goal of this project is to render sophisticated analytical insights accessible to these expert audiences, thereby enhancing their ability to critically assess the role of misinformation in shaping public discourse during crises.

## 3. Features and Technologies

### 3.1 Features to be Built
This project incorporates several key features to analyze and visualize the public sentiment and misinformation during the 2019-20 Australian bushfires. Sentiment analysis is implemented using VADER and TextBlob to assess the emotional tone of tweets. Topic modeling is conducted using Latent Dirichlet Allocation (LDA) to identify the main topics of discussion during the crisis. To detect fake news, we employ a range of machine learning models, including Logistic Regression, Random Forest, XGBoost, SVM, LSTM, and BERT. Finally, the project includes interactive data visualizations powered by ElasticSearch, enabling real-time data querying and filtering to provide users with a dynamic exploration of the tweet data.

### 3.2 Tools/Technologies/Frameworks
The project leverages a variety of tools and technologies across different stages of data processing, analysis, and visualization. Data processing is handled using Pandas, NLTK, TextBlob, and VADER, while natural language processing (NLP) and machine learning tasks are performed using TF-IDF, Word2Vec, BERT, Scikit-learn, TensorFlow, and Keras. For data visualization, the project utilizes D3.js, Chart.js, Plotly.js, Leaflet, and Mapbox. UX design is informed by research through Google Scholar and user interviews, with UI design executed using Sketch, Miro, and Figma. The backend infrastructure is built with Flask and ElasticSearch, while the frontend is developed using Vue.js, along with CSS, HTML, and JavaScript.

## 3. Project Structure

```plaintext
t50_project/                                          
├── backend/
│   ├── notebooks/                                    # ⬇ Execution Order (Smaller Number First)
│   │   ├── LDA_modeling_main+sub.ipynb               # 3.2  LDA topic modeling for both main and subtopics
│   │   ├── location.ipynb                            # 2.3  Analysis of tweet locations
│   │   ├── NMF_modeling.ipynb                        # 2.2  Non-negative matrix factorization for topic modeling
│   │   ├── pattern_regonisation & sampling.ipynb     # 3.1  Pattern recognition and sampling techniques
│   │   ├── preprocess+pre_LDA.ipynb                  # 1.1  Preprocessing and preliminary LDA modeling
│   │   ├── sentiment.ipynb                           # 2.1  Sentiment analysis of tweets
│   ├── routes/
│   │   ├── api_routes.py                             # API routes for backend services
│   ├── services/
│   │   ├── data_importer.py                          # Data import for Elasticsearch
│   │   ├── elasticsearch_service.py                  # Service to interact with Elasticsearch for data storage and retrieval
│   ├── static/
│   │   ├── search.html                               # Static HTML page for search functionality (for Elasticsearch testing) 
│   ├── utils/
│   │   ├── CSV_to_Json.py                            # Utility script to convert CSV files to JSON format
│   │   ├── LDA_wordcloud.png                         # Word cloud visualization for LDA topics
│   │   ├── main_LDA_visualization.html               # Main visualization of LDA topics
│   │   ├── pre_LDA_visualization.html                # Preliminary visualization of LDA topics
│   │   ├── Time_Series & Topic & Sentiment Analysis Graph.py  # Time series analysis of topics and sentiment
│   │   ├── time_squence_analysis.py                  # Time sequence analysis for sentiment and topic changes
│   ├── main.py                                       # Main entry point for server
├── data/
│   ├── processed/                                   
│   │   ├── daily_weighted_sentiment_vader.csv        # Daily aggregated sentiment scores from VADER
│   │   ├── final_data(filtered).json                 # Final filtered dataset in JSON format
│   │   ├── final_data.csv                            # Final dataset in CSV format
│   │   ├── final_data.json                           # Final dataset in JSON format
│   │   ├── hourly_weighted_sentiment_vader.csv       # Hourly aggregated sentiment scores from VADER
│   │   ├── location_counts.json                      # Counts of tweets by location
│   │   ├── tweets_bushfire_related_keywords.csv      # Tweets related to bushfire keywords
│   │   ├── tweets_with_final_nmf_topics_final.csv    # Tweets with final NMF topic assignments
│   │   ├── tweets_with_topics.csv                    # Tweets with topic assignments
│   ├── raw/
│   │   ├── v_forest.bson                             # Raw BSON data file (Original)
│   │   ├── v_forest.csv                              # Raw CSV data file (Original, for MongoDB only)
├── frontend/
│   ├── assets/
│   │   ├── user_icon.png                       
│   │   ├── statistics.png
│   │   ├── visible.png
│   │   ├── search-file.png                  
│   ├── css/
│   │   ├── map.css                                   # CSS for the map visualization
│   │   ├── network.css                               # CSS for the network visualization
│   │   ├── search.css
│   │   ├── Fstyle.css
│   │   ├── topics.css
│   ├── js/
│   │   ├── map.js                                    # JavaScript for the map visualization
│   │   ├── network.js                                # JavaScript for the network visualization
│   │   ├── map.js                                    # JavaScript for the map visualization
│   │   ├── search.js                                 # JavaScript for the search page
│   │   ├── topics.js                                 # JavaScript for the topics visualization
│   ├── pages/
│   │   ├── logIn.html                                # Login page
│   │   ├── map.html                                  # Map visualization page
│   │   ├── network.html                              # Network visualization page
│   │   ├── search.html                               # Search page
│   │   ├── topics.html                               # Topics visualization page
├── models/
│   ├── main_topics/
│   │   ├── corpus_subtopics                          # Corpus data for subtopics
│   │   ├── corpus_subtopics.index                    # Index file for subtopics corpus
│   │   ├── dictionary_subtopics                      # Dictionary of subtopics
│   │   ├── lda_model_subtopics                       # LDA model file for subtopics
│   │   ├── lda_model_subtopics.expElogbeta.npy       # Numpy array for LDA model beta values
│   │   ├── lda_model_subtopics.id2word               # Word-to-ID mapping for subtopics LDA model
│   │   ├── lda_model_subtopics.state                 # State file for subtopics LDA model
│   ├── pre_topics/
│   │   ├── corpus.mm                                 # Corpus data for pre-topics
│   │   ├── corpus.mm.index                           # Index file for pre-topics corpus
│   │   ├── dictionary.gensim                         # Gensim dictionary for pre-topics
│   │   ├── final_nmf_model.pkl                       # Pickle file for final NMF model
│   │   ├── lda_model.gensim                          # Gensim LDA model for pre-topics
│   │   ├── lda_model.gensim.expElogbeta.npy          # Numpy array for Gensim LDA model beta values
│   │   ├── lda_model.gensim.id2word                  # Word-to-ID mapping for Gensim LDA model
│   │   ├── lda_model.gensim.state                    # State file for Gensim LDA model
│   ├── scripts/
│   │   ├── BERT.ipynb                                # Jupyter notebook for BERT model training and analysis
├── .gitattributes                                    # Git attributes configuration
├── .gitignore                                        # Git ignore file for excluding unnecessary files from version control
└── README.md                                         # Project documentation (this file)
```

## 4. Getting Started
Not yet available.

## 5. Contributing
Not yet available.

## 6. Maybe Something Else Here? But Also Not yet available :(

