const { continentNames, countryNames, subRegionNames, countryToContinent } = window.MapConstants;

let intervalId = null;
let globalData = {};
let currentRegion = null;
let selectedSubRegion = null;
let globalMinTweetCount = Infinity;
let globalMaxTweetCount = -Infinity;

const color_start = '#faf4d9';
const color_end = '#ff2200';

const timelineSlider = document.getElementById('timeline');
const currentLabel = document.getElementById('current-date-label');

let chart;
let dataTable;
let defaultOptions;
let viewMode = 'global';

const VIEW_MODES = {
    GLOBAL: 'global',
    CONTINENT: 'continent',
    COUNTRY: 'country',
    SUBREGION: 'subregion'
};

document.addEventListener("DOMContentLoaded", function () {
    setupEventListeners();
    // initializeChart();
    initializePopup();
});

function setupEventListeners() {
    if (timelineSlider) {
        timelineSlider.addEventListener('input', function () {
            const dayIndex = parseInt(this.value, 10);
            updateDisplayForDay(dayIndex);
        });
        timelineSlider.addEventListener('mouseleave', function () {
        });
    }


    const toggleAutoPlayBtn = document.getElementById('toggleAutoPlayBtn');
    if (toggleAutoPlayBtn) {
        toggleAutoPlayBtn.addEventListener('click', toggleAutoPlay);
    }

    document.getElementById('continentSelector').addEventListener('change', function(event) {
        zoomToContinent(event.target.value);
    });

    setupBackButton();
}

google.charts.load('current', {
    'packages': ['geochart'],
    'mapsApiKey': ''
});
google.charts.setOnLoadCallback(initializeChart);

function initializeChart() {
    $.getJSON('../../data/processed/map_data.json', function (jsonData) {
        globalData = jsonData;
        initializeTimeline();

        globalMinTweetCount = Infinity;
        globalMaxTweetCount = -Infinity;

        globalData.data.forEach(dateData => {
            dateData.locations.forEach(location => {
                globalMinTweetCount = Math.min(globalMinTweetCount, location.tweet_count);
                globalMaxTweetCount = Math.max(globalMaxTweetCount, location.tweet_count);
            });
        });

        const colorBar = document.getElementById('colorBar');


        const dayIndex = parseInt(timelineSlider.value, 10);
        const dateData = globalData.data[dayIndex];

        dataTable = new google.visualization.DataTable();
        dataTable.addColumn('string', 'Region');
        dataTable.addColumn('number', 'Tweet Count');
        dataTable.addColumn({ type: 'string', role: 'tooltip', 'p': { 'html': true } });

        const aggregatedData = aggregateData(dateData.locations, loc => loc.region_code.split('-')[0]);

        const dataRows = aggregatedData.map(location => {
            let tooltip = generateTooltipContent(location);
            return [location.region_code, location.tweet_count, tooltip];
        });
        dataTable.addRows(dataRows);

        currentLabel.style.display = 'none';

        defaultOptions = {
            backgroundColor: { fill: 'transparent' },
            colorAxis: {
                colors: [color_start, color_end],
                minValue: globalMinTweetCount,
                maxValue: globalMaxTweetCount
            },
            legend: 'none',
            datalessRegionColor: '#f0f0f0',
            displayMode: 'regions',
            width: '100%',
            height: '600px',
            tooltip: { trigger: 'hover', isHtml: true },
            region: 'world',
            resolution: 'countries',
            projection: 'mercator',
            enableRegionInteractivity: true
        };

        chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

        chart.draw(dataTable, defaultOptions);

        setupSidebar(VIEW_MODES.GLOBAL, null, dateData);

        setupInteraction();

        initializePopup();
    }).fail(function () {
        console.error("Failed to load data. Please check the JSON file path and format.");
    });
}

