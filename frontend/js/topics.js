let globalData = [];

document.addEventListener('DOMContentLoaded', function () {
    fetchData();

    function fetchData() {
        fetch('../../data/processed/topic_data.json')
            .then(response => response.json())
            .then(data => {
                globalData = data.map(item => {
                    return {
                        ...item,
                        itemTimestamp: new Date(item.created_at_dt).getTime(),
                        sentimentCode: item.sentiment.toLowerCase()
                    };
                });

                if (globalData.length > 0) {
                    dates = generateDateArrayFromData(globalData); // 初始化 dates
                    const initialDate = dates[0];
                    const chartData = processChartData(globalData, initialDate);
                    updateChart(chartData);
                    updateTable(globalData, initialDate);
                } else {
                    console.error('No data available from JSON');
                }
            })
            .catch(error => console.error('Error loading JSON:', error));
    }
});

function bindTableViewBtn() {
    tableViewBtn.addEventListener('click', function () {
        if (globalData && dates && dates.length > 0) {
            tableView.style.display = 'block';
            chartView.style.display = 'none';
            filterView.classList.remove('open');
            const selectedDate = dates[timeline.value];
            updateTable(globalData, selectedDate);
        } else {
            console.error('globalData or dates not initialized.');
        }
    });
}

function processChartData(data, selectedDate) {
    const topicTweetCounts = {};
    const topicSentiments = {};
    const topics = {
        1: "Wildlife and Environmental Impact",
        2: "Fundraising and Community Support",
        3: "Political Criticism and Government Response",
        4: "Climate Change Debate",
        5: "Emotional and Spiritual Reactions",
        6: "Geographical and Location-Based Information",
        7: "Regional Air Quality and Environmental Conditions",
        8: "Wildlife Devastation",
        9: "Emergency Information and Public Safety",
        10: "Health and Mental Well-being"
    };

    for (let key in topics) {
        topicTweetCounts[key] = 0;
        topicSentiments[key] = { positive: 0, neutral: 0, negative: 0 };
    }

    const startDate = new Date(selectedDate);
    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() + 1);

    const filteredData = data.filter(item => {
        const itemDate = new Date(item.created_at_dt);
        return itemDate >= startDate && itemDate < endDate;
    });

    filteredData.forEach(item => {
        const topicId = item.main_topic;
        const sentiment = item.sentiment;
        if (topicTweetCounts[topicId] !== undefined) {
            topicTweetCounts[topicId] += 1;
            if (sentiment === 'Positive') {
                topicSentiments[topicId].positive += 1;
            } else if (sentiment === 'Neutral') {
                topicSentiments[topicId].neutral += 1;
            } else if (sentiment === 'Negative') {
                topicSentiments[topicId].negative += 1;
            }
        }
    });

    const combined = Object.keys(topics).map((key) => {
        const sentiment = topicSentiments[key];
        const dominantSentiment = getDominantSentiment(sentiment);
        let sentimentColor = '#6CCB77';
        if (dominantSentiment === 'neutral') {
            sentimentColor = '#B0BEC5';
        } else if (dominantSentiment === 'negative') {
            sentimentColor = '#E57373';
        }
        return {
            label: topics[key],
            count: topicTweetCounts[key],
            color: sentimentColor
        };
    });

    combined.sort((a, b) => b.count - a.count);
    const labels = combined.map(item => item.label);
    const tweetCounts = combined.map(item => item.count);
    const sentimentColors = combined.map(item => item.color);

    return { labels, tweetCounts, sentimentColors };
}

function getDominantSentiment(sentiment) {
    const { positive, neutral, negative } = sentiment;
    if (positive >= neutral && positive >= negative) {
        return 'positive';
    } else if (neutral >= positive && neutral >= negative) {
        return 'neutral';
    } else {
        return 'negative';
    }
}

function updateTable(data, selectedDate) {
    const tableBody = document.querySelector('.topic-table tbody');
    const filteredData = data.filter(item => {
        return new Date(item.itemTimestamp).toLocaleDateString('en-GB') === selectedDate.toLocaleDateString('en-GB');
    });

    const topics = {
        1: "Wildlife and Environmental Impact",
        2: "Fundraising and Community Support",
        3: "Political Criticism and Government Response",
        4: "Climate Change Debate",
        5: "Emotional and Spiritual Reactions",
        6: "Geographical and Location-Based Information",
        7: "Regional Air Quality and Environmental Conditions",
        8: "Wildlife Devastation",
        9: "Emergency Information and Public Safety",
        10: "Health and Mental Well-being"
    };

    let rowsHtml = '';
    filteredData.forEach(item => {
        const topicName = topics[item.main_topic] || `Topic ${item.main_topic}`;
        const positivePercentage = (item.sentimentCode === 'positive') ? 100 : 0;
        const neutralPercentage = (item.sentimentCode === 'neutral') ? 100 : 0;
        const negativePercentage = (item.sentimentCode === 'negative') ? 100 : 0;
        rowsHtml += `
            <tr>
                <td>${topicName}</td>
                <td>${item.reply_count}</td>
                <td>${item.retweet_count}</td>
                <td>${item.favourite_count}</td>
                <td>${item.quote_count}</td>
                <td>${positivePercentage}%</td>
                <td>${neutralPercentage}%</td>
                <td>${negativePercentage}%</td>
                <td>0</td>
            </tr>
        `;
    });

    if (filteredData.length === 0) {
        rowsHtml = `<tr><td colspan="9">No data available for this date.</td></tr>`;
    }

    tableBody.innerHTML = rowsHtml;
}

