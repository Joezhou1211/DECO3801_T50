let intervalId = null;
let globalData = {};
let currentRegion = null;
let selectedSubRegion = null;
let globalMinTweetCount = Infinity;
let globalMaxTweetCount = -Infinity;
let countryNames = {};

const color_start = '#fbf8e9';
const color_end = '#ff2200';

const timelineSlider = document.getElementById('timeline');
const currentLabel = document.getElementById('current-date-label');

let chart;
let dataTable;
let defaultOptions;
let viewMode = 'global';

const continentNames = {
    '002': 'Africa',
    '019': 'Americas',
    '142': 'Asia',
    '150': 'Europe',
    '009': 'Oceania'
};

const subRegionNames = {
    'AU-NSW': 'New South Wales, Australia',
    'AU-VIC': 'Victoria, Australia',
    'AU-QLD': 'Queensland, Australia',
    'AU-SA': 'South Australia, Australia',
    'AU-WA': 'Western Australia, Australia',
    'AU-TAS': 'Tasmania, Australia',
    'AU-NT': 'Northern Territory, Australia',
    'AU-ACT': 'Australian Capital Territory, Australia',
};

const countryToContinent = {
    // Africa
    'DZ': '002', 'AO': '002', 'BJ': '002', 'BW': '002', 'BF': '002', 'BI': '002',
    'CM': '002', 'CV': '002', 'CF': '002', 'TD': '002', 'KM': '002', 'CG': '002',
    'CD': '002', 'CI': '002', 'DJ': '002', 'EG': '002', 'GQ': '002', 'ER': '002',
    'ET': '002', 'GA': '002', 'GM': '002', 'GH': '002', 'GN': '002', 'GW': '002',
    'KE': '002', 'LS': '002', 'LR': '002', 'LY': '002', 'MG': '002', 'MW': '002',
    'ML': '002', 'MR': '002', 'MU': '002', 'YT': '002', 'MA': '002', 'MZ': '002',
    'NA': '002', 'NE': '002', 'NG': '002', 'RE': '002', 'RW': '002', 'SH': '002',
    'ST': '002', 'SN': '002', 'SC': '002', 'SL': '002', 'SO': '002', 'ZA': '002',
    'SS': '002', 'SD': '002', 'SZ': '002', 'TZ': '002', 'TG': '002', 'TN': '002',
    'UG': '002', 'EH': '002', 'ZM': '002', 'ZW': '002',
    // Americas
    'AI': '019', 'AG': '019', 'AR': '019', 'AW': '019', 'BS': '019', 'BB': '019',
    'BZ': '019', 'BM': '019', 'BO': '019', 'BR': '019', 'VG': '019', 'CA': '019',
    'KY': '019', 'CL': '019', 'CO': '019', 'CR': '019', 'CU': '019', 'DM': '019',
    'DO': '019', 'EC': '019', 'SV': '019', 'FK': '019', 'GF': '019', 'GL': '019',
    'GD': '019', 'GP': '019', 'GT': '019', 'GY': '019', 'HT': '019', 'HN': '019',
    'JM': '019', 'MQ': '019', 'MX': '019', 'MS': '019', 'NI': '019', 'PA': '019',
    'PY': '019', 'PE': '019', 'PR': '019', 'BL': '019', 'KN': '019', 'LC': '019',
    'MF': '019', 'PM': '019', 'VC': '019', 'SR': '019', 'TT': '019', 'TC': '019',
    'VI': '019', 'US': '019', 'UY': '019', 'VE': '019',
    // Asia
    'AF': '142', 'AM': '142', 'AZ': '142', 'BH': '142', 'BD': '142', 'BT': '142',
    'BN': '142', 'KH': '142', 'CN': '142', 'CY': '142', 'GE': '142', 'HK': '142',
    'IN': '142', 'ID': '142', 'IR': '142', 'IQ': '142', 'IL': '142', 'JP': '142',
    'JO': '142', 'KZ': '142', 'KP': '142', 'KR': '142', 'KW': '142', 'KG': '142',
    'LA': '142', 'LB': '142', 'MO': '142', 'MY': '142', 'MV': '142', 'MN': '142',
    'MM': '142', 'NP': '142', 'OM': '142', 'PK': '142', 'PS': '142', 'PH': '142',
    'QA': '142', 'SA': '142', 'SG': '142', 'LK': '142', 'SY': '142', 'TW': '142',
    'TJ': '142', 'TH': '142', 'TL': '142', 'TR': '142', 'TM': '142', 'AE': '142',
    'UZ': '142', 'VN': '142', 'YE': '142',
    // Europe
    'AL': '150', 'AD': '150', 'AT': '150', 'BY': '150', 'BE': '150', 'BA': '150',
    'BG': '150', 'HR': '150', 'CZ': '150', 'DK': '150', 'EE': '150', 'FO': '150',
    'FI': '150', 'FR': '150', 'DE': '150', 'GI': '150', 'GR': '150', 'HU': '150',
    'IS': '150', 'IE': '150', 'IT': '150', 'LV': '150', 'LI': '150', 'LT': '150',
    'LU': '150', 'MK': '150', 'MT': '150', 'MD': '150', 'MC': '150', 'ME': '150',
    'NL': '150', 'NO': '150', 'PL': '150', 'PT': '150', 'RO': '150', 'RU': '150',
    'SM': '150', 'RS': '150', 'SK': '150', 'SI': '150', 'ES': '150', 'SE': '150',
    'CH': '150', 'UA': '150', 'GB': '150', 'VA': '150',
    // Oceania
    'AS': '009', 'AU': '009', 'CK': '009', 'FJ': '009', 'PF': '009', 'GU': '009',
    'KI': '009', 'MH': '009', 'FM': '009', 'NR': '009', 'NC': '009', 'NZ': '009',
    'NU': '009', 'NF': '009', 'MP': '009', 'PW': '009', 'PG': '009', 'PN': '009',
    'WS': '009', 'SB': '009', 'TK': '009', 'TO': '009', 'TV': '009', 'VU': '009',
    'WF': '009',
};