function updateMap(dateData) {
    const regionType = getRegionType(currentRegion);
    const filterFunctions = {
        'continent': location => countryToContinent[location.region_code.substring(0, 2)] === currentRegion,
        'country': location => location.region_code.startsWith(currentRegion + '-'),
        'global': () => true
    };
  
    const filteredLocations = aggregateData(
        dateData.locations.filter(filterFunctions[regionType] || filterFunctions['global']),
        loc => regionType === 'country' ? loc.region_code : loc.region_code.split('-')[0]
    );
  
    dataTable.removeRows(0, dataTable.getNumberOfRows());
    dataTable.addRows(filteredLocations.map(location => [
        location.region_code,
        location.tweet_count,
        generateTooltipContent(location)
    ]));
  
    Object.assign(defaultOptions, {
        colorAxis: { colors: [color_start, color_end],minValue: globalMinTweetCount, maxValue: globalMaxTweetCount },
        region: regionType === 'global' ? 'world' : currentRegion,
        resolution: regionType === 'country' ? 'provinces' : 'countries'
    });
  
    chart.draw(dataTable, defaultOptions);
  }

function generateTooltipContent(location) {
    return `<div style="padding:5px;">
                <strong>${location.region_name}</strong><br/>
                Tweet Count: ${location.tweet_count}<br/>
                Fake News Count: ${location.fake_news_count}<br/>
                Fake News Ratio: ${location.fake_news_ratio}
            </div>`;
}

function setupInteraction() {
    google.visualization.events.addListener(chart, 'regionClick', function (event) {
        zoomRegion(event.region);
    });

    google.visualization.events.addListener(chart, 'select', function () {
        const selection = chart.getSelection();
        if (selection.length > 0) {
            const regionIndex = selection[0].row;
            const regionCode = dataTable.getValue(regionIndex, 0); 
            const tweetCount = dataTable.getValue(regionIndex, 1); 
        }
    });
}

function zoomRegion(region) {
    const dayIndex = parseInt(timelineSlider.value, 10);
    const dateData = globalData.data[dayIndex];
    const backButton = document.getElementById('backButton');
    const regionType = getRegionType(region);

    switch(regionType) {
        case 'country':
            currentRegion = region;
            selectedSubRegion = null;
            viewMode = 'country';
            backButton.style.display = 'block';
            backButton.innerText = 'Back to the World Map';
            break;
        case 'subregion':
            selectedSubRegion = region;
            viewMode = 'subregion';
            backButton.style.display = 'block';
            const countryCode = region.split('-')[0];
            const countryName = countryNames[countryCode] || countryCode;
            backButton.innerText = `Back to ${countryName}`;
            break;
        case 'continent':
            currentRegion = region;
            selectedSubRegion = null;
            viewMode = 'continent';
            backButton.style.display = 'block';
            backButton.innerText = 'Back to World Map';
            break;
        default:
            currentRegion = null;
            selectedSubRegion = null;
            viewMode = 'global';
            backButton.style.display = 'none';
    }

    updateMap(dateData);
    updateSidebar(dateData);
    updateContinentFilter(regionType === 'continent' ? region : null);

    if (regionType !== 'global') {
        const regionData = aggregateData(dateData.locations.filter(location => location.region_code === region), loc => loc.region_code)[0];
        if (regionData) {
            updateColorBarIndicator(regionData.tweet_count);
        }
    }
}

function getRegionType(code) {
    if (['002', '019', '142', '150', '009'].includes(code)) return 'continent';
    if (/^[A-Z]{2}$/.test(code)) return 'country';
    if (/^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(code)) return 'subregion';
    return 'global';
}


function initializeTimeline() {
    timelineSlider.max = globalData.data.length - 1;
    timelineSlider.value = 0;
    updateCurrentLabelPosition();

    timelineSlider.addEventListener('input', function () {
        const dayIndex = parseInt(this.value, 10);
        updateDisplayForDay(dayIndex);
    });
}