function generateDateArrayFromData(data) {
    const uniqueDates = [...new Set(data.map(item => new Date(item.created_at_dt).toLocaleDateString('en-GB')))];
    return uniqueDates.map(dateString => new Date(dateString));
}

const elementsToCheck = [
    { id: 'chartViewBtn', name: 'Chart View Button' },
    { id: 'tableViewBtn', name: 'Table View Button' },
    { id: 'filterBtn', name: 'Filter Button' },
    { id: 'closeFilter', name: 'Close Filter Button' },
    { id: 'chartView', name: 'Chart View' },
    { id: 'tableView', name: 'Table View' },
    { id: 'filterView', name: 'Filter View' },
    { id: 'timeline', name: 'Timeline' },
    { id: 'currentDateLabel', name: 'Current Date Label' },
    { id: 'chartDate', name: 'Chart Date' },
    { id: 'tableDate', name: 'Table Date' }
];

elementsToCheck.forEach(element => {
    const el = document.getElementById(element.id);
    if (!el) {
        console.error(`${element.name} (ID: ${element.id}) not found in DOM.`);
    }
});

const chartViewBtn = document.getElementById('chartViewBtn');
const tableViewBtn = document.getElementById('tableViewBtn');
const filterBtn = document.getElementById('filterBtn');
const closeFilterBtn = document.getElementById('closeFilter');
const chartView = document.getElementById('chartView');
const tableView = document.getElementById('tableView');
const filterView = document.getElementById('filterView');
const timeline = document.getElementById('timeline');
const currentDateLabel = document.getElementById('currentDateLabel');
const chartDate = document.getElementById('chartDate');
const tableDate = document.getElementById('tableDate');

let chartInstance = null;

tableViewBtn.addEventListener('click', function () {
    tableView.style.display = 'block';
    chartView.style.display = 'none';
    filterView.classList.remove('open');
    if (chartInstance !== null) {
        chartInstance.destroy();
        chartInstance = null;
    }
    const canvasParent = document.getElementById('chartContainer');
    canvasParent.innerHTML = '<canvas id="topicChart" width="400" height="200"></canvas>';
});

chartViewBtn.addEventListener('click', function () {
    chartView.style.display = 'block';
    tableView.style.display = 'none';
    filterView.classList.remove('open');
    const selectedDate = dates[timeline.value];
    const chartData = processChartData(globalData, selectedDate);
    updateChart(chartData);
});

function updateChart(chartData) {
    const ctx = document.getElementById('topicChart').getContext('2d');
    if (chartInstance) {
        chartInstance.data.labels = chartData.labels;
        chartInstance.data.datasets[0].data = chartData.tweetCounts;
        chartInstance.data.datasets[0].backgroundColor = chartData.sentimentColors;
        chartInstance.update();
    } else {
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: '# of Tweets',
                    data: chartData.tweetCounts,
                    backgroundColor: chartData.sentimentColors,
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            generateLabels: function(chart) {
                                return [
                                    {text: 'Positive', fillStyle: '#6CCB77'},
                                    {text: 'Neutral', fillStyle: '#B0BEC5'},
                                    {text: 'Negative', fillStyle: '#E57373'}
                                ];
                            }
                        }
                    }
                }
            }
        });
    }
}

tableViewBtn.addEventListener('click', function() {
    tableViewBtn.classList.add('active');
    chartViewBtn.classList.remove('active');

});


chartViewBtn.addEventListener('click', function() {
    chartViewBtn.classList.add('active');
    tableViewBtn.classList.remove('active');

});

function SearchWithQuery(query) {
    console.log("Search query: " + query);
}


function generateDateArray(start, end) {
    const dateArray = [];
    let currentDate = new Date(start);
    const endDate = new Date(end);

    while (currentDate <= endDate) {
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
}

const dates = generateDateArray('2019-11-08', '2020-01-31');

timeline.max = dates.length - 1;

const initialIndex = parseInt(timeline.value);
currentDateLabel.innerText = dates[initialIndex].toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
});

function updateDatePosition() {
    const timelineWidth = timeline.offsetWidth;
    const max = timeline.max;
    const min = timeline.min;
    const value = timeline.value;
    const percent = (value - min) / (max - min);
    const offset = percent * timelineWidth;
    currentDateLabel.style.left = `${offset}px`;
    const index = parseInt(value);
    const selectedDate = dates[index];
    const formattedDate = selectedDate.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    currentDateLabel.innerText = formattedDate;
    chartDate.innerText = formattedDate;
    const chartData = processChartData(globalData, selectedDate);
    updateChart(chartData);
}