document.addEventListener("DOMContentLoaded", function () {
    setupEventListeners();
    loadCountryNamesAndInitialize();
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

    const continentSelector = document.getElementById('continentSelector');
    if (continentSelector) {
        continentSelector.addEventListener('change', function () {
            zoomToContinent(this.value);
        });
    }

    setupBackButton();
}

google.charts.load('current', {
    'packages': ['geochart'],
    'mapsApiKey': 'YOUR_GOOGLE_MAPS_API_KEY'
});
google.charts.setOnLoadCallback(initializeChart);

function loadCountryNamesAndInitialize() {
    fetch('/data/processed/countryNames.json')
        .then(response => response.json())
        .then(data => {
            countryNames = data;
            initializeChart();
        })
        .catch(error => console.error('Error loading country names:', error));
}

function initializeChart() {
    $.getJSON('../../data/processed/map_data.json', function (jsonData) {
        globalData = jsonData;
        initializeTimeline();

        globalData.data.forEach(dateData => {
            dateData.locations.forEach(location => {
                globalMinTweetCount = Math.min(globalMinTweetCount, location.tweet_count);
                globalMaxTweetCount = Math.max(globalMaxTweetCount, location.tweet_count);
            });
        });

        drawColorBar(globalMinTweetCount, globalMaxTweetCount);

        const dayIndex = parseInt(timelineSlider.value, 10);
        const dateData = globalData.data[dayIndex];

        dataTable = new google.visualization.DataTable();
        dataTable.addColumn('string', 'Region');
        dataTable.addColumn('number', 'Tweet Count');
        dataTable.addColumn({ type: 'string', role: 'tooltip', 'p': { 'html': true } });

        const aggregatedData = aggregateDataByCountry(dateData.locations);

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

        setupSidebarForGlobalView(dateData);

        setupInteraction();

        initializePopup();
    }).fail(function () {
        console.error("Failed to load data. Please check the JSON file path and format.");
    });
}

function updateMap(dateData) {
    let filteredLocations;

    if (isContinentCode(currentRegion)) {
        filteredLocations = dateData.locations.filter(location => {
            const countryCode = location.region_code.substring(0, 2);
            return countryToContinent[countryCode] === currentRegion;
        });

        filteredLocations = aggregateDataByCountry(filteredLocations);
    } else if (isCountryCode(currentRegion)) {
        filteredLocations = dateData.locations.filter(location => location.region_code.startsWith(currentRegion + '-'));
    } else {
        filteredLocations = aggregateDataByCountry(dateData.locations);
    }

    dataTable.removeRows(0, dataTable.getNumberOfRows());

    const dataRows = filteredLocations.map(location => {
        let tooltip = generateTooltipContent(location);
        return [location.region_code, location.tweet_count, tooltip];
    });
    dataTable.addRows(dataRows);

    defaultOptions.colorAxis.minValue = globalMinTweetCount;
    defaultOptions.colorAxis.maxValue = globalMaxTweetCount;

    if (isContinentCode(currentRegion)) {
        defaultOptions.region = currentRegion;
        defaultOptions.resolution = 'countries';
    } else if (isCountryCode(currentRegion)) {
        defaultOptions.region = currentRegion;
        defaultOptions.resolution = 'provinces';
    } else {
        defaultOptions.region = 'world';
        defaultOptions.resolution = 'countries';
    }

    chart.draw(dataTable, defaultOptions);
}

function aggregateDataByCountry(locations) {
    const countryData = {};

    locations.forEach(location => {
        const countryCode = location.region_code.split('-')[0];
        if (!countryData[countryCode]) {
            countryData[countryCode] = {
                region_code: countryCode,
                region_name: countryNames[countryCode] || 'Unknown',
                tweet_count: 0,
                fake_news_count: 0,
                fake_news_ratio: 0,
                fake_news_topics: []
            };
        }
        countryData[countryCode].tweet_count += location.tweet_count;
        countryData[countryCode].fake_news_count += location.fake_news_count;
        countryData[countryCode].fake_news_topics = countryData[countryCode].fake_news_topics.concat(location.fake_news_topics);
    });

    Object.values(countryData).forEach(country => {
        country.fake_news_ratio = country.tweet_count > 0 ? (country.fake_news_count / country.tweet_count).toFixed(4) : 0;
    });

    return Object.values(countryData);
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
        console.log("Region clicked:", event.region);
        zoomRegion(event.region);
    });
}