function updateCurrentLabelPosition() {
    const dayIndex = parseInt(timelineSlider.value, 10);
    const maxDayIndex = parseInt(timelineSlider.max, 10);
    const sliderWidth = timelineSlider.offsetWidth;
    const thumbPosition = (dayIndex / maxDayIndex) * sliderWidth;
    currentLabel.style.left = `${thumbPosition - currentLabel.offsetWidth / 2}px`;
    currentLabel.style.display = 'block';
}

function updateDisplayForDay(dayIndex) {
    const dateData = globalData.data[dayIndex];
    currentLabel.textContent = dateData.date;
    timelineSlider.value = dayIndex;
    updateMap(dateData);
    updateSidebar(dateData);
    updateCurrentLabelPosition();

    const popupContainer = document.getElementById('popupContainer');
    if (popupContainer.classList.contains('open')) {
        updatePopupData();
    }
}

function updateSidebar(dateData) {
        const viewModeConfig = {
        [VIEW_MODES.GLOBAL]: {
            regionName: 'Global View',
            filterFn: () => true,
            groupBy: loc => countryToContinent[loc.region_code.split('-')[0]]
        },
        [VIEW_MODES.CONTINENT]: {
            regionName: getRegionName(currentRegion),
            filterFn: location => countryToContinent[location.region_code.split('-')[0]] === currentRegion,
            groupBy: loc => loc.region_code.split('-')[0]
        },
        [VIEW_MODES.COUNTRY]: {
            regionName: getRegionName(currentRegion),
            filterFn: location => location.region_code.startsWith(currentRegion + '-'),
            groupBy: loc => loc.region_code
        },
        [VIEW_MODES.SUBREGION]: {
            regionName: getRegionName(selectedSubRegion),
            filterFn: location => location.region_code === selectedSubRegion,
            groupBy: loc => loc.region_code
        }
    };
  
    const { regionName, filterFn, groupBy } = viewModeConfig[viewMode];
    const locations = aggregateData(dateData.locations.filter(filterFn), groupBy);
    
    document.getElementById('regionDetails').innerHTML = generateSidebarContent(locations, regionName, viewMode);
}

function generateSidebarContent(locations, regionName, viewMode) {
    if (locations.length === 0) {
        return `
            <h2>${regionName}</h2>
            <div class="no-data-message">
                <p>No detailed data available for this region.</p>
                <br>
                <p>Possible reasons:</p>
                <ul>
                    <li>Data might not recorded in this level of granularity.</li>
                    <li>No tweets were recorded in this area for the selected date.</li>
                </ul>
                <br><br>
                <p>Please try selecting a different date or region.</p>
            </div>
        `;
    }

    let totalTweetCount = 0;
    let totalFakeNewsCount = 0;
    let topicCounts = {};

    locations.forEach(location => {
        totalTweetCount += location.tweet_count;
        totalFakeNewsCount += location.fake_news_count;
        location.fake_news_topics.forEach(topic => {
            topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
    });

    const fakeNewsRatio = totalTweetCount > 0 ? (totalFakeNewsCount / totalTweetCount * 100).toFixed(2) : 0;

    const sortedTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([topic, count]) => ({ topic, count }));

    let content = `
        <h2>${regionName}</h2>
        <div class="stat-container">
            <div class="stat-item">
                <span class="stat-value">${totalTweetCount.toLocaleString()}</span>
                <span class="stat-label">Total Tweets</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${totalFakeNewsCount.toLocaleString()}</span>
                <span class="stat-label">Fake News</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${fakeNewsRatio}%</span>
                <span class="stat-label">Fake News Ratio</span>
            </div>
        </div>
        <h3>Top Fake News Topics</h3>
        <ul class="topic-list">
            ${sortedTopics.length > 0 ? sortedTopics.map(({ topic, count }) => `
                <li class="topic-item">
                    <span class="topic-name">${topic}</span>
                    <span class="topic-count" title="${count} fake news articles">${count}</span>
                </li>
            `).join('') : '<li class="no-data-message">No Data</li>'}
        </ul>
    `;



    if (viewMode === 'continent') {
        content += `
            <h3>Countries</h3>
            <div id="countryDataContainer">
                ${locations.map((location, index) => `
                    <div>
                        <strong>${index + 1}. ${location.region_name}</strong><br>
                        <strong>Total Tweet Count:</strong> ${location.tweet_count}<br>
                        <strong>Total Fake News Count:</strong> ${location.fake_news_count}<br>
                        <strong>Fake News Ratio:</strong> ${(location.fake_news_count / location.tweet_count * 100).toFixed(2)}%<br>
                    </div>
                `).join('')}
            </div>
        `;
    }

    return content;
}

function setupSidebar(viewType, regionCode, dateData) {
    currentRegion = regionCode;
    viewMode = viewType;
    updateSidebar(dateData);
}

function getRegionName(regionCode) {
    const regionType = getRegionType(regionCode);
    switch(regionType) {
        case 'continent':
            return continentNames[regionCode] || regionCode;
        case 'country':
            return countryNames[regionCode] || regionCode;
        case 'subregion':
            return subRegionNames[regionCode] || regionCode;
        default:
            return regionCode;
    }
}

function toggleAutoPlay() {
    if (intervalId === null) {
        startAutoPlay();
    } else {
        stopAutoPlay();
    }
}

function startAutoPlay() {
    if (intervalId !== null) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
        incrementDay();
        currentLabel.style.display = 'block';
        updateCurrentLabelPosition();
    }, 800);

    const playPauseIcon = document.getElementById('toggleAutoPlayBtn');
    playPauseIcon.classList.remove('fa-play');
    playPauseIcon.classList.add('fa-pause');
}

