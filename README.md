project-root/
│
├── backend/                        # 后端代码和服务
│   ├── notebooks/                  # Jupyter Notebooks，用于探索和原型设计
│   │   ├── NMF_modeling.ipynb
│   │   ├── Preprocess+LDA.ipynb
│   │   └── sentiment.ipynb
│   ├── services/                   # API服务和业务逻辑
│   │   └── elasticsearch_service.py  # Elasticsearch服务文件
│   ├── utils/                      # 实用工具和帮助函数
│   ├── main.py                     # 后端服务入口文件 (如果需要)
│
├── data/                           # 数据文件和数据集
│   ├── raw/                        # 原始数据
│   │   ├── v_forest.bson
│   │   └── v_forest.csv
│   ├── processed/                  # 处理后的数据
│   │   ├── corpus.mm
│   │   ├── corpus.mm.index
│   │   ├── dictionary.gensim
│   │   ├── final_nmf_model.pkl
│   │   ├── tweets_bushfire_related_keywords.csv
│   │   ├── tweets_with_final_nmf_topics_final.csv
│   │   └── tweets_with_topics.csv
│
├── docs/                           # 项目文档
│   └── README.md                   # 项目文档
│
├── frontend/                       # 前端代码
│   ├── vue-project/                # Vue.js 项目
│   │   ├── .vscode/                # VSCode 配置
│   │   ├── public/                 # 公共资源
│   │   │   └── favicon.ico
│   │   ├── src/                    # 源代码
│   │   │   ├── assets/             # 静态资源 (CSS, 图片等)
│   │   │   │   ├── base.css
│   │   │   │   ├── logo.svg
│   │   │   │   └── main.css
│   │   │   ├── components/         # Vue.js 组件
│   │   │   │   ├── icons/
│   │   │   │   │   ├── IconCommunity.vue
│   │   │   │   │   ├── IconDocumentation.vue
│   │   │   │   │   ├── IconEcosystem.vue
│   │   │   │   │   ├── IconSupport.vue
│   │   │   │   │   └── IconTooling.vue
│   │   │   ├── HelloWorld.vue      
│   │   │   ├── TheWelcome.vue      
│   │   │   └── WelcomeItem.vue     
│   │   │   ├── App.vue             # 主 Vue.js 应用文件   
│   │   │   └── main.js             # Vue.js 入口文件
│   │   ├── .gitignore
│   │   ├── index.html
│   │   ├── jsconfig.json
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── README.md
│   │   └── vite.config.js
│
├── models/                         # 训练的模型和脚本
│   ├── scripts/                    # 模型训练和评估脚本
│   │   └── AI训练（备用）.py
│   ├── trained/                    # 已训练的模型文件
│   │   ├── lda_model.gensim
│   │   ├── lda_model.gensim.expElogbeta.npy
│   │   ├── lda_model.gensim.id2word
│   │   └── lda_model.gensim.state
│
├── .gitattributes
├── .gitignore
├── README.md                       # 项目概述和使用说明
└── requirements.txt                # Python 依赖项