function zoomRegion(region) {
    const dayIndex = parseInt(timelineSlider.value, 10);
    const dateData = globalData.data[dayIndex];
    const backButton = document.getElementById('backButton');

    console.log(`Region clicked: ${region}`);

    if (isCountryCode(region)) {
        currentRegion = region;
        selectedSubRegion = null;
        viewMode = 'country';
        backButton.style.display = 'block';
        backButton.innerText = 'Back to the World Map';

        updateMap(dateData);
        updateContinentFilterForCountry(region);
        updateSidebar(dateData);
    } else if (isSubRegionCode(region)) {
        selectedSubRegion = region;
        viewMode = 'subregion';
        backButton.style.display = 'block';
        backButton.innerText = 'Back to the World Map';

        updateMap(dateData);
        setupSidebarForSubRegionView(selectedSubRegion, dateData);
    } else if (isContinentCode(region)) {
        currentRegion = region;
        selectedSubRegion = null;
        viewMode = 'continent';
        backButton.style.display = 'block';
        backButton.innerText = 'Back to the World Map';

        updateMap(dateData);
        updateContinentFilterForContinent(region);
        updateSidebar(dateData);
    } else {
        currentRegion = null;
        selectedSubRegion = null;
        viewMode = 'global';
        backButton.style.display = 'none';
        updateMap(dateData);
        setupSidebarForGlobalView(dateData);
    }
}

function isContinentCode(code) {
    return ['002', '019', '142', '150', '009'].includes(code);
}

function isCountryCode(code) {
    return /^[A-Z]{2}$/.test(code);
}