function stopAutoPlay() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }

    const playPauseIcon = document.getElementById('toggleAutoPlayBtn');
    playPauseIcon.classList.remove('fa-pause');
    playPauseIcon.classList.add('fa-play');
}

function incrementDay() {
    let currentDayIndex = parseInt(timelineSlider.value, 10);
    const maxDayIndex = parseInt(timelineSlider.max, 10);
    if (currentDayIndex < maxDayIndex) {
        currentDayIndex++;
        updateDisplayForDay(currentDayIndex);
    } else {
        stopAutoPlay();
    }
}

function setupBackButton() {
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function () {
            const dayIndex = parseInt(timelineSlider.value, 10);
            const dateData = globalData.data[dayIndex];

            if (viewMode === 'subregion') {
                viewMode = 'country';
                selectedSubRegion = null;
                backButton.innerText = 'Back to World Map';
                updateMap(dateData);
                updateSidebar(dateData);
            } else if (viewMode === 'country' || viewMode === 'continent') {
                currentRegion = null;
                selectedSubRegion = null;
                viewMode = 'global';
                backButton.style.display = 'none';
                updateMap(dateData);
                setupSidebar(VIEW_MODES.GLOBAL, null, dateData);

                const continentSelector = document.getElementById('continentSelector');
                if (continentSelector) {
                    continentSelector.value = "000";
                }
            }
        });
    }
}



function updateViewMode(newViewMode, regionCode, dateData) {
    currentRegion = regionCode;
    viewMode = newViewMode;
    updateMap(dateData);
    updateSidebar(dateData);

    const backButton = document.getElementById('backButton');
    backButton.style.display = newViewMode === VIEW_MODES.GLOBAL ? 'none' : 'block';
    backButton.innerText = 'Back to the World Map';

    const continentSelector = document.getElementById('continentSelector');
    if (continentSelector) {
        continentSelector.value = regionCode || "000";
    }
}

function zoomToContinent(continentCode) {
    const dayIndex = parseInt(timelineSlider.value, 10);
    const dateData = globalData.data[dayIndex];

    updateViewMode(continentCode === "000" ? VIEW_MODES.GLOBAL : VIEW_MODES.CONTINENT, continentCode, dateData);
}


