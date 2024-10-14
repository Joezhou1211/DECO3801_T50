// Global variables
let globalData = [];
let filtered = [];
let firstDate = null;
let lastDate = null;
let showTable = false;
let filterOverlay;

let filters = {
    start_date: null,
    end_date: null,
    sentiments: {
        positive: true,
        neutral: true,
        negative: true
    }
};

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

// Function to download data as CSV
function downloadCSV(str, data) {
    for(let i = 0 ; i < data.length ; i++ ){
        for(const key in data[i]){
            str+=`${data[i][key] + '\t'},`;
        }
        str+='\n';
    }
    const blob = new Blob(['\ufeff' + str], {type: 'text/csv,charset=UTF-8'});
    const csvUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = csvUrl;
    link.download =  "data.csv";
    link.click();
}

// Event listener for download button
document.getElementById("downloadBtn").addEventListener('click', () => {
    downloadCSV("id,created_at,reply,retweet,favorite,quote,sentiment,topic\n", filtered);
});

// Variables for date management
let dateInputVisible = false;
let lastValidChartDate = new Date('2019-11-08');
let lastValidTableDate = new Date('2019-11-08');

// Function to fetch data and initialize charts and tables
document.addEventListener('DOMContentLoaded', function () {
    fetchData();
    const filterView = document.getElementById('filterView');

    // Add event listeners to buttons inside the filter box
    const filterButtons = filterView.querySelectorAll('button');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove the overlay to restore filter box interaction
            if (filterOverlay) {
                filterView.removeChild(filterOverlay);
                filterOverlay = null;
            }

            // Optionally, stop the playback if it's running
            if (isPlaying) {
                clearInterval(playInterval);
                playIcon.classList.remove('fa-pause');
                playIcon.classList.add('fa-play');
                isPlaying = false;
            }
        });
    });
});

// Fetches topic data from JSON and initializes charts and tables
function fetchData() {
    fetch('../../data/processed/topic_data.json')
        .then(response => response.json())
        .then(data => {
            globalData = data.map(item => {
                return {
                    ...item,
                    itemTimestamp: item.created_at_dt, 
                    sentimentCode: item.sentiment.toLowerCase()
                };
            });

            if (globalData.length > 0) {
                filtered = globalData;
                dates = generateDateArrayFromData(globalData).sort((a, b) => a - b);
                timeline.max = dates.length - 1;
                const initialDate = dates[0];
                firstDate = dates[0];
                lastDate = dates[dates.length - 1];
                const chartData = processChartData(globalData, initialDate);
                updateChart(chartData);
                updateTable(globalData, initialDate);

                updateChartSingleDateLabel(initialDate);
                updateTableSingleDateLabel(initialDate);

            } else {
                console.error('No data available from JSON');
            }
        })
        .catch(error => console.error('Error loading JSON:', error));
}

// Converts a timestamp to a 'YYYY-MM-DD' formatted date string
function getDateString(timestamp) {
    const date = new Date(timestamp);
    return date.getUTCFullYear() + '-' +
           ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
           ('0' + date.getUTCDate()).slice(-2);
}

