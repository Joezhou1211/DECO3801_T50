import plotly.express as px
import plotly.graph_objs as go
from dash import Dash, dcc, html
from dash.dependencies import Input, Output
import pandas as pd


df = pd.read_json('../../backend/static/test_data.json')

df = df[['_id', 'created_at','sentiment','weighted_sentiment', 'main-topic','influence_tweet_factor']]

df['created_at'] = pd.to_datetime(df['created_at'])
df['day'] = df['created_at'].dt.date
df['hour'] = df['created_at'].dt.hour
df['day_hour'] = df['created_at'].dt.strftime('%Y-%m-%d %H:00')

# 按天和小时汇总情绪总和
daily_sentiment = df.groupby(['day', 'main-topic']).agg(
    daily_sentiment=('sentiment', 'sum'),
    daily_weighted_sentiment=('weighted_sentiment', 'sum')
).reset_index()

hourly_sentiment = df.groupby(['day_hour', 'main-topic']).agg(
    hourly_sentiment=('sentiment', 'sum'),
    hourly_weighted_sentiment=('weighted_sentiment', 'sum')
).reset_index()

# 按天和小时汇总推文数量
daily_counts = df.groupby(['day', 'main-topic']).agg(
    tweet_count=('sentiment', 'count')  # 统计推文数量
).reset_index()

hourly_counts = df.groupby(['day_hour', 'main-topic']).agg(
    tweet_count=('sentiment', 'count')  # 统计推文数量
).reset_index()


# 定义事件时间线
initial_events = {
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
    '2020-01-23 00:00:00': ['飞机坠毁', 'N']
}

# 创建 Dash 应用
app = Dash(__name__)

app.layout = html.Div([
    html.H1("Theme and Sentiment Evolution Over Time with Events", style={'textAlign': 'center'}),

    dcc.RadioItems(
        id='time-frame',
        options=[{'label': 'Day', 'value': 'day'},
                 {'label': 'Hour', 'value': 'hour'}],
        value='day',
        labelStyle={'display': 'inline-block', 'margin': '5px', 'fontSize': '10px'}
    ),

    dcc.RadioItems(
        id='sentiment-type',
        options=[{'label': 'Sentiment', 'value': 'sentiment'},
                 {'label': 'Weighted Sentiment', 'value': 'weighted_sentiment'}],
        value='sentiment',
        labelStyle={'display': 'inline-block', 'margin': '5px', 'fontSize': '10px'}
    ),

    dcc.Graph(id='sentiment-tweet-time-series', style={'height': '100vh'})  # 设置图表高度为85%视口高度
], style={'height': '100vh', 'backgroundColor': '#f9f9f9', 'padding': '0 0px'})


# 定义回调函数
@app.callback(
    Output('sentiment-tweet-time-series', 'figure'),
    [Input('time-frame', 'value'),
     Input('sentiment-type', 'value')]
)
def update_graph(selected_time_frame, selected_sentiment_type):
    if selected_time_frame == 'day':
        df_plot_sentiment = daily_sentiment
        df_plot_count = daily_counts
        x_axis = 'day'
        y_axis_sentiment = f'daily_{selected_sentiment_type}'
        y_axis_count = 'tweet_count'
    else:
        df_plot_sentiment = hourly_sentiment
        df_plot_count = hourly_counts
        x_axis = 'day_hour'
        y_axis_sentiment = f'hourly_{selected_sentiment_type}'
        y_axis_count = 'tweet_count'

    # 生成情绪和推文数量的图表数据
    sentiment_traces = []
    count_traces = []

    for topic in df_plot_sentiment['main-topic'].unique():
        df_topic_sentiment = df_plot_sentiment[df_plot_sentiment['main-topic'] == topic]
        df_topic_count = df_plot_count[df_plot_count['main-topic'] == topic]

        sentiment_traces.append(go.Scatter(x=df_topic_sentiment[x_axis],
                                           y=df_topic_sentiment[y_axis_sentiment],
                                           mode='lines',
                                           name=f'{topic} Sentiment',
                                           hovertemplate=f"Topic: {topic}<br>{x_axis}: %{{x}}<br>Sentiment: %{{y}}"))

        count_traces.append(go.Scatter(x=df_topic_count[x_axis],
                                       y=df_topic_count[y_axis_count],
                                       mode='lines',
                                       name=f'{topic} Tweet Count',
                                       line=dict(dash='dash'),
                                       hovertemplate=f"Topic: {topic}<br>{x_axis}: %{{x}}<br>Tweet Count: %{{y}}"))

    # 生成带有按钮切换的图表
    fig = go.Figure()

    fig.add_traces(sentiment_traces)
    fig.add_traces(count_traces)

    # 配置按钮
    fig.update_layout(
        updatemenus=[
            {
                "buttons": [
                    {
                        "args": [{"visible": [True] * len(sentiment_traces) + [False] * len(count_traces)},
                                 {"title": "Sentiment Evolution Over Time"}],
                        "label": "Sentiment",
                        "method": "update"
                    },
                    {
                        "args": [{"visible": [False] * len(sentiment_traces) + [True] * len(count_traces)},
                                 {"title": "Tweet Count Over Time"}],
                        "label": "Tweet Count",
                        "method": "update"
                    }
                ],
                "direction": "left",
                "pad": {"r": -10, "t": -10},
                "showactive": True,
                "type": "buttons",
                "x": 0,
                "xanchor": "center",
                "y": 1.4,
                "yanchor": "top"
            }
        ]
    )

    # 添加事件时间线
    for event_time, (event_desc, sentiment_type) in initial_events.items():
        event_time = pd.to_datetime(event_time)
        line_color = 'red' if sentiment_type == 'N' else 'green'

        fig.add_shape(
            dict(
                type="line",
                x0=event_time,
                x1=event_time,
                y0=0,
                y1=1,
                xref='x',
                yref='paper',
                line=dict(color=line_color, width=2, dash="dot")
            )
        )

        fig.add_annotation(
            dict(
                x=event_time,
                y=1,
                xref='x',
                yref='paper',
                text=event_desc,
                showarrow=False,
                xanchor='left',
                yanchor='bottom',
                font=dict(color=line_color),
                bgcolor='rgba(255,255,255,0.7)',
                bordercolor=line_color,
                borderwidth=2
            )
        )

    # 美化图表
    fig.update_layout(
        title={'x': 0.5, 'xanchor': 'center', 'yanchor': 'top'},
        margin={'l': 40, 'r': 40, 't': 40, 'b': 40},
        plot_bgcolor='white',
        paper_bgcolor='#f9f9f9',
        font=dict(size=18),
        xaxis=dict(showgrid=False),
        yaxis=dict(showgrid=True, gridcolor='LightGray'),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )

    return fig


if __name__ == '__main__':
    app.run_server(debug=True)