function updateContinentFilter(viewMode) {
    const continentFilter = document.getElementById('continentSelector');
    if (viewMode === 'global') {
        continentFilter.style.display = 'block';
        continentFilter.value = '000';
    } else {
        continentFilter.style.display = 'block';
    }
}

function initializePopup() {
    const togglePopupBtn = document.getElementById('togglePopupBtn');
    const popupContainer = document.getElementById('popupContainer');
    const popupArrowIcon = document.getElementById('popupArrowIcon');

    if (togglePopupBtn && popupContainer && popupArrowIcon) {
        popupContainer.classList.add('open');
        popupArrowIcon.style.transform = 'rotate(0deg)';

        updatePopupData();

        togglePopupBtn.addEventListener('click', function () {
            popupContainer.classList.toggle('open');

            if (popupContainer.classList.contains('open')) {
                updatePopupData();
                popupArrowIcon.style.transform = 'rotate(0deg)';
            } else {
                popupArrowIcon.style.transform = 'rotate(180deg)';
            }
        });
    } else {
        console.error('The pop-up window related DOM element was not found');
    }
}

function updatePopupData() {
    const dayIndex = parseInt(timelineSlider.value, 10);
    // const { locations = [] } = globalData.data[dayIndex] || {};
    const { locations = [] } = (globalData.data && globalData.data[dayIndex]) || {};
  
    const unknownData = aggregateData(locations.filter(location => location.region_code === 'Unknown'), loc => 'Unknown')[0] || {};
  
    const { tweet_count = 0, fake_news_count = 0, fake_news_topics = [] } = unknownData;
  
    document.getElementById('popupTweetCount').textContent = tweet_count;
    document.getElementById('popupFakeNewsCount').textContent = fake_news_count;
    document.getElementById('popupFakeNewsRatio').textContent = tweet_count > 0 ? 
      (fake_news_count / tweet_count).toFixed(4) : 0;
  
    document.getElementById('popupFakeNewsTopics').innerHTML = fake_news_topics
      .map(topic => `<li>${topic}</li>`)
      .join('') || '<li>No data available</li>';
  }

document.getElementById('downloadButton').addEventListener('click', function () {
    const dayIndex = parseInt(document.getElementById('timeline').value, 10);
    const jsonDataPath = '../../data/processed/map_data.json';

    fetch(jsonDataPath)
        .then(response => response.json())
        .then(data => {
            const selectedDateData = data.data[dayIndex];
            const jsonContent = JSON.stringify(selectedDateData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `data-${selectedDateData.date}.json`;
            link.click();
            URL.revokeObjectURL(link.href);
        })
        .catch(error => {
            console.error('下载数据时出错:', error);
        });
});


function updateColorBarIndicator(tweetCount) {
    const colorBar = document.querySelector('.color-bar');
    const indicator = document.querySelector('.color-bar-indicator');
    if (!colorBar || !indicator) {
        console.error("Color bar or indicator element not found!");
        return;
    }

    const minValue = globalMinTweetCount;
    const maxValue = globalMaxTweetCount;
    const range = maxValue - minValue;
    const normalizedValue = (tweetCount - minValue) / range;
    const position = colorBar.offsetHeight * (1 - normalizedValue);

    indicator.style.top = `${position}px`;
    indicator.style.display = 'block';
}


function aggregateData(locations, groupBy) {
    const aggregated = {};
    locations.forEach(location => {
      const key = groupBy(location);
      if (!aggregated[key]) {
        aggregated[key] = {
            region_code: key,
            region_name: getRegionName(key),
            tweet_count: 0,
            fake_news_count: 0,
            fake_news_topics: new Set()
        };
      }
        aggregated[key].tweet_count += location.tweet_count;
        aggregated[key].fake_news_count += location.fake_news_count;
        aggregated[key].fake_news_topics = new Set([...aggregated[key].fake_news_topics, ...location.fake_news_topics]);
    });
    return Object.values(aggregated).map(item => ({...item, fake_news_topics: Array.from(item.fake_news_topics)}));
}