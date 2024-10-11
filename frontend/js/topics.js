let globalData = [];
let filtered = [];
let firstDate = null;
let lastDate = null;

let showTable = false;

let filters = {
    start_date: null,
    end_date: null,
    sentiments: {
        positive: true,
        neutral: true,
        negative: true
    }
};

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

document.getElementById("downloadBtn").addEventListener('click', () => {
    downloadCSV("id,created_at,reply,retweet,favorate,quote,sentiment,topic\n", filtered);
});

document.addEventListener('DOMContentLoaded', function () {
    fetchData();

    const minDate = new Date('2019-11-07');
    const maxDate = new Date('2020-01-25');

    let lastValidChartDate = minDate;
    let lastValidTableDate = minDate;

document.getElementById('editChartDateIcon').addEventListener('click', function() {
    const chartDate = document.getElementById('chartDate');
    chartDate.setAttribute('contenteditable', true);
    chartDate.focus();
});

document.getElementById('editTableDateIcon').addEventListener('click', function() {
    const tableDate = document.getElementById('tableDate');
    tableDate.setAttribute('contenteditable', true);
    tableDate.focus();
});

document.getElementById('chartDate').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        applyChartDateChange();
    }
});
document.getElementById('chartDate').addEventListener('blur', applyChartDateChange);

function applyChartDateChange() {
    const chartDateInput = document.getElementById('chartDate').textContent.trim();
    const newDate = new Date(chartDateInput);

    // Check if the newDate is valid and within the allowed range
    if (!isNaN(newDate.getTime()) && newDate >= minDate && newDate <= maxDate) {
        lastValidChartDate = newDate; // Save the last valid date
        const chartData = processChartData(globalData, newDate);
        updateChart(chartData);

        // Format the displayed date consistently
        document.getElementById('chartDate').textContent = newDate.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short', // Ensure short month format (e.g., "Jan")
            day: 'numeric'
        });

        document.getElementById('chartDate').setAttribute('contenteditable', false); // Disable editing
    } else {
        alert('Please enter a date between 8 Nov 2019 and 24 Jan 2020.');
        document.getElementById('chartDate').textContent = lastValidChartDate.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        document.getElementById('chartDate').setAttribute('contenteditable', false); // Disable editing
    }
}

document.getElementById('tableDate').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        applyTableDateChange();
    }
});
document.getElementById('tableDate').addEventListener('blur', applyTableDateChange);

