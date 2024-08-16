import pandas as pd
import plotly.graph_objects as go

# Hour = 'created_at_hour'
# Day  = 'created_at_day'
time_frame = 'created_at_dt'

# 读取数据
df = pd.read_csv('../../data/processed/final_data.csv')
time_sequance = pd.read_csv('../../data/processed/daily_weighted_sentiment_vader.csv')  # 使用日级别的情绪数据

# 将时间戳转换为datetime格式，并指定格式
df['created_at'] = pd.to_datetime(df['created_at'], errors='coerce')
time_sequance[time_frame] = pd.to_datetime(time_sequance[time_frame], errors='coerce')

# 检查是否有Nan值并处理
df = df.dropna(subset=['created_at'])

# 按小时分组计算推特数量
df['hour'] = df['created_at'].dt.to_period('h')
tweet_counts = df.groupby('hour').size()
tweet_counts.index = tweet_counts.index.to_timestamp()

# 重要时间节点及其正负面评估
initial_events = {
    '2019-09-01 00:00:00': ['大火开始', 'N'],
    '2019-10-26 00:00:00': ['Gospers大火', 'N'],
    '2019-11-08 00:00:00': ['Nymboida火灾', 'N'],
    '2019-11-11 00:00:00': ['紧急状态', 'N'],
    '2019-12-20 00:00:00': ['东吉普斯兰火', 'N'],
    '2019-12-30 00:00:00': ['吉普斯兰火', 'N'],
    '2019-12-31 00:00:00': ['火灾合并', 'N'],
    '2020-01-01 00:00:00': ['小镇被困', 'N'],
    '2020-01-02 00:00:00': ['吉普斯兰蔓延', 'N'],
    '2020-01-03 00:00:00': ['袋鼠岛火', 'N'],
    '2020-01-04 00:00:00': ['彭里斯高温', 'N'],
    '2020-01-05 00:00:00': ['贝加谷火', 'N'],
    '2020-01-06 00:00:00': ['政府基金', 'P'],
    '2020-01-15 00:00:00': ['雷阵雨缓解', 'P'],
    '2020-01-23 00:00:00': ['飞机坠毁', 'N'],
    '2020-02-09 00:00:00': ['猛烈降雨', 'P'],
    '2020-03-04 00:00:00': ['火灾扑灭', 'P'],
    '2020-05-01 00:00:00': ['最后火灾', 'P']
}

# 创建图表
fig = go.Figure()

# 添加推特数量时间序列
fig.add_trace(go.Scatter(x=tweet_counts.index, y=tweet_counts,
                         mode='lines', name='Tweet Count'))

# 添加情绪时间序列
fig.add_trace(go.Scatter(x=time_sequance[time_frame], y=time_sequance['weighted_sentiment'],
                         mode='lines', name='Weighted Sentiment', line=dict(color='blue')))

# 添加重要时间节点的垂直线和注释
for event_time, event_details in initial_events.items():
    color = 'red' if event_details[1] == 'N' else 'green'
    fig.add_vline(x=pd.Timestamp(event_time), line=dict(color=color, dash='dash'))
    fig.add_annotation(x=pd.Timestamp(event_time), y=max(tweet_counts),
                       text=event_details[0], showarrow=True, arrowhead=1)

fig.update_layout(xaxis_title='Time',
                  yaxis_title='Tweet Count',
                  template='plotly_white')

# 显示图表
fig.show()