function isSubRegionCode(code) {
    return /^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(code);
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
    const regionDetails = document.getElementById('regionDetails');
    let regionName;
    let locations = [];

    if (viewMode === 'global') {
        regionName = 'Global View';
        locations = aggregateDataByCountry(dateData.locations);
        regionDetails.innerHTML = generateSidebarContent(locations, regionName);
    } else if (viewMode === 'continent') {
        setupSidebarForContinentView(currentRegion, dateData);
    } else if (viewMode === 'country') {
        regionName = getRegionName(currentRegion);
        const locationsInCountry = dateData.locations.filter(location => location.region_code.startsWith(currentRegion + '-'));
        const aggregatedCountryData = aggregateDataByCountry(locationsInCountry);
        regionDetails.innerHTML = generateSidebarContent(aggregatedCountryData, regionName);
    } else if (viewMode === 'subregion') {
        regionName = getRegionName(selectedSubRegion);
        const locationData = dateData.locations.find(location => location.region_code === selectedSubRegion);
        if (locationData) {
            locations = [locationData];
            regionDetails.innerHTML = generateSidebarContent(locations, regionName);
        } else {
            regionDetails.innerHTML = `<h2>${regionName}</h2><p>No data available for this state/province.</p>`;
        }
    }
}

function generateSidebarContent(locations, regionName) {
    let totalTweetCount = 0;
    let totalFakeNewsCount = 0;
    let allFakeNewsTopics = [];

    locations.forEach(location => {
        totalTweetCount += location.tweet_count;
        totalFakeNewsCount += location.fake_news_count;
        allFakeNewsTopics = allFakeNewsTopics.concat(location.fake_news_topics);
    });

    const fakeNewsRatio = totalTweetCount > 0 ? (totalFakeNewsCount / totalTweetCount).toFixed(4) : 0;

    const topicCounts = {};
    allFakeNewsTopics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    const sortedTopics = Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a]);
    const topFakeNewsTopics = sortedTopics.length > 0 ? sortedTopics.slice(0, 5) : ['No Topics Available'];

    return `
        <h2>${regionName}</h2>
        <p><strong>Total Tweet Count:</strong> <span>${totalTweetCount}</span></p>
        <p><strong>Total Fake News Count:</strong> <span>${totalFakeNewsCount}</span></p>
        <p><strong>Fake News Ratio:</strong> <span>${fakeNewsRatio}</span></p>
        <p><strong>Top Fake News Topics:</strong></p>
        <ul id="top-fake-news-topics">
            ${topFakeNewsTopics.map(topic => `<li>${topic}</li>`).join('')}
        </ul>
    `;
}

function setupSidebarForGlobalView(dateData) {
    const regionDetails = document.getElementById('regionDetails');

    let totalTweetCount = 0;
    let totalFakeNewsCount = 0;
    let allFakeNewsTopics = [];

    dateData.locations.forEach(location => {
        totalTweetCount += location.tweet_count;
        totalFakeNewsCount += location.fake_news_count;
        allFakeNewsTopics = allFakeNewsTopics.concat(location.fake_news_topics);
    });

    const fakeNewsRatio = totalTweetCount > 0 ? (totalFakeNewsCount / totalTweetCount).toFixed(4) : 0;

    const topicCounts = {};
    allFakeNewsTopics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    const sortedTopics = Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a]);
    const topFakeNewsTopics = sortedTopics.slice(0, 5);

    regionDetails.innerHTML = `
        <h2>Global View</h2>
        <p><strong>Total Tweet Count:</strong> ${totalTweetCount}</p>
        <p><strong>Total Fake News Count:</strong> ${totalFakeNewsCount}</p>
        <p><strong>Fake News Ratio:</strong> ${fakeNewsRatio}</p>
        <p><strong>Top Fake News Topics:</strong></p>
        <ul>
            ${topFakeNewsTopics.map(topic => `<li>${topic}</li>`).join('')}
        </ul>
        <p><strong>Select a continent or country for detailed information.<strong></p>
    `;
}