// Function to process data for the chart
function processChartData(data, selectedDate) {
    const topicTweetCounts = {};
    const topicSentiments = {};
    const topicFakeNewsCounts = {};

    for (let key in topics) {
        topicTweetCounts[key] = 0;
        topicFakeNewsCounts[key] = 0;
        topicSentiments[key] = { positive: 0, neutral: 0, negative: 0 };
    }

    let filteredData = data.filter(item => {
        const matchesSentiment = (filters.sentiments.positive && item.sentimentCode === 'positive') ||
                                 (filters.sentiments.neutral && item.sentimentCode === 'neutral') ||
                                 (filters.sentiments.negative && item.sentimentCode === 'negative');
        return matchesSentiment;
    });

    if (selectedDate) {
        const selectedDateString = getDateString(selectedDate.getTime());
        filteredData = filteredData.filter(item => {
            const itemDateString = getDateString(item.itemTimestamp);
            return itemDateString === selectedDateString;
        });
    }

    filteredData.forEach(item => {
        const topicId = item.main_topic;
        const sentiment = item.sentiment;
        if (topicTweetCounts[topicId] !== undefined) {
            topicTweetCounts[topicId] += 1;
            topicFakeNewsCounts[topicId] += item.fake_news_pred;
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
        let sentimentColor = '#6CCB77'; // Positive
        if (dominantSentiment === 'neutral') {
            sentimentColor = '#B0BEC5'; // Neutral
        } else if (dominantSentiment === 'negative') {
            sentimentColor = '#E57373'; // Negative
        }
        return {
            label: topics[key],
            count: topicTweetCounts[key],
            color: sentimentColor,
            fakeNews: topicFakeNewsCounts[key]
        };
    });

    combined.sort((a, b) => b.count - a.count);
    const labels = combined.map(item => item.label);
    const tweetCounts = combined.map(item => item.count);
    const sentimentColors = combined.map(item => item.color);
    const fakeNewsCounts = combined.map(item => item.fakeNews);

    return { labels, tweetCounts, sentimentColors, fakeNewsCounts };
}

// Function to determine dominant sentiment
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

// Function to update the table with data
function updateTable(data, startDate, endDate = null) {
    let filteredData = data.filter(item => {
        const matchesSentiment = (filters.sentiments.positive && item.sentimentCode === 'positive') ||
                                 (filters.sentiments.neutral && item.sentimentCode === 'neutral') ||
                                 (filters.sentiments.negative && item.sentimentCode === 'negative');
        return matchesSentiment;
    });

    const topicSentiments = [];
    const tableBody = document.querySelector('.topic-table tbody');

    if (endDate) {
        const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];
    filteredData = filteredData.filter(item => {
        const itemDateString = new Date(item.itemTimestamp).toISOString().split('T')[0];
        return itemDateString >= startDateString && itemDateString <= endDateString;
    });
    } else if (startDate) {
        const selectedDateString = getDateString(startDate.getTime());
    filteredData = filteredData.filter(item => {
        const itemDateString = getDateString(item.itemTimestamp);
        return itemDateString === selectedDateString;
    });
}

    for (let key in topics) {
        topicSentiments[key] = { id: key, reply: 0, share: 0, like: 0, quote: 0, positive: 0, neutral: 0, negative: 0 , fake_news: 0};
    }

    filteredData.forEach(item => {
        const topicId = item.main_topic;
        const sentiment = item.sentiment;
        topicSentiments[topicId].reply += item.reply_count;
        topicSentiments[topicId].share += item.retweet_count;
        topicSentiments[topicId].like += item.favourite_count;
        topicSentiments[topicId].quote += item.quote_count;
        topicSentiments[topicId].fake_news += item.fake_news_pred;
        if (sentiment === 'Positive') {
            topicSentiments[topicId].positive += 1;
        } else if (sentiment === 'Neutral') {
            topicSentiments[topicId].neutral += 1;
        } else if (sentiment === 'Negative') {
            topicSentiments[topicId].negative += 1;
        }
    });

    let rowsHtml = '';
    topicSentiments.sort((a, b) => ((b.positive + b.neutral + b.negative) - (a.positive + a.neutral + a.negative)))
        .forEach(item => {
            const topicName = topics[item.id] || `Topic ${item.id}`;
            const totalSentiments = item.positive + item.neutral + item.negative;
            const positivePercentage = ((item.positive / totalSentiments) * 100).toFixed(2);
            const neutralPercentage = ((item.neutral / totalSentiments) * 100).toFixed(2);
            const negativePercentage = ((item.negative / totalSentiments) * 100).toFixed(2);
            rowsHtml += `
                <tr class="${isNaN(positivePercentage) ? "bg-gray" : ""}">
                    <td>${topicName}</td>
                    <td>${totalSentiments}</td>
                    <td>${item.reply}</td>
                    <td>${item.share}</td>
                    <td>${item.like}</td>
                    <td>${item.quote}</td>
                    <td>${isNaN(positivePercentage) ? '--' : positivePercentage}%</td>
                    <td>${isNaN(neutralPercentage) ? '--' : neutralPercentage}%</td>
                    <td>${isNaN(negativePercentage) ? '--' : negativePercentage}%</td>
                    <td>${item.fake_news}</td>
                </tr>
            `;
        });

    if (filteredData.length === 0) {
        rowsHtml = `<tr><td colspan="10">No data available for this date.</td></tr>`;
    }

    tableBody.innerHTML = rowsHtml;
}

// Function to generate unique dates from data
function generateDateArrayFromData(data) {
    const uniqueDateStrings = [...new Set(data.map(item => getDateString(item.itemTimestamp)))];
    return uniqueDateStrings.map(dateString => new Date(dateString + 'T00:00:00Z'));
}
// Retrieve and check necessary DOM elements
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

// Get references to DOM elements
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

