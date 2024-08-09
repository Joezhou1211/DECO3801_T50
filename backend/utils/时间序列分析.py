
# topic 3459会导致influence_tweet_factor下降 7会导致上升？
# 3和4相关性很高
# 4和9相关性很高
# 35 45 95相关性差不多 且比较高
# 12相关性比较高

# 初步推断345689为山火相关

# 从19年1月8以后开始密集
# 20年1月25以后缓解


# 数据有效时间区间
#(Timestamp('2019-04-08 23:12:31+0000', tz='UTC'),
# Timestamp('2020-02-19 18:42:10+0000', tz='UTC'))


import pandas as pd
import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import plotly.graph_objects as go

# 读取数据
df = pd.read_csv('../../data/processed/tweets_with_final_nmf_topics_final.csv')

# 将时间戳转换为datetime格式，并指定格式
df['created_at'] = pd.to_datetime(df['created_at'], errors='coerce')

# 检查是否有NaT值并处理
df = df.dropna(subset=['created_at'])

# 按小时分组计算推特数量
df['hour'] = df['created_at'].dt.to_period('H')
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

# 准备 Dash 应用
app = dash.Dash(__name__)
app.title = "时间序列分析"

app.layout = html.Div([
    dcc.Graph(id='time-series-chart', style={'width': '100vw', 'height': '100vh'}),
    html.Div([
        html.H4("事件列表", style={'font-size': '10px'}),
        html.Ul(id='initial-event-list', children=[
            html.Li(f"{time}: {details[0]}", style={'font-size': '10px'}) for time, details in initial_events.items()
        ], style={'padding-left': '20px'})
    ], style={'width': '200px', 'display': 'inline-block', 'vertical-align': 'top', 'padding': '10px'})
], style={'display': 'flex', 'justify-content': 'flex-start', 'align-items': 'flex-start', 'height': '100vh'})


@app.callback(
    Output('time-series-chart', 'figure'),
    Input('time-series-chart', 'id')  # Dummy input to trigger callback
)
def update_figure(_):
    fig = go.Figure()

    fig.add_trace(go.Scatter(x=tweet_counts.index, y=tweet_counts,
                             mode='lines', name='Tweet Count'))

    for event_time, event_details in initial_events.items():
        color = 'red' if event_details[1] == 'N' else 'green'
        fig.add_vline(x=pd.Timestamp(event_time), line=dict(color=color, dash='dash'))
        fig.add_annotation(x=pd.Timestamp(event_time), y=max(tweet_counts),
                           text=event_details[0], showarrow=True, arrowhead=1)

    fig.update_layout(xaxis_title='时间',
                      yaxis_title='推特数量',
                      legend_title='推特统计',
                      template='plotly_white')

    return fig


if __name__ == '__main__':
    app.run_server(debug=True)