function setupSidebarForContinentView(continentCode, dateData) {
    const regionDetails = document.getElementById('regionDetails');
    const regionName = continentNames[continentCode] || continentCode;

    const countriesInContinent = Object.keys(countryToContinent).filter(countryCode => countryToContinent[countryCode] === continentCode);

    const locationsInContinent = dateData.locations.filter(location => countriesInContinent.includes(location.region_code.split('-')[0]));

    const aggregatedCountries = aggregateDataByCountry(locationsInContinent);

    let totalTweetCount = 0;
    let totalFakeNewsCount = 0;
    let allFakeNewsTopics = [];

    aggregatedCountries.forEach(country => {
        totalTweetCount += country.tweet_count;
        totalFakeNewsCount += country.fake_news_count;
        allFakeNewsTopics = allFakeNewsTopics.concat(country.fake_news_topics);
    });

    const fakeNewsRatio = totalTweetCount > 0 ? (totalFakeNewsCount / totalTweetCount).toFixed(4) : 0;

    const topicCounts = {};
    allFakeNewsTopics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    const sortedTopics = Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a]);
    const topFakeNewsTopics = sortedTopics.length > 0 ? sortedTopics.slice(0, 5) : ['No Topics Available'];

    let content = `
        <h2>${regionName}</h2>
        <p><strong>Total Tweet Count:</strong> ${totalTweetCount}</p>
        <p><strong>Total Fake News Count:</strong> ${totalFakeNewsCount}</p>
        <p><strong>Fake News Ratio:</strong> ${fakeNewsRatio}</p>
        <p><strong>Top Fake News Topics:</strong></p>
        <ul>
            ${topFakeNewsTopics.map(topic => `<li>${topic}</li>`).join('')}
        </ul>
    `;

    if (aggregatedCountries.length > 0) {
        content += `
            <h3>Countries</h3>
            <div id="countryDataContainer">
                ${aggregatedCountries.map((country, index) => `
                    <div>
                        <strong>${index + 1}. ${country.region_name}</strong><br>
                        <strong>Total Tweet Count:</strong> ${country.tweet_count}<br>
                        <strong>Total Fake News Count:</strong> ${country.fake_news_count}<br>
                        <strong>Fake News Ratio:</strong> ${country.fake_news_ratio}<br>
                        <strong>Top Fake News Topics:</strong>
                        <ul>
                            ${country.fake_news_topics.length > 0 ? country.fake_news_topics.map(topic => `<li>${topic}</li>`).join('') : '<li>No Topics Available</li>'}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    }

    regionDetails.innerHTML = content;
}

function setupSidebarForSubRegionView(subRegionCode, dateData) {
    const regionDetails = document.getElementById('regionDetails');
    const regionName = subRegionNames[subRegionCode] || getRegionName(subRegionCode);

    const locationData = dateData.locations.find(location => location.region_code === subRegionCode);

    if (locationData) {
        const fakeNewsTopicsList = locationData.fake_news_topics
            .map(topic => `<li>${topic}</li>`)
            .join('');

        const content = `
            <h2>${locationData.region_name}</h2>
            <p><strong>Tweet Count:</strong> ${locationData.tweet_count}</p>
            <p><strong>Fake News Count:</strong> ${locationData.fake_news_count}</p>
            <p><strong>Fake News Ratio:</strong> ${locationData.fake_news_ratio}</p>
            <p><strong>Top Fake News Topics:</strong></p>
            <ul>${fakeNewsTopicsList}</ul> 
        `;
        regionDetails.innerHTML = content;
    } else {
        regionDetails.innerHTML = `<h2>${regionName}</h2><p>No data available for this state/province.</p>`;
    }
}

function getRegionName(regionCode) {
    if (isContinentCode(regionCode)) {
        return continentNames[regionCode] || regionCode;
    } else if (isCountryCode(regionCode)) {
        return countryNames[regionCode] || regionCode;
    } else if (isSubRegionCode(regionCode)) {
        return subRegionNames[regionCode] || regionCode;
    } else {
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
                selectedSubRegion = null;
                viewMode = 'country';
                backButton.innerText = 'Back to the World Map';
                updateMap(dateData);
                updateSidebar(dateData);
            } else if (viewMode === 'country' || viewMode === 'continent') {
                currentRegion = null;
                selectedSubRegion = null;
                viewMode = 'global';
                backButton.style.display = 'none';
                updateMap(dateData);
                setupSidebarForGlobalView(dateData);

                const continentSelector = document.getElementById('continentSelector');
                if (continentSelector) {
                    continentSelector.value = "000";
                }
            }
        });
    }
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