// Event listeners for view buttons
tableViewBtn.addEventListener('click', function() {
    tableView.style.display = 'block';
    chartView.style.display = 'none';
    filterView.classList.remove('open');

    if (chartInstance !== null) {
        chartInstance.destroy();
        chartInstance = null;
    }

    const selectedDate = dates[timeline.value];

    updateTable(globalData, selectedDate);

    const formattedDate = selectedDate.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    tableDate.innerText = formattedDate;
});

chartViewBtn.addEventListener('click', function() {
    chartView.style.display = 'block';
    tableView.style.display = 'none';
    filterView.classList.remove('open');

    const selectedDate = dates[timeline.value];

    const chartData = processChartData(globalData, selectedDate);
    updateChart(chartData);

    const formattedDate = selectedDate.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    chartDate.innerText = formattedDate;
});

// Function to update the chart
function updateChart(chartData) {
    const ctx = document.getElementById('topicChart').getContext('2d');
    if (chartInstance) {
        chartInstance.data.labels = chartData.labels;
        chartInstance.data.datasets[0].data = chartData.tweetCounts;
        chartInstance.data.datasets[1].data = chartData.fakeNewsCounts;
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
                    barThickness: 16,
                },{
                    label: '# of Fake News',
                    data: chartData.fakeNewsCounts,
                    backgroundColor: '#66CCFF',
                    barThickness: 10,
                }]
            },
            options: {
                indexAxis: 'y', // Makes the chart horizontal
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Count', // X-axis title
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Topics', // Y-axis title
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            generateLabels: function(chart) {
                                return [
                                    {text: 'Sentiment:   ', fillStyle: 'transparent', strokeStyle: 'transparent', borderWidth: 0},
                                    {text: 'Positive', fillStyle: '#6CCB77'},
                                    {text: 'Neutral', fillStyle: '#B0BEC5'},
                                    {text: 'Negative', fillStyle: '#E57373'},
                                    {text: 'Fake News:   ', fillStyle: 'transparent', strokeStyle: 'transparent', borderWidth: 0},
                                    {text: 'Fake News tweets', fillStyle: '#66CCFF'}
                                ];
                            }
                        }
                    }
                }
            }
        });
    }
}

// Event listeners for view toggle buttons
tableViewBtn.addEventListener('click', function() {
    tableViewBtn.classList.add('active');
    chartViewBtn.classList.remove('active');
    document.getElementById('checkboxes').classList.add("hidden");
    showTable = true;
});

chartViewBtn.addEventListener('click', function() {
    chartViewBtn.classList.add('active');
    tableViewBtn.classList.remove('active');
    document.getElementById('checkboxes').classList.remove("hidden");
    showTable = false;
});

// Generate date array
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

let dates = generateDateArray('2019-11-08', '2020-01-24');

const initialIndex = parseInt(timeline.value);
currentDateLabel.innerText = dates[initialIndex].toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
});

// Function to update date label position
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
    if (showTable) {
        tableDate.innerText = formattedDate;
    } else {
        chartDate.innerText = formattedDate;
    }
}

timeline.addEventListener('mousedown', function() {
    currentDateLabel.style.display = 'block';
});

timeline.addEventListener('mouseup', function() {
    currentDateLabel.style.display = 'none';
});

// Event listener for timeline input
timeline.addEventListener('input', function () {
    if (isPlaying) {
        clearInterval(playInterval);
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
        isPlaying = false;
    }

    const selectedDate = dates[timeline.value];
    updateViewsForSelectedDate(selectedDate);
});

// Function to format date
function formatDate(date) {
    const day = date.getUTCDate(); // Get the day of the month (1-31)
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }); // Get abbreviated month name
    const year = date.getUTCFullYear(); // Get the 4-digit year
    return `${day} ${month} ${year}`; // Combine into '8 Nov 2019' format
}

// Function to update date labels and check icon visibility
function updateViewsForSelectedDate(selectedDate) {
    const chartData = processChartData(globalData, selectedDate);
    updateChart(chartData);

    updateTable(globalData, selectedDate);

    const formattedDate = formatDate(selectedDate);
    chartDate.textContent = formattedDate;
    tableDate.textContent = formattedDate;

    checkDateFormatAndToggleIcon();

    const selectedDateString = getDateString(selectedDate.getTime());
    const index = dates.findIndex(date => getDateString(date.getTime()) === selectedDateString);
    if (index !== -1) {
        timeline.value = index;
        updateDatePosition();
    }
}


