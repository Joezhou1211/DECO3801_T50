import plotly.graph_objs as go
from dash import Dash, dcc, html
from dash.dependencies import Input, Output
import pandas as pd

df = pd.read_json('../../data/processed/final_data(filtered).json')
df = df[['_id', 'created_at', 'sentiment', 'weighted_sentiment',   'main-topic', 'influence_tweet_factor']]

# to datetime and add day and hour columns
df['created_at'] = pd.to_datetime(df['created_at'])
df['day'] = df['created_at'].dt.date
df['hour'] = df['created_at'].dt.hour
df['day_hour'] = df['created_at'].dt.strftime('%Y-%m-%d %H:00')

# group sentiment by day and hour
daily_sentiment = df.groupby(['day', 'main-topic']).agg(
    daily_sentiment=('sentiment', 'sum'),
    daily_weighted_sentiment=('weighted_sentiment', 'sum')
).reset_index()

hourly_sentiment = df.groupby(['day_hour', 'main-topic']).agg(
    hourly_sentiment=('sentiment', 'sum'),
    hourly_weighted_sentiment=('weighted_sentiment', 'sum')
).reset_index()

# group tweet count by day and hour
daily_counts = df.groupby(['day', 'main-topic']).agg(
    tweet_count=('sentiment', 'count')
).reset_index()

hourly_counts = df.groupby(['day_hour', 'main-topic']).agg(
    tweet_count=('sentiment', 'count')
).reset_index()

# Events list, N & P means negative and positive events
events = {
    '2019-09-01 00:00:00': ['fires start', 'N'],
    '2019-10-26 00:00:00': ['Gospers fire', 'N'],
    '2019-11-08 00:00:00': ['Nymboida fire', 'N'],
    '2019-11-11 00:00:00': ['state of emergency', 'N'],
    '2019-12-20 00:00:00': ['East Gippsland fire', 'N'],
    '2019-12-30 00:00:00': ['Gippsland fire', 'N'],
    '2019-12-31 00:00:00': ['fires merge', 'N'],
    '2020-01-01 00:00:00': ['town trapped', 'N'],
    '2020-01-02 00:00:00': ['Gippsland spread', 'N'],
    '2020-01-03 00:00:00': ['Kangaroo Island fire', 'N'],
    '2020-01-04 00:00:00': ['Penrith heat', 'N'],
    '2020-01-05 00:00:00': ['Bega Valley fire', 'N'],
    '2020-01-06 00:00:00': ['government fund', 'P'],
    '2020-01-15 00:00:00': ['thunderstorm relief', 'P'],
    '2020-01-23 00:00:00': ['plane crash', 'N'],
    '2020-02-09 00:00:00': ['heavy rainfall', 'P'],
    '2020-03-04 00:00:00': ['fires extinguished', 'P'],
    '2020-05-01 00:00:00': ['final fires', 'P']
}


app = Dash(__name__)


app.layout = html.Div([
    html.H1("Theme and Sentiment Evolution Over Time with Events", style={'textAlign': 'center'}),

    # Time frame and sentiment type radio buttons
    dcc.RadioItems(
        id='time-frame',
        options=[{'label': 'Day', 'value': 'day'},
                 {'label': 'Hour', 'value': 'hour'}],
        value='day',
        labelStyle={'display': 'inline-block', 'margin': '5px', 'fontSize': '10px'}
    ),

    # Sentiment type radio buttons
    dcc.RadioItems(
        id='sentiment-type',
        options=[{'label': 'Sentiment', 'value': 'sentiment'},
                 {'label': 'Weighted Sentiment', 'value': 'weighted_sentiment'}],
        value='sentiment',
        labelStyle={'display': 'inline-block', 'margin': '5px', 'fontSize': '10px'}
    ),

    dcc.Graph(id='sentiment-tweet-time-series', style={'height': '100vh'})
], style={'height': '100vh', 'backgroundColor': '#f9f9f9', 'padding': '0 0px'})



@app.callback(
    Output('sentiment-tweet-time-series', 'figure'),
    [Input('time-frame', 'value'),
     Input('sentiment-type', 'value')])
# Update graph based on selected time frame and sentiment type
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

    sentiment_traces = []
    count_traces = []

    # generate traces
    for topic in df_plot_sentiment['main-topic'].unique():
        df_topic_sentiment = df_plot_sentiment[df_plot_sentiment['main-topic'] == topic]
        df_topic_count = df_plot_count[df_plot_count['main-topic'] == topic]

        # gennerate traces for sentiment
        sentiment_traces.append(go.Scatter(x=df_topic_sentiment[x_axis],
                                           y=df_topic_sentiment[y_axis_sentiment],
                                           mode='lines',
                                           name=f'{topic} Sentiment',
                                           hovertemplate=f"Topic: {topic}<br>{x_axis}: %{{x}}<br>Sentiment: %{{y}}"))

        # tweet count trace
        count_traces.append(go.Scatter(x=df_topic_count[x_axis],
                                       y=df_topic_count[y_axis_count],
                                       mode='lines',
                                       name=f'{topic} Tweet Count',
                                       line=dict(dash='dash'),
                                       hovertemplate=f"Topic: {topic}<br>{x_axis}: %{{x}}<br>Tweet Count: %{{y}}"))

    fig = go.Figure()

    fig.add_traces(sentiment_traces)
    fig.add_traces(count_traces)

    # button design
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

    # add events to the plot
    for event_time, (event_desc, sentiment_type) in events.items():
        event_time = pd.to_datetime(event_time)
        line_color = 'red' if sentiment_type == 'N' else 'green'

        # add vertical line for event
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

        # add annotation for event
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

    # plot design
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