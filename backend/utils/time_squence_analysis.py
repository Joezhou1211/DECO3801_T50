import pandas as pd
import plotly.graph_objects as go

'''
Analysis of the time sequence of the number of tweets and the weighted sentiment of the tweets.

:param 
    time_frame: datetime64, default:'created_at_dt', options: 'created_at_hour', 'created_at_dt'
'''

time_frame = 'created_at_dt'  # for entiment file only, does not affect tweet count

# time sequence of weighted sentiment
file_prefix = 'daily' if time_frame == 'created_at_dt' else 'hourly'
time_sequance = pd.read_csv(f'../../data/processed/{file_prefix}_weighted_sentiment_vader.csv')
time_sequance[time_frame] = pd.to_datetime(time_sequance[time_frame], errors='coerce')

# tweets count
df = pd.read_csv('../../data/processed/final_data.csv')
df['created_at'] = pd.to_datetime(df['created_at'], errors='coerce')
df = df.dropna(subset=['created_at'])  # drop NaN values

df['hour'] = df['created_at'].dt.to_period('h')  # group by hours
tweet_counts = df.groupby('hour').size()
tweet_counts.index = tweet_counts.index.to_timestamp()


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


fig = go.Figure()

# add tweet count time series
fig.add_trace(go.Scatter(x=tweet_counts.index, y=tweet_counts,
                         mode='lines', name='Tweet Count'))

# add weighted sentiment time series
fig.add_trace(go.Scatter(x=time_sequance[time_frame], y=time_sequance['weighted_sentiment'],
                         mode='lines', name='Weighted Sentiment', line=dict(color='blue')))

# add events
for event_time, event_details in events.items():
    color = 'red' if event_details[1] == 'N' else 'green'
    fig.add_vline(x=pd.Timestamp(event_time), line=dict(color=color, dash='dash'))
    fig.add_annotation(x=pd.Timestamp(event_time), y=max(tweet_counts),
                       text=event_details[0], showarrow=True, arrowhead=1)

fig.show()