// Function to check date format and toggle icon visibility
function checkDateFormatAndToggleIcon() {
    const chartDateText = chartDate.textContent;
    const tableDateText = tableDate.textContent;
    const chartIcon = document.getElementById('editChartDateIcon');
    const tableIcon = document.getElementById('editTableDateIcon');

    const fromToPattern = /from \d{1,2} \w{3} \d{4} to \d{1,2} \w{3} \d{4}/;

    if (fromToPattern.test(chartDateText)) {
        chartIcon.style.display = 'none';
    } else {
        chartIcon.style.display = 'inline';
    }

    if (fromToPattern.test(tableDateText)) {
        tableIcon.style.display = 'none';
    } else {
        tableIcon.style.display = 'inline';
    }
}

// Variables for playback control
let isPlaying = false;
let playInterval;

const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');

// Event listener for play/pause button
playPauseBtn.addEventListener('click', function () {
    if (isPlaying) {
        clearInterval(playInterval);
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
        isPlaying = false;
        if (filterOverlay) {
            filterView.removeChild(filterOverlay);
            filterOverlay = null;
        }
    } else {
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
        isPlaying = true;
        startPlayingTimeline();
    }
});

// Function to start playing the timeline
function startPlayingTimeline() {
    let currentValue = parseInt(timeline.value);
    let initialStartDate = dates[0];

    filterOverlay = document.createElement('div');
    filterOverlay.classList.add('filter-overlay');
    filterView.appendChild(filterOverlay);

    playInterval = setInterval(function () {
        if (currentValue < timeline.max) {
            currentValue++;
            timeline.value = currentValue;

            const selectedDate = dates[currentValue];

            updateChartDateRangeLabel(initialStartDate, selectedDate);
            updateTableDateRangeLabel(initialStartDate, selectedDate);

            updateTimelineAndChart(currentValue);
        } else {
            clearInterval(playInterval);
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
            isPlaying = false;
        }
    }, 500);
}

// Function to uqdate\e single date labels
function updateChartSingleDateLabel(selectedDate) {
    const chartDateLabel = document.getElementById('chartDate');
    chartDateLabel.textContent = formatDate(selectedDate);
    checkDateFormatAndToggleIcon();
}

function updateTableSingleDateLabel(selectedDate) {
    const tableDateLabel = document.getElementById('tableDate');
    tableDateLabel.textContent = formatDate(selectedDate);
    checkDateFormatAndToggleIcon();
}
// Function to update date range labels
function updateChartDateRangeLabel(startDate, endDate) {
    chartDate.textContent = `from ${formatDate(startDate)} to ${formatDate(endDate)}`;
    checkDateFormatAndToggleIcon();
}

function updateTableDateRangeLabel(startDate, endDate) {
    tableDate.textContent = `from ${formatDate(startDate)} to ${formatDate(endDate)}`;
    checkDateFormatAndToggleIcon();
}

// Function to update timeline and chart during playback
function updateTimelineAndChart(value) {
    const selectedDate = dates[value];

    if (isPlaying) {
        // Accumulated data processing
        const chartData = processAccumulatedData(globalData, dates[0], selectedDate);
        updateChart(chartData);
        updateTable(globalData, dates[0], selectedDate);
    } else {
        // Single date processing
        updateViewsForSelectedDate(selectedDate);
    }
}

// Function to process accumulated data
function processAccumulatedData(data, startDate, endDate) {
    const topicTweetCounts = {};
    const topicSentiments = {};
    const topicFakeNewsCounts = {};

    for (let key in topics) {
        topicTweetCounts[key] = 0;
        topicFakeNewsCounts[key] = 0;
        topicSentiments[key] = { positive: 0, neutral: 0, negative: 0 };
    }

    const startDateString = getDateString(startDate.getTime());
    const endDateString = getDateString(endDate.getTime());

    const filteredData = data.filter(item => {
        const itemDateString = getDateString(item.itemTimestamp);
        return itemDateString >= startDateString && itemDateString <= endDateString;
    });


    filteredData.forEach(item => {
        const topicId = item.main_topic;
        const sentiment = item.sentiment;
        if (topicTweetCounts[topicId] !== undefined) {
            topicTweetCounts[topicId] += 1;
            topicFakeNewsCounts[topicId] += item.fake_news_pred;
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
            color: sentimentColor,
            fakeNews: topicFakeNewsCounts[key]
        };
    });

    combined.sort((a, b) => b.count - a.count);
    const labels = combined.map(item => item.label);
    const tweetCounts = combined.map(item => item.count);
    const sentimentColors = combined.map(item => item.color);
    const fakeNewsCounts = combined.map(item => item.fakeNews);

    return { labels, tweetCounts, sentimentColors, fakeNewsCounts };
}