timeline.addEventListener('mousedown', function() {
    currentDateLabel.style.display = 'block';
});

timeline.addEventListener('mouseup', function() {
    currentDateLabel.style.display = 'none';
});

timeline.addEventListener('input', function () {
    updateDatePosition();
    const selectedDate = dates[timeline.value];
    const chartData = processChartData(globalData, selectedDate);
    updateChart(chartData);
});

updateDatePosition();
currentDateLabel.style.display = 'none';

let isPlaying = false;
let playInterval;
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');

playPauseBtn.addEventListener('click', function () {
    if (isPlaying) {
        clearInterval(playInterval);
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
    } else {
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
        startPlayingTimeline();
    }
    isPlaying = !isPlaying;
});

function startPlayingTimeline() {
    let currentValue = parseInt(timeline.value);
    playInterval = setInterval(function () {
        if (currentValue < timeline.max) {
            currentValue++;
            timeline.value = currentValue;
            updateTimelineAndChart(currentValue);
        } else {
            clearInterval(playInterval);
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
            isPlaying = false;
        }
    }, 500);
}

function updateTimelineAndChart(value) {
    const selectedDate = dates[value];
    const chartData = processAccumulatedData(globalData, dates[0], selectedDate);
    updateChart(chartData);
}

function processAccumulatedData(data, startDate, endDate) {
    const topicTweetCounts = {};
    const topicSentiments = {};
    const topics = {
        1: "Wildlife and Environmental Impact",
        2: "Fundraising and Community Support",
        3: "Political Criticism and Government Response",
        4: "Climate Change Debate",
        5: "Emotional and Spiritual Reactions",
        6: "Geographical and Location-Based Information",
        7: "Regional Air Quality and Environmental Conditions",
        8: "Wildlife Devastation",
        9: "Emergency Information and Public Safety",
        10: "Health and Mental Well-being"
    };

    for (let key in topics) {
        topicTweetCounts[key] = 0;
        topicSentiments[key] = { positive: 0, neutral: 0, negative: 0 };
    }

    const filteredData = data.filter(item => {
        const itemDate = new Date(item.created_at_dt);
        return itemDate >= startDate && itemDate <= endDate;
    });

    filteredData.forEach(item => {
        const topicId = item.main_topic;
        const sentiment = item.sentiment;
        if (topicTweetCounts[topicId] !== undefined) {
            topicTweetCounts[topicId] += 1;
            if (sentiment === 'Positive') {
                topicSentiments[topicId].positive += 1;
            } else if (sentiment === 'Neutral') {
                topicSentiments[topicId].neutral += 1;
            } else if (sentiment === 'Negative') {
                topicSentiments[topicId].negative += 1;
            }
        }
    });

    const combined = Object.keys(topics).map(key => {
        const sentiment = topicSentiments[key];
        const dominantSentiment = getDominantSentiment(sentiment);
        let sentimentColor = '#6CCB77';
        if (dominantSentiment === 'neutral') {
            sentimentColor = '#B0BEC5';
        } else if (dominantSentiment === 'negative') {
            sentimentColor = '#E57373';
        }
        return {
            label: topics[key],
            count: topicTweetCounts[key],
            color: sentimentColor
        };
    });

    combined.sort((a, b) => b.count - a.count);
    const labels = combined.map(item => item.label);
    const tweetCounts = combined.map(item => item.count);
    const sentimentColors = combined.map(item => item.color);

    return { labels, tweetCounts, sentimentColors };
}

function filterData(data, filters, useDateRange) {
    let startTimestamp, endTimestamp;
    if (useDateRange) {
        startTimestamp = new Date(filters.start_date).getTime();
        endTimestamp = new Date(filters.end_date).getTime();
    }
    return data.filter(item => {
        let matchesDateRange = true;
        if (useDateRange) {
            matchesDateRange = item.itemTimestamp >= startTimestamp && item.itemTimestamp <= endTimestamp;
        }

        const matchesSentiment = (filters.sentiments.positive && item.sentimentCode === 'positive') ||
                                 (filters.sentiments.neutral && item.sentimentCode === 'neutral') ||
                                 (filters.sentiments.negative && item.sentimentCode === 'negative');

        return matchesDateRange && matchesSentiment;
    });
}

document.getElementById('applyFilterBtn').addEventListener('click', function () {
    const positive = document.getElementById('positive').checked;
    const neutral = document.getElementById('neutral').checked;
    const negative = document.getElementById('negative').checked;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const useDateRange = document.getElementById('useDateRange').checked;
    const filters = {
        start_date: startDate,
        end_date: endDate,
        sentiments: {
            positive,
            neutral,
            negative
        }
    };
    const filteredData = filterData(globalData, filters, useDateRange);
    const selectedDate = dates[timeline.value];
    const chartData = processChartData(filteredData, selectedDate);
    updateChart(chartData);
    updateTable(filteredData, selectedDate);
    filterView.classList.remove('open');
});

closeFilterBtn.addEventListener('click', function () {
    filterView.classList.remove('open');
});

document.getElementById('filterBtn').addEventListener('click', function () {
    filterView.classList.toggle('open');
});