function zoomToContinent(continentCode) {
    const dayIndex = parseInt(timelineSlider.value, 10);
    const dateData = globalData.data[dayIndex];

    if (continentCode === "000") {
        currentRegion = null;
        viewMode = 'global';
        updateContinentFilter(viewMode);

        updateMap(dateData);
        setupSidebarForGlobalView(dateData);

        const backButton = document.getElementById('backButton');
        backButton.style.display = 'none';

        const continentSelector = document.getElementById('continentSelector');
        if (continentSelector) {
            continentSelector.value = "000";
        }
    } else {
        currentRegion = continentCode;
        viewMode = 'continent';
        updateMap(dateData);
        updateSidebar(dateData);

        const backButton = document.getElementById('backButton');
        backButton.style.display = 'block';
        backButton.innerText = 'Back to the World Map';

        const continentSelector = document.getElementById('continentSelector');
        if (continentSelector) {
            continentSelector.value = continentCode;
        }
    }
}

function updateContinentFilterForCountry(countryCode) {
    const continentCode = countryToContinent[countryCode];
    const continentSelector = document.getElementById('continentSelector');
    if (continentSelector && continentCode) {
        continentSelector.value = continentCode;
    }
}

function updateContinentFilterForContinent(continentCode) {
    const continentSelector = document.getElementById('continentSelector');
    if (continentSelector && continentCode) {
        continentSelector.value = continentCode;
    }
}

function initializePopup() {
    const togglePopupBtn = document.getElementById('togglePopupBtn');
    const popupContainer = document.getElementById('popupContainer');
    const popupArrowIcon = document.getElementById('popupArrowIcon');

    console.log('Initializing Popup');

    if (togglePopupBtn && popupContainer && popupArrowIcon) {
        popupContainer.classList.add('open');
        popupArrowIcon.style.transform = 'rotate(0deg)';

        updatePopupData();

        togglePopupBtn.addEventListener('click', function () {
            console.log('Popup toggle button clicked');
            popupContainer.classList.toggle('open');

            if (popupContainer.classList.contains('open')) {
                console.log('Popup opened');
                updatePopupData();
                popupArrowIcon.style.transform = 'rotate(0deg)';
            } else {
                console.log('Popup closed');
                popupArrowIcon.style.transform = 'rotate(180deg)';
            }
        });
    } else {
        console.error('The pop-up window related DOM element was not found');
    }
}

function updatePopupData() {
    const dayIndex = parseInt(timelineSlider.value, 10);
    const dateData = globalData.data[dayIndex];
    console.log(`Updating popup data for day index: ${dayIndex}`);

    const unknownDataArray = dateData.locations.filter(location => location.region_code === 'Unknown');
    console.log('Unknown Data Array:', unknownDataArray);

    if (unknownDataArray.length > 0) {
        const totalTweetCount = unknownDataArray.reduce((sum, location) => sum + location.tweet_count, 0);
        const totalFakeNewsCount = unknownDataArray.reduce((sum, location) => sum + location.fake_news_count, 0);
        const fakeNewsRatio = totalTweetCount > 0 ? (totalFakeNewsCount / totalTweetCount).toFixed(4) : 0;

        document.getElementById('popupTweetCount').textContent = totalTweetCount;
        document.getElementById('popupFakeNewsCount').textContent = totalFakeNewsCount;
        document.getElementById('popupFakeNewsRatio').textContent = fakeNewsRatio;


        const allFakeNewsTopics = unknownDataArray.flatMap(location => location.fake_news_topics);
        const topicsList = document.getElementById('popupFakeNewsTopics');
        topicsList.innerHTML = '';

        allFakeNewsTopics.forEach(topic => {
            const li = document.createElement('li');
            li.textContent = topic;
            topicsList.appendChild(li);
        });
    } else {
        document.getElementById('popupTweetCount').textContent = '0';
        document.getElementById('popupFakeNewsCount').textContent = '0';
        document.getElementById('popupFakeNewsRatio').textContent = '0';
        document.getElementById('popupFakeNewsTopics').innerHTML = '<li>No data available</li>';
    }
}

document.getElementById('screenshotButton').addEventListener('click', function () {
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
            console.error('Error fetching or processing data:', error);
        });
});

function drawColorBar(minValue, maxValue) {
    console.log("Drawing color bar with min:", minValue, "and max:", maxValue);
    const canvas = document.getElementById('colorBarCanvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, color_start);
        gradient.addColorStop(1, color_end);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        document.getElementById('minValueLabel').textContent = minValue;
        document.getElementById('maxValueLabel').textContent = maxValue;
    } else {
        console.error("Canvas context not found!");
    }
}