// Function to filter data based on filters
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

// Event listener for applying filters
document.getElementById('applyFilterBtn').addEventListener('click', function () {
    const positive = document.getElementById('positive').checked;
    const neutral = document.getElementById('neutral').checked;
    const negative = document.getElementById('negative').checked;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const useDateRange = document.getElementById('useDateRange').checked;
    filters = {
        start_date: startDate,
        end_date: endDate,
        sentiments: {
            positive,
            neutral,
            negative
        }
    };
    if (showTable) {
        filters.sentiments.positive = true;
        filters.sentiments.negative = true;
        filters.sentiments.neutral = true;
    }
    const filteredData = filterData(globalData, filters, useDateRange);
    filtered = filteredData;
    const selectedDate = dates[timeline.value];
    if (useDateRange) {
        const formattedStartDate = formatDate(new Date(startDate));
        const formattedEndDate = formatDate(new Date(endDate));
        if (showTable) {
            tableDate.innerText = `from ${formattedStartDate} to ${formattedEndDate}`;
            updateTable(filteredData, null);
        } else {
            chartDate.innerText = `from ${formattedStartDate} to ${formattedEndDate}`;
            const chartData = processChartData(filteredData, null);
            updateChart(chartData);
        }
    } else {
        if (showTable) {
            updateTable(filteredData, selectedDate);
        } else {
            const chartData = processChartData(filteredData, selectedDate);
            updateChart(chartData);
        }
    }

    filterView.classList.remove('open');
});

// Event listeners for filter view
closeFilterBtn.addEventListener('click', function () {
    filterView.classList.remove('open');
});

filterBtn.addEventListener('click', function () {
    filterView.classList.toggle('open');
});

// Function to check timeline visibility
function checkTimelineVisibility() {
    const timelineContainer = document.querySelector('.timeline-container');
    const rect = timelineContainer.getBoundingClientRect();
    const isVisible = rect.top >= 650 || rect.bottom >= window.innerHeight;
    if (!isVisible) {
        timelineContainer.style.position = 'fixed';
        timelineContainer.style.bottom = '10px';
        timelineContainer.style.left = '30px';
        timelineContainer.style.height = '18px';
        timelineContainer.style.width = 'calc(100% - 100px)';
        timelineContainer.style.backgroundColor = 'white';
        timelineContainer.style.borderRadius = '20px';
        timelineContainer.style.boxShadow = '0px 0px 3px 1px gray';
    } else {
        timelineContainer.style.position = '';
        timelineContainer.style.bottom = '';
        timelineContainer.style.left = '';
        timelineContainer.style.width = '';
        timelineContainer.style.backgroundColor = '';
        timelineContainer.style.borderRadius = '';
        timelineContainer.style.boxShadow = '';
    }
}

window.addEventListener('scroll', checkTimelineVisibility);
window.addEventListener('resize', checkTimelineVisibility);

// Event listeners for date icon clicks (Chart and Table)
document.getElementById('editChartDateIcon').addEventListener('click', function () {
    handleDateInput('chart');
});

document.getElementById('editTableDateIcon').addEventListener('click', function () {
    handleDateInput('table');
});

// Function to handle date input for chart and table
function handleDateInput(type) {
    if (!dateInputVisible) {
        const input = document.createElement('input');
        input.type = 'date';
        input.min = '2019-11-08';
        input.max = '2020-01-24';
        input.value = new Date(type === 'chart' ? lastValidChartDate : lastValidTableDate).toISOString().slice(0, 10);

        input.addEventListener('change', function () {
            const selectedDate = new Date(input.value + 'T00:00:00Z');
            if (selectedDate >= new Date('2019-11-08') && selectedDate <= new Date('2020-01-24')) {
                if (type === 'chart') {
                    lastValidChartDate = selectedDate;
                } else {
                    lastValidTableDate = selectedDate;
                }
                updateViewsForSelectedDate(selectedDate);
            }
        });

        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                input.remove();
                dateInputVisible = false;
            }
        });

        const iconId = type === 'chart' ? 'editChartDateIcon' : 'editTableDateIcon';
        document.getElementById(iconId).after(input);
        input.focus();
        dateInputVisible = true;

        input.addEventListener('blur', function () {
            input.remove();
            dateInputVisible = false;
        });
    } else {
        const input = document.querySelector(`#${type === 'chart' ? 'editChartDateIcon' : 'editTableDateIcon'} + input`);
        if (input) {
            input.remove();
        }
        dateInputVisible = false;
    }
}