function applyTableDateChange() {
    const newDate = new Date(document.getElementById('tableDate').textContent);
    if (!isNaN(newDate.getTime()) && newDate >= minDate && newDate <= maxDate) {
        lastValidTableDate = newDate;
        updateTable(globalData, newDate);
        document.getElementById('tableDate').setAttribute('contenteditable', false);
    } else {
        alert('Please enter a date between 8 Nov 2019 and 24 Jan 2020.');
        document.getElementById('tableDate').textContent = lastValidTableDate.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        document.getElementById('tableDate').setAttribute('contenteditable', false);
    }
}



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
                    filtered = globalData;
                    dates = generateDateArrayFromData(globalData).sort((a, b) => a-b); // 初始化 dates
                    timeline.max = dates.length - 1;
                    const initialDate = dates[0];
                    firstDate = dates[0];
                    lastDate = dates[dates.length - 1];
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
    let filteredData = data.filter(item => {
        const matchesSentiment = (filters.sentiments.positive && item.sentimentCode === 'positive') ||
                                 (filters.sentiments.neutral && item.sentimentCode === 'neutral') ||
                                 (filters.sentiments.negative && item.sentimentCode === 'negative');

        return matchesSentiment;
    });
    if (selectedDate) {
        const startDate = new Date(selectedDate);
        const endDate = new Date(selectedDate);
        endDate.setDate(endDate.getDate() + 1);
        filteredData = filteredData.filter(item => {
            const itemDate = new Date(item.created_at_dt);
            return itemDate >= startDate && itemDate < endDate;
        });
    }

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
        filteredData = filteredData.filter(item => {
            const itemDate = new Date(item.itemTimestamp);
            return itemDate >= startDate && itemDate <= endDate;
        });
    } else if (startDate) {
        filteredData = filteredData.filter(item => {
            return new Date(item.itemTimestamp).toLocaleDateString('en-GB') === startDate.toLocaleDateString('en-GB');
        });
    }

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
        topicSentiments[key] = { id: key, reply: 0, share: 0, like: 0, quote: 0, positive: 0, neutral: 0, negative: 0 };
    }

    filteredData.forEach(item => {
        const topicId = item.main_topic;
        const sentiment = item.sentiment;
        topicSentiments[topicId].reply += item.reply_count;
        topicSentiments[topicId].share += item.retweet_count;
        topicSentiments[topicId].like += item.favourite_count;
        topicSentiments[topicId].quote += item.quote_count;
        if (sentiment === 'Positive') {
            topicSentiments[topicId].positive += 1;
        } else if (sentiment === 'Neutral') {
            topicSentiments[topicId].neutral += 1;
        } else if (sentiment === 'Negative') {
            topicSentiments[topicId].negative += 1;
        }
    });

    let rowsHtml = '';
    topicSentiments.sort((a,b) => ((b.positive + b.neutral + b.negative) - (a.positive + a.neutral + a.negative)))
        .forEach(item => {
        const topicName = topics[item.id] || `Topic ${item.id}`;
        const positivePercentage = (item.positive / (item.positive + item.neutral + item.negative) * 100).toFixed(2);
        const neutralPercentage = (item.neutral / (item.positive + item.neutral + item.negative) * 100).toFixed(2);
        const negativePercentage = (item.negative / (item.positive + item.neutral + item.negative) * 100).toFixed(2);
        rowsHtml += `
            <tr class="${isNaN(positivePercentage) ? "bg-gray" : ""}">
                <td>${topicName}</td>
                <td>${item.positive + item.neutral + item.negative}</td>
                <td>${item.reply}</td>
                <td>${item.share}</td>
                <td>${item.like}</td>
                <td>${item.quote}</td>
                <td>${isNaN(positivePercentage) ? '--' : positivePercentage}%</td>
                <td>${isNaN(neutralPercentage) ? '--' : neutralPercentage}%</td>
                <td>${isNaN(negativePercentage) ? '--' : negativePercentage}%</td>
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
    const uniqueDates = [...new Set(data.map(item => new Date(item.created_at_dt).toDateString()))];
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

    const selectedDate = dates[timeline.value];

    updateTable(globalData, selectedDate);

    const formattedDate = selectedDate.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    tableDate.innerText = formattedDate;
});


chartViewBtn.addEventListener('click', function () {
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
                                    {text: 'Sentiment:   ', fillStyle: 'transparent', strokeStyle: 'transparent', borderWidth: 0},
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
    document.getElementById('checkboxes').classList.add("hidden");
    showTable = true;
});


chartViewBtn.addEventListener('click', function() {
    chartViewBtn.classList.add('active');
    tableViewBtn.classList.remove('active');
    document.getElementById('checkboxes').classList.remove("hidden");
    showTable = false;
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

let dates = generateDateArray('2019-11-08', '2020-01-24');

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

timeline.addEventListener('input', function () {
    updateDatePosition();
    const selectedDate = dates[timeline.value];

    if (isPlaying) {
        const chartData = processAccumulatedData(globalData, dates[0], selectedDate);
        updateChart(chartData);
        updateTable(globalData, dates[0], selectedDate);
    } else {
        const chartData = processChartData(globalData, selectedDate);
        updateChart(chartData);
        updateTable(globalData, selectedDate);
    }
});


let initialStartDate = new Date('2019-11-08');
let initialEndDate = new Date('2020-01-24');
let currentDate = initialStartDate;

function formatDate(date) {
    return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function updateChartSingleDateLabel(selectedDate) {
    const chartDateLabel = document.getElementById('chartDate');
    chartDateLabel.textContent = formatDate(selectedDate);
}

function updateTableSingleDateLabel(selectedDate) {
    const tableDateLabel = document.getElementById('tableDate');
    tableDateLabel.textContent = formatDate(selectedDate);
}

function updateChartDateRangeLabel(startDate, endDate) {
    const chartDateLabel = document.getElementById('chartDate');
    chartDateLabel.textContent = `from ${formatDate(startDate)} to ${formatDate(endDate)}`;
}

function updateTableDateRangeLabel(startDate, endDate) {
    const tableDateLabel = document.getElementById('tableDate');
    tableDateLabel.textContent = `from ${formatDate(startDate)} to ${formatDate(endDate)}`;
}
let isPlaying = false;
let playInterval;

const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');

playPauseBtn.addEventListener('click', function () {
    if (isPlaying) {
        clearInterval(playInterval);
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
        isPlaying = false;
    } else {
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
        isPlaying = true;
        startPlayingTimeline();
    }
});

function startPlayingTimeline() {
    let currentValue = parseInt(timeline.value);
    let initialStartDate = dates[0];

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


timeline.addEventListener('input', function () {
    if (isPlaying) {
        clearInterval(playInterval);
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
        isPlaying = false;
    }

    const selectedDate = dates[timeline.value];

    updateChartSingleDateLabel(selectedDate);
    updateTableSingleDateLabel(selectedDate);

    const chartData = processChartData(globalData, selectedDate);
    updateChart(chartData);
    updateTable(globalData, selectedDate);
});

function updateTimelineAndChart(value) {
    const selectedDate = dates[value];
    const chartData = processAccumulatedData(globalData, dates[0], selectedDate); // 从开始日期累积到选中的日期
    updateChart(chartData);
    updateTable(globalData, dates[0], selectedDate); // 更新表格为累积数据
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

    // 累积从 startDate 到 endDate 的数据
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
        const formattedStartDate = new Date(startDate).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const formattedEndDate = new Date(endDate).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        if (showTable) {
            tableDate.innerText = `from ${formattedStartDate} to ${formattedEndDate}`;
            updateTable(filteredData, null);
        }else{
            chartDate.innerText = `from ${formattedStartDate} to ${formattedEndDate}`;
            const chartData = processChartData(filteredData, null);
            updateChart(chartData);
        }
    } else {
        if (showTable) {
            updateTable(filteredData, selectedDate);
        }else{
            const chartData = processChartData(filteredData, selectedDate);
            updateChart(chartData);
        }
    }

    filterView.classList.remove('open');
});

closeFilterBtn.addEventListener('click', function () {
    filterView.classList.remove('open');
});

document.getElementById('filterBtn').addEventListener('click', function () {
    filterView.classList.toggle('open');
});




let lastVisibility = null;

function checkTimelineVisibility() {
    const timeline = document.querySelector('.timeline-container');
    const rect = timeline.getBoundingClientRect();
    const isVisible = rect.bottom <= window.innerHeight && rect.top >= 500;

    if (isVisible !== lastVisibility) {
        lastVisibility = isVisible;

        if (!isVisible) {
            timeline.style.position = 'fixed';
            timeline.style.bottom = '10px';
            timeline.style.left = '30px';
            timeline.style.height = '18px';
            timeline.style.width = 'calc(100% - 100px)';
            timeline.style.backgroundColor = 'white';
            timeline.style.borderRadius = '20px';
            timeline.style.boxShadow = '0px 0px 3px 1px gray';
        } else {
            timeline.style.position = '';
            timeline.style.bottom = '';
            timeline.style.left = '';
            timeline.style.width = '';
            timeline.style.backgroundColor = '';
            timeline.style.borderRadius = '';
            timeline.style.boxShadow = '';
        }
    }
}

window.addEventListener('scroll', checkTimelineVisibility);
window.addEventListener('resize', checkTimelineVisibility);


