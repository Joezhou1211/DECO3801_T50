// Global Variables and Constants
let intervalId = null;
let globalData = {};
let currentRegion = null;
let selectedSubRegion = null;
let globalMinTweetCount = Infinity;
let globalMaxTweetCount = -Infinity;

// Color constants for chart configuration.
const color_start = '#fbf8e9';
const color_end = '#ff2200';

// HTML elements needed for interactivity.
const timelineSlider = document.getElementById('timeline');
const currentLabel = document.getElementById('current-date-label');

// Variables for handling the visualization.
let chart;
let dataTable;
let defaultOptions;
let viewMode = 'global';

/**
 * Maps continent codes to their respective continent names.
 * This mapping is used to convert standardized continent codes into more readable continent names.
 */
const continentNames = {
    '002': 'Africa',
    '019': 'Americas',
    '142': 'Asia',
    '150': 'Europe',
    '009': 'Oceania'
};

/**
 * Maps country codes (ISO Alpha-2 codes) to their respective country names.
 * This mapping is used to convert country codes into human-readable country names for display purposes.
 */
const countryNames = {
    'AF': 'Afghanistan',
    'AL': 'Albania',
    'DZ': 'Algeria',
    'AS': 'American Samoa',
    'AD': 'Andorra',
    'AO': 'Angola',
    'AI': 'Anguilla',
    'AQ': 'Antarctica',
    'AG': 'Antigua and Barbuda',
    'AR': 'Argentina',
    'AM': 'Armenia',
    'AW': 'Aruba',
    'AU': 'Australia',
    'AT': 'Austria',
    'AZ': 'Azerbaijan',
    'BS': 'Bahamas',
    'BH': 'Bahrain',
    'BD': 'Bangladesh',
    'BB': 'Barbados',
    'BY': 'Belarus',
    'BE': 'Belgium',
    'BZ': 'Belize',
    'BJ': 'Benin',
    'BM': 'Bermuda',
    'BT': 'Bhutan',
    'BO': 'Bolivia',
    'BA': 'Bosnia and Herzegovina',
    'BW': 'Botswana',
    'BR': 'Brazil',
    'IO': 'British Indian Ocean Territory',
    'BN': 'Brunei Darussalam',
    'BG': 'Bulgaria',
    'BF': 'Burkina Faso',
    'BI': 'Burundi',
    'KH': 'Cambodia',
    'CM': 'Cameroon',
    'CA': 'Canada',
    'CV': 'Cape Verde',
    'KY': 'Cayman Islands',
    'CF': 'Central African Republic',
    'TD': 'Chad',
    'CL': 'Chile',
    'CN': 'China',
    'CX': 'Christmas Island',
    'CC': 'Cocos (Keeling) Islands',
    'CO': 'Colombia',
    'KM': 'Comoros',
    'CG': 'Congo',
    'CD': 'Congo, Democratic Republic',
    'CK': 'Cook Islands',
    'CR': 'Costa Rica',
    'CI': "Côte d'Ivoire",
    'HR': 'Croatia',
    'CU': 'Cuba',
    'CY': 'Cyprus',
    'CZ': 'Czech Republic',
    'DK': 'Denmark',
    'DJ': 'Djibouti',
    'DM': 'Dominica',
    'DO': 'Dominican Republic',
    'EC': 'Ecuador',
    'EG': 'Egypt',
    'SV': 'El Salvador',
    'GQ': 'Equatorial Guinea',
    'ER': 'Eritrea',
    'EE': 'Estonia',
    'ET': 'Ethiopia',
    'FK': 'Falkland Islands',
    'FO': 'Faroe Islands',
    'FJ': 'Fiji',
    'FI': 'Finland',
    'FR': 'France',
    'GF': 'French Guiana',
    'PF': 'French Polynesia',
    'GA': 'Gabon',
    'GM': 'Gambia',
    'GE': 'Georgia',
    'DE': 'Germany',
    'GH': 'Ghana',
    'GI': 'Gibraltar',
    'GR': 'Greece',
    'GL': 'Greenland',
    'GD': 'Grenada',
    'GP': 'Guadeloupe',
    'GU': 'Guam',
    'GT': 'Guatemala',
    'GG': 'Guernsey',
    'GN': 'Guinea',
    'GW': 'Guinea-Bissau',
    'GY': 'Guyana',
    'HT': 'Haiti',
    'VA': 'Holy See (Vatican City State)',
    'HN': 'Honduras',
    'HK': 'Hong Kong',
    'HU': 'Hungary',
    'IS': 'Iceland',
    'IN': 'India',
    'ID': 'Indonesia',
    'IR': 'Iran',
    'IQ': 'Iraq',
    'IE': 'Ireland',
    'IM': 'Isle of Man',
    'IL': 'Israel',
    'IT': 'Italy',
    'JM': 'Jamaica',
    'JP': 'Japan',
    'JE': 'Jersey',
    'JO': 'Jordan',
    'KZ': 'Kazakhstan',
    'KE': 'Kenya',
    'KI': 'Kiribati',
    'KR': 'South Korea',
    'KW': 'Kuwait',
    'KG': 'Kyrgyzstan',
    'LA': 'Laos',
    'LV': 'Latvia',
    'LB': 'Lebanon',
    'LS': 'Lesotho',
    'LR': 'Liberia',
    'LY': 'Libya',
    'LI': 'Liechtenstein',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'MO': 'Macao',
    'MK': 'North Macedonia',
    'MG': 'Madagascar',
    'MW': 'Malawi',
    'MY': 'Malaysia',
    'MV': 'Maldives',
    'ML': 'Mali',
    'MT': 'Malta',
    'MH': 'Marshall Islands',
    'MQ': 'Martinique',
    'MR': 'Mauritania',
    'MU': 'Mauritius',
    'YT': 'Mayotte',
    'MX': 'Mexico',
    'FM': 'Micronesia',
    'MD': 'Moldova',
    'MC': 'Monaco',
    'MN': 'Mongolia',
    'ME': 'Montenegro',
    'MS': 'Montserrat',
    'MA': 'Morocco',
    'MZ': 'Mozambique',
    'MM': 'Myanmar',
    'NA': 'Namibia',
    'NR': 'Nauru',
    'NP': 'Nepal',
    'NL': 'Netherlands',
    'NC': 'New Caledonia',
    'NZ': 'New Zealand',
    'NI': 'Nicaragua',
    'NE': 'Niger',
    'NG': 'Nigeria',
    'NU': 'Niue',
    'NF': 'Norfolk Island',
    'MP': 'Northern Mariana Islands',
    'NO': 'Norway',
    'OM': 'Oman',
    'PK': 'Pakistan',
    'PW': 'Palau',
    'PS': 'Palestine',
    'PA': 'Panama',
    'PG': 'Papua New Guinea',
    'PY': 'Paraguay',
    'PE': 'Peru',
    'PH': 'Philippines',
    'PL': 'Poland',
    'PT': 'Portugal',
    'PR': 'Puerto Rico',
    'QA': 'Qatar',
    'RE': 'Réunion',
    'RO': 'Romania',
    'RU': 'Russia',
    'RW': 'Rwanda',
    'WS': 'Samoa',
    'SM': 'San Marino',
    'ST': 'Sao Tome and Principe',
    'SA': 'Saudi Arabia',
    'SN': 'Senegal',
    'RS': 'Serbia',
    'SC': 'Seychelles',
    'SL': 'Sierra Leone',
    'SG': 'Singapore',
    'SK': 'Slovakia',
    'SI': 'Slovenia',
    'SB': 'Solomon Islands',
    'SO': 'Somalia',
    'ZA': 'South Africa',
    'ES': 'Spain',
    'LK': 'Sri Lanka',
    'SD': 'Sudan',
    'SR': 'Suriname',
    'SE': 'Sweden',
    'CH': 'Switzerland',
    'SY': 'Syria',
    'TW': 'Taiwan',
    'TJ': 'Tajikistan',
    'TZ': 'Tanzania',
    'TH': 'Thailand',
    'TL': 'Timor-Leste',
    'TG': 'Togo',
    'TK': 'Tokelau',
    'TO': 'Tonga',
    'TT': 'Trinidad and Tobago',
    'TN': 'Tunisia',
    'TR': 'Turkey',
    'TM': 'Turkmenistan',
    'TC': 'Turks and Caicos Islands',
    'TV': 'Tuvalu',
    'UG': 'Uganda',
    'UA': 'Ukraine',
    'AE': 'United Arab Emirates',
    'GB': 'United Kingdom',
    'US': 'United States',
    'UY': 'Uruguay',
    'UZ': 'Uzbekistan',
    'VU': 'Vanuatu',
    'VE': 'Venezuela',
    'VN': 'Vietnam',
    'WF': 'Wallis and Futuna',
    'EH': 'Western Sahara',
    'YE': 'Yemen',
    'ZM': 'Zambia',
    'ZW': 'Zimbabwe',
    'Unknown': 'Unknown'
};

/**
 * Maps state or province codes to their respective names.
 * This mapping is used to display detailed data at a regional level within countries.
 */
const subRegionNames = {
    // Australia States and Territories
    'AU-NSW': 'New South Wales, Australia',
    'AU-VIC': 'Victoria, Australia',
    'AU-QLD': 'Queensland, Australia',
    'AU-SA': 'South Australia, Australia',
    'AU-WA': 'Western Australia, Australia',
    'AU-TAS': 'Tasmania, Australia',
    'AU-NT': 'Northern Territory, Australia',
    'AU-ACT': 'Australian Capital Territory, Australia',
};

/**
 * Maps country codes to their corresponding continent codes.
 * This mapping is used to determine the continent of a given country, facilitating continent-level data filtering.
 */
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

/**
 * This event listener waits for the entire HTML document to be fully loaded and parsed before executing the specified
 * callback function.
 */
document.addEventListener("DOMContentLoaded", function () {
    setupEventListeners();
    initializeChart();
    initializePopup(); // 初始化弹出窗口
});

/**
 * Initializes event listeners for different UI components.
 *
 * Functionality:
 * Sets up interactive behavior for various UI elements, including the timeline slider, autoplay button,
 * continent selector, and back button.
 * Ensures that user actions are handled correctly to update the chart or interface accordingly.
 */
function setupEventListeners() {
    // Timeline Slider Input Event
    if (timelineSlider) {
        timelineSlider.addEventListener('input', function () {
            const dayIndex = parseInt(this.value, 10);
            updateDisplayForDay(dayIndex);
            // updateCurrentLabelPosition(); // 可选：如果需要同步标签位置
        });
        timelineSlider.addEventListener('mouseleave', function () {
            // 可选：添加相关逻辑
        });
    }

    // Autoplay Button Click Event
    const toggleAutoPlayBtn = document.getElementById('toggleAutoPlayBtn');
    if (toggleAutoPlayBtn) {
        toggleAutoPlayBtn.addEventListener('click', toggleAutoPlay);
    }

    // Continent Selector Change Event
    const continentSelector = document.getElementById('continentSelector');
    if (continentSelector) {
        continentSelector.addEventListener('change', function () {
            zoomToContinent(this.value);
        });
    }

    // Back Button Click Event
    setupBackButton();
}

/**
 * Initializes the Google Charts environment and sets up the GeoChart once the required data is loaded.
 */
google.charts.load('current', {
    'packages': ['geochart'],
    'mapsApiKey': 'YOUR_GOOGLE_MAPS_API_KEY' // 请替换为您的实际 API 密钥
});
google.charts.setOnLoadCallback(initializeChart);

/**
 * Fetches data and sets up the chart to visualize information on the map.
 *
 * Functionality:
 * Loads the JSON data containing tweet and fake news information for various locations.
 * Initializes the Google GeoChart and configures its visual settings.
 * Sets up tooltips for the data points to display additional information.
 * Prepares the map with the appropriate color axis settings based on tweet counts.
 * Draws the map and sets up the interaction and sidebar for global view.
 */
function initializeChart() {
    $.getJSON('../../data/processed/fake_news_data.json', function (jsonData) {
        globalData = jsonData;
        initializeTimeline();

        // 计算全局最小和最大 Tweet 数量
        globalData.data.forEach(dateData => {
            dateData.locations.forEach(location => {
                globalMinTweetCount = Math.min(globalMinTweetCount, location.tweet_count);
                globalMaxTweetCount = Math.max(globalMaxTweetCount, location.tweet_count);
            });
        });

        const dayIndex = parseInt(timelineSlider.value, 10);
        const dateData = globalData.data[dayIndex];

        // Initialize DataTable with 'tooltip' column
        dataTable = new google.visualization.DataTable();
        dataTable.addColumn('string', 'Region');
        dataTable.addColumn('number', 'Tweet Count');
        dataTable.addColumn({ type: 'string', role: 'tooltip', 'p': { 'html': true } });

        // Aggregate data by country for initial view
        const aggregatedData = aggregateDataByCountry(dateData.locations);

        // Initialize Data Rows
        const dataRows = aggregatedData.map(location => {
            let tooltip = generateTooltipContent(location);
            return [location.region_code, location.tweet_count, tooltip];
        });
        dataTable.addRows(dataRows);

        currentLabel.style.display = 'none';

        // Initialize Color Axis using global min and max tweet count
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

        // Initialize GeoChart
        chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

        // Draw Initial Map
        chart.draw(dataTable, defaultOptions);

        // Setup Sidebar for Global View
        setupSidebarForGlobalView(dateData);

        // Setup Chart Interaction
        setupInteraction();

        // Initialize Popup
        initializePopup();
    }).fail(function () {
        console.error("Failed to load data. Please check the JSON file path and format.");
    });
}

/**
 * Updates the map with new data filtered by the selected region or date.
 *
 * Functionality:
 * Filters and updates the map data based on the user's selection of continent, country, or global view.
 * Dynamically adjusts the displayed regions on the map and updates the tooltips with relevant information.
 * Modifies the color axis of the map according to the tweet count data.
 *
 * @param {Object} dateData - The data for the selected date that will be used to update the map.
 */
function updateMap(dateData) {
    let filteredLocations = dateData.locations;

    if (isContinentCode(currentRegion)) {
        // Filter locations by continent
        filteredLocations = dateData.locations.filter(location => {
            const countryCode = location.region_code.substring(0, 2);  // Extract country code from region code
            return countryToContinent[countryCode] === currentRegion;
        });
        // Aggregate data by country
        filteredLocations = aggregateDataByCountry(filteredLocations);
    } else if (isCountryCode(currentRegion)) {
        // Filter locations by country
        filteredLocations = dateData.locations.filter(location => location.region_code.startsWith(currentRegion + '-'));
    } else {
        // Global view: Aggregate data by country for a uniform display
        filteredLocations = aggregateDataByCountry(dateData.locations);
    }

    // Clear existing rows
    dataTable.removeRows(0, dataTable.getNumberOfRows());

    // Add new rows with tooltip
    const dataRows = filteredLocations.map(location => {
        let tooltip = generateTooltipContent(location);
        return [location.region_code, location.tweet_count, tooltip];
    });
    dataTable.addRows(dataRows);

    // Use global min and max Tweet count for the color axis
    defaultOptions.colorAxis.minValue = globalMinTweetCount;
    defaultOptions.colorAxis.maxValue = globalMaxTweetCount;

    // Set Map Region and Resolution Based on Current Selection
    if (isContinentCode(currentRegion)) {
        defaultOptions.region = currentRegion;
        defaultOptions.resolution = 'countries';
    } else if (isCountryCode(currentRegion)) {
        defaultOptions.region = currentRegion;
        defaultOptions.resolution = 'provinces';
    } else {
        // Global View
        defaultOptions.region = 'world';
        defaultOptions.resolution = 'countries';
    }

    // Redraw the Map
    chart.draw(dataTable, defaultOptions);
}

/**
 * Aggregates tweet data by country for the global view to ensure consistency.
 *
 * @param {Array} locations - The array of location data for the selected date.
 * @returns {Array} The aggregated data by country.
 */
function aggregateDataByCountry(locations) {
    const countryData = {};

    locations.forEach(location => {
        const countryCode = location.region_code.split('-')[0]; // Extract country code
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

    // Calculate fake news ratio for each country
    Object.values(countryData).forEach(country => {
        country.fake_news_ratio = country.tweet_count > 0 ? (country.fake_news_count / country.tweet_count).toFixed(4) : 0;
    });

    return Object.values(countryData);
}

/**
 * Generates the HTML content for the tooltip to display detailed region information.
 *
 * @param {Object} location - The location data containing region details.
 * @returns {String} The HTML content for the tooltip.
 */
function generateTooltipContent(location) {
    return `<div style="padding:5px;">
                <strong>${location.region_name}</strong><br/>
                Tweet Count: ${location.tweet_count}<br/>
                Fake News Count: ${location.fake_news_count}<br/>
                Fake News Ratio: ${location.fake_news_ratio}
            </div>`;
}

/**
 * Configures interactive behavior for the GeoChart, enabling custom handling of region clicks.
 * Adds an event listener to the chart that triggers when a user clicks on a specific region.
 *
 * Functionality:
 * Sets up a listener to handle click events on regions within the GeoChart.
 * Calls the `zoomRegion()` function to handle region-specific behavior when a user clicks on the map.
 */
function setupInteraction() {
    google.visualization.events.addListener(chart, 'regionClick', function (event) {
        console.log("Region clicked:", event.region);
        zoomRegion(event.region);
    });
}

/**
 * Handles interactions when a region on the map is clicked.
 *
 * Functionality:
 * This function manages the behavior when a user clicks on a region on the map.
 * It adjusts the view and updates the map and sidebar accordingly depending on the type of region clicked.
 *
 * @param {String} region - The code of the region that was clicked by the user.
 */
function zoomRegion(region) {
    const dayIndex = parseInt(timelineSlider.value, 10);
    const dateData = globalData.data[dayIndex];
    const backButton = document.getElementById('backButton');

    console.log(`Region clicked: ${region}`);

    if (isCountryCode(region)) {
        // 点击国家
        currentRegion = region;
        selectedSubRegion = null;
        viewMode = 'country';
        backButton.style.display = 'block';
        backButton.innerText = 'Back to the World Map';

        updateMap(dateData);
        updateContinentFilterForCountry(region);
        updateSidebar(dateData);
    } else if (isSubRegionCode(region)) {
        // 点击子区域（州/省）
        selectedSubRegion = region;
        viewMode = 'subregion';
        backButton.style.display = 'block';
        backButton.innerText = 'Back to the World Map';

        updateMap(dateData);
        setupSidebarForSubRegionView(selectedSubRegion, dateData);
    } else if (isContinentCode(region)) {
        // 点击大洲
        currentRegion = region;
        selectedSubRegion = null;
        viewMode = 'continent';
        backButton.style.display = 'block';
        backButton.innerText = 'Back to the World Map';

        updateMap(dateData);
        updateContinentFilterForContinent(region);
        updateSidebar(dateData);
    } else {
        // 其他情况，返回全球视图
        currentRegion = null;
        selectedSubRegion = null;
        viewMode = 'global';
        backButton.style.display = 'none';
        updateMap(dateData);
        setupSidebarForGlobalView(dateData);
    }
}

/**
 * Checks if a given code corresponds to a continent.
 *
 * @param {String} code - The code to validate.
 * @returns {Boolean} True if the code is a continent code, false otherwise.
 */
function isContinentCode(code) {
    return ['002', '019', '142', '150', '009'].includes(code);
}

/**
 * Validates whether the given code is a valid country code.
 *
 * A country code should consist of exactly two uppercase letters.
 *
 * @param {string} code - The code to be checked.
 * @returns {boolean} True if the code is a two-letter country code, otherwise false.
 */
function isCountryCode(code) {
    return /^[A-Z]{2}$/.test(code);
}

/**
 * Determines whether the provided code is a valid sub-region code.
 *
 * A valid sub-region code follows the format 'XX-YYY' where 'XX' is a two-letter country code
 * and 'YYY' is a 1 to 3 character alphanumeric sub-region identifier.
 *
 * @param {string} code - The sub-region code to be validated.
 * @returns {boolean} True if the code matches the sub-region format, otherwise false.
 */
function isSubRegionCode(code) {
    return /^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(code);
}

/**
 * Sets up the timeline slider with the initial configuration and prepares it for user interaction.
 *
 * Functionality:
 * This ensures that the slider starts from the beginning, positions the date label correctly,
 * and handles updates when the user changes the slider's value.
 */
function initializeTimeline() {
    timelineSlider.max = globalData.data.length - 1;
    timelineSlider.value = 0;
    updateCurrentLabelPosition(); // Ensure the label starts at the right position

    // Add event listener to update the label during slider input
    timelineSlider.addEventListener('input', function () {
        const dayIndex = parseInt(this.value, 10);
        updateDisplayForDay(dayIndex);
    });
}

/**
 * Adjusts the position of the current date label on the timeline slider to align with the slider thumb.
 *
 * Functionality:
 * This function calculates the appropriate position of the current date label on the timeline slider.
 * It ensures that the label is dynamically positioned in accordance with the slider's thumb,
 * so the label stays aligned.
 */
function updateCurrentLabelPosition() {
    const dayIndex = parseInt(timelineSlider.value, 10);
    const maxDayIndex = parseInt(timelineSlider.max, 10);
    const sliderWidth = timelineSlider.offsetWidth;
    const thumbPosition = (dayIndex / maxDayIndex) * sliderWidth;
    currentLabel.style.left = `${thumbPosition - currentLabel.offsetWidth / 2}px`; // Dynamically position the label
    currentLabel.style.display = 'block';
}

/**
 * Updates the map, sidebar, and date label based on the selected day from the timeline slider.
 *
 * Functionality:
 * This function is triggered whenever the user interacts with the timeline slider, ensuring that the displayed
 * information corresponds to the chosen date.
 */
function updateDisplayForDay(dayIndex) {
    const dateData = globalData.data[dayIndex];
    currentLabel.textContent = dateData.date; // Update the date content
    timelineSlider.value = dayIndex;
    updateMap(dateData);
    updateSidebar(dateData);
    updateCurrentLabelPosition(); // Ensure the label position updates during sliding or autoplay

    // 如果弹出窗口是打开的，更新弹出窗口数据
    const popupContainer = document.getElementById('popupContainer');
    if (popupContainer.classList.contains('open')) {
        updatePopupData();
    }
}

/**
 * Updates the sidebar with information about the currently selected region and date.
 *
 * Functionality:
 * This function dynamically updates the sidebar content based on the currently selected view.
 * It determines which data to display depending on the user's current selection
 * and uses helper functions to format the content appropriately.
 *
 * @param {Object} dateData - Data for the specific date selected by the user.
 */
function updateSidebar(dateData) {
    const regionDetails = document.getElementById('regionDetails');
    let regionName;
    let locations = [];

    if (viewMode === 'global') {
        // Global view: 聚合所有国家级别的数据
        regionName = 'Global View';
        locations = aggregateDataByCountry(dateData.locations);  // 按国家级别聚合数据
        regionDetails.innerHTML = generateSidebarContent(locations, regionName);
    } else if (viewMode === 'continent') {
        // Continent view: 由 setupSidebarForContinentView 处理
        setupSidebarForContinentView(currentRegion, dateData);
    } else if (viewMode === 'country') {
        // Country view: 按国家内的子区域聚合数据
        regionName = getRegionName(currentRegion);
        const locationsInCountry = dateData.locations.filter(location => location.region_code.startsWith(currentRegion + '-'));
        const aggregatedCountryData = aggregateDataByCountry(locationsInCountry); // 按国家级别聚合数据
        regionDetails.innerHTML = generateSidebarContent(aggregatedCountryData, regionName);
    } else if (viewMode === 'subregion') {
        // Subregion view: 显示单个子区域的数据
        regionName = getRegionName(selectedSubRegion);
        const locationData = dateData.locations.find(location => location.region_code === selectedSubRegion);
        if (locationData) {
            locations = [locationData];  // 仅显示选定子区域的数据
            regionDetails.innerHTML = generateSidebarContent(locations, regionName);
        } else {
            regionDetails.innerHTML = `<h2>${regionName}</h2><p>No data available for this state/province.</p>`;
        }
    }
}

/**
 * Generates the HTML content to populate the sidebar with statistical data.
 *
 * Functionality:
 * This function takes in a list of locations and the name of a region to generate statistical data
 * about tweets and fake news.
 * It compiles the total tweet count, fake news count, and identifies the most common fake news topics to be displayed
 * in the sidebar.
 *
 * @param {Array} locations - List of locations with their respective data.
 * @param {String} regionName - Name of the region currently being viewed.
 * @returns {String} The HTML markup for the sidebar content.
 */
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

    // 统计最常见的假新闻主题
    const topicCounts = {};
    allFakeNewsTopics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    const sortedTopics = Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a]);
    const topFakeNewsTopics = sortedTopics.length > 0 ? sortedTopics.slice(0, 5) : ['No Topics Available']; // 如果没有数据，则显示默认信息

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

/**
 * Populates the sidebar with global data summary information.
 *
 * Functionality:
 * This function is responsible for displaying the total number of tweets, fake news count,
 * the ratio of fake news to total tweets, and the most frequently discussed fake news topics on a global level.
 *
 * @param {Object} dateData - The data object containing information about all locations for the selected date.
 */
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

    // Count Top Fake News Topics
    const topicCounts = {};
    allFakeNewsTopics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    const sortedTopics = Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a]);
    const topFakeNewsTopics = sortedTopics.slice(0, 5); // Top 5 Topics

    // Update Sidebar Content
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

/**
 * Populates the sidebar with data summary information specific to a continent.
 *
 * Functionality:
 * This function displays the aggregated statistics of tweets and fake news for all countries within a given continent,
 * as well as detailed information for each individual country in that continent.
 *
 * @param {string} continentCode - The code representing the continent (e.g., '150' for Europe).
 * @param {Object} dateData - The data object containing information about all locations for the selected date.
 */
function setupSidebarForContinentView(continentCode, dateData) {
    const regionDetails = document.getElementById('regionDetails');
    const regionName = continentNames[continentCode] || continentCode;

    // 获取属于该大洲的所有国家代码
    const countriesInContinent = Object.keys(countryToContinent).filter(countryCode => countryToContinent[countryCode] === continentCode);

    // 过滤出该大洲内的所有位置数据
    const locationsInContinent = dateData.locations.filter(location => countriesInContinent.includes(location.region_code.split('-')[0]));

    // 按国家级别聚合数据
    const aggregatedCountries = aggregateDataByCountry(locationsInContinent);

    let totalTweetCount = 0;
    let totalFakeNewsCount = 0;
    let allFakeNewsTopics = [];

    // 计算总的推文数和假新闻数，并收集所有假新闻主题
    aggregatedCountries.forEach(country => {
        totalTweetCount += country.tweet_count;
        totalFakeNewsCount += country.fake_news_count;
        allFakeNewsTopics = allFakeNewsTopics.concat(country.fake_news_topics);
    });

    const fakeNewsRatio = totalTweetCount > 0 ? (totalFakeNewsCount / totalTweetCount).toFixed(4) : 0;

    // 计算最常见的假新闻主题
    const topicCounts = {};
    allFakeNewsTopics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    const sortedTopics = Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a]);
    const topFakeNewsTopics = sortedTopics.length > 0 ? sortedTopics.slice(0, 5) : ['No Topics Available']; // 如果没有数据，则显示默认信息

    // 构建侧边栏内容
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

    // 添加各国的详细数据
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

    // 更新侧边栏内容
    regionDetails.innerHTML = content;
}

/**
 * Populates the sidebar with data summary information specific to a sub-region (state or province).
 *
 * Functionality:
 * This function displays detailed statistics for a given sub-region, including tweet counts, fake news data,
 * and the most frequently mentioned fake news topics.
 *
 * @param {string} subRegionCode - The code representing the sub-region (e.g., 'AU-NSW' for New South Wales, Australia).
 * @param {Object} dateData - The data object containing information about all locations for the selected date.
 */
function setupSidebarForSubRegionView(subRegionCode, dateData) {
    const regionDetails = document.getElementById('regionDetails');
    const regionName = subRegionNames[subRegionCode] || getRegionName(subRegionCode);  // 获取子区域名称

    // Get data for the state/province
    const locationData = dateData.locations.find(location => location.region_code === subRegionCode);

    // Process the list of fake news topics associated with that location.
    if (locationData) {
        const fakeNewsTopicsList = locationData.fake_news_topics
            .map(topic => `<li>${topic}</li>`)
            .join('');  // 遍历主题列表

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

/**
 * Retrieves the full name of a region based on its code.
 *
 * Functionality:
 * This function takes a region code and returns the full name of that region.
 * The region code can represent a continent, country, or sub-region (e.g., state or province).
 *
 * @param {String} regionCode - The region's code.
 * @returns {String} The full name of the region.
 */
function getRegionName(regionCode) {
    if (isContinentCode(regionCode)) {
        // Continent Code
        return continentNames[regionCode] || regionCode;
    } else if (isCountryCode(regionCode)) {
        // Country Code
        return countryNames[regionCode] || regionCode;
    } else if (isSubRegionCode(regionCode)) {
        // Sub-region Code
        return subRegionNames[regionCode] || regionCode;
    } else {
        // Other Codes
        return regionCode;
    }
}

/**
 * Toggles the autoplay feature to either start or stop playing through the timeline.
 *
 * Functionality:
 * This function determines the current state of autoplay (running or stopped) and
 * switches to the opposite state accordingly.
 */
function toggleAutoPlay() {
    // if autoplay is currently not running
    if (intervalId === null) {
        startAutoPlay();
    } else { // running
        stopAutoPlay();
    }
}

/**
 * Initiates the autoplay, which advances the timeline automatically at set intervals.
 *
 * Functionality:
 * This function sets up a timer that moves the timeline forward at regular intervals,
 * mimicking the user sliding through the timeline. It also updates the display elements
 * and ensures the correct visual feedback for the user.
 */
function startAutoPlay() {
    if (intervalId !== null) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
        incrementDay(); // Increase day index
        currentLabel.style.display = 'block';
        updateCurrentLabelPosition(); // Update label position during autoplay
    }, 800);

    // Switch the button icon to the paused state
    const playPauseIcon = document.getElementById('toggleAutoPlayBtn');
    playPauseIcon.classList.remove('fa-play');
    playPauseIcon.classList.add('fa-pause');
}

/**
 * Stops the autoplay feature, halting any automatic progression of the timeline.
 *
 * Functionality:
 * This function clears the interval responsible for autoplay and resets the autoplay button
 * to reflect that the autoplay is no longer active.
 */
function stopAutoPlay() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }

    // Switch the button icon to the play state
    const playPauseIcon = document.getElementById('toggleAutoPlayBtn');
    playPauseIcon.classList.remove('fa-pause'); // Remove the pause icon
    playPauseIcon.classList.add('fa-play'); // Add the play icon
}


/**
 * Advances the timeline by one day during autoplay.
 *
 * Functionality:
 * This function is responsible for incrementing the day index on the timeline
 * when the autoplay feature is active, ensuring that the display updates to the next day's data.
 */
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

/**
 * Sets up the functionality for the Back button that allows users to navigate back through different map views.
 *
 * Functionality:
 * The Back button enables users to move from a more detailed view (subregion or country)
 * back to a broader view (country or global).
 */
function setupBackButton() {
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function () {
            const dayIndex = parseInt(timelineSlider.value, 10);
            const dateData = globalData.data[dayIndex];

            if (viewMode === 'subregion') {
                // 从子区域视图返回到国家视图
                selectedSubRegion = null;
                viewMode = 'country';
                backButton.innerText = 'Back to the World Map';
                updateMap(dateData);
                updateSidebar(dateData);
            } else if (viewMode === 'country' || viewMode === 'continent') {
                // 从国家或大洲视图返回到全球视图
                currentRegion = null;
                selectedSubRegion = null;
                viewMode = 'global';
                backButton.style.display = 'none';
                updateMap(dateData);
                setupSidebarForGlobalView(dateData);

                // 重置大陆选择器为全球视图
                const continentSelector = document.getElementById('continentSelector');
                if (continentSelector) {
                    continentSelector.value = "000"; // 设置为 "000" 表示全球视图
                }
            }
        });
    }
}

/**
 * Updates the display state of the continent filter dropdown based on the view mode.
 *
 * Functionality:
 * This function manages the visibility and state of the continent filter dropdown.
 * Ensures the continent filter is visible and sets its value to the global view setting if applicable.
 *
 * @param {String} viewMode - The current view mode, which determines the filter display state.
 */
function updateContinentFilter(viewMode) {
    const continentFilter = document.getElementById('continentSelector');
    if (viewMode === 'global') {
        continentFilter.style.display = 'block'; // Keep Display
        continentFilter.value = '000';
    } else {
        continentFilter.style.display = 'block';  // Show filter in continent or country view
    }
}

/**
 * Zooms into a specific continent or resets the view to the global map based on the selected continent code.
 *
 * Functionality:
 * This function handles changing the map display when the user selects a continent from the dropdown menu.
 * Updates the map view, sidebar, and UI elements accordingly based on the selected continent or global setting.
 *
 * @param {String} continentCode - The code representing the selected continent or global view.
 */
function zoomToContinent(continentCode) {
    const dayIndex = parseInt(timelineSlider.value, 10);
    const dateData = globalData.data[dayIndex];

    if (continentCode === "000") { // "000" 表示全球视图
        // 回到全球视图
        currentRegion = null;
        viewMode = 'global';
        updateContinentFilter(viewMode);  // 更新大陆选择器为全球视图

        updateMap(dateData);
        setupSidebarForGlobalView(dateData); // 设置全球视图的侧边栏

        // 隐藏返回按钮
        const backButton = document.getElementById('backButton');
        backButton.style.display = 'none';

        // 重置大陆选择器为 "000" 表示全球视图
        const continentSelector = document.getElementById('continentSelector');
        if (continentSelector) {
            continentSelector.value = "000"; // 设置为 "000" 表示全球视图
        }
    } else {
        // 进入特定大陆视图
        currentRegion = continentCode;
        viewMode = 'continent';
        updateMap(dateData);  // 更新地图显示
        updateSidebar(dateData);  // 更新侧边栏

        const backButton = document.getElementById('backButton');
        backButton.style.display = 'block';  // 显示返回按钮
        backButton.innerText = 'Back to the World Map';

        // 更新大陆选择器为选中的大陆
        const continentSelector = document.getElementById('continentSelector');
        if (continentSelector) {
            continentSelector.value = continentCode;
        }
    }
}

/**
 * Updates the continent filter dropdown based on the provided country code.
 *
 * Functionality:
 * This function sets the value of the continent selector to the appropriate continent based on the given country code.
 *
 * @param {String} countryCode - The code of the country whose continent needs to be selected in the dropdown.
 */
function updateContinentFilterForCountry(countryCode) {
    const continentCode = countryToContinent[countryCode];
    const continentSelector = document.getElementById('continentSelector');
    if (continentSelector && continentCode) {
        continentSelector.value = continentCode;
    }
}

/**
 * Updates the continent filter dropdown based on the provided continent code.
 *
 * Functionality:
 * This function directly sets the value of the continent selector to the given continent code.
 *
 * @param {String} continentCode - The code of the continent to be set in the dropdown.
 */
function updateContinentFilterForContinent(continentCode) {
    const continentSelector = document.getElementById('continentSelector');
    if (continentSelector && continentCode) {
        continentSelector.value = continentCode;
    }
}

/**
 * Initializes the popup functionality.
 */
function initializePopup() {
    const togglePopupBtn = document.getElementById('togglePopupBtn');
    const popupContainer = document.getElementById('popupContainer');
    const popupArrowIcon = document.getElementById('popupArrowIcon'); // 获取箭头图标

    console.log('Initializing Popup');

    if (togglePopupBtn && popupContainer) {
        // 初始状态为展开，箭头指向外
        popupContainer.classList.add('open');
        popupArrowIcon.style.transform = 'rotate(0deg)'; // 初始状态为箭头向内

        togglePopupBtn.addEventListener('click', function () {
            console.log('Popup toggle button clicked');
            const isOpen = popupContainer.classList.toggle('open');

            if (isOpen) {
                popupArrowIcon.style.transform = 'rotate(0deg)'; // 如果弹出窗口是打开的，箭头向内
                console.log('Popup opened');
            } else {
                popupArrowIcon.style.transform = 'rotate(180deg)'; // 如果弹出窗口是关闭的，箭头向外
                console.log('Popup closed');
            }
        });
    } else {
        console.error('Error initializing popup elements');
    }
}

/**
 * Updates the popup data to display detailed information for regions with the code 'Unknown'.
 * This function aggregates all 'Unknown' entries to ensure complete data representation.
 */
function updatePopupData() {
    const dayIndex = parseInt(timelineSlider.value, 10);
    const dateData = globalData.data[dayIndex];
    console.log(`Updating popup data for day index: ${dayIndex}`);

    // Filter regions with 'Unknown' region_code
    const unknownDataArray = dateData.locations.filter(location => location.region_code === 'Unknown');
    console.log('Unknown Data Array:', unknownDataArray);

    if (unknownDataArray.length > 0) {
        // Aggregate tweet_count and fake_news_count for 'Unknown' regions
        const totalTweetCount = unknownDataArray.reduce((sum, location) => sum + location.tweet_count, 0);
        const totalFakeNewsCount = unknownDataArray.reduce((sum, location) => sum + location.fake_news_count, 0);
        const fakeNewsRatio = totalTweetCount > 0 ? (totalFakeNewsCount / totalTweetCount).toFixed(4) : 0;

        document.getElementById('popupTweetCount').textContent = totalTweetCount;
        document.getElementById('popupFakeNewsCount').textContent = totalFakeNewsCount;
        document.getElementById('popupFakeNewsRatio').textContent = fakeNewsRatio;

        // Aggregate fake_news_topics
        const allFakeNewsTopics = unknownDataArray.flatMap(location => location.fake_news_topics);
        const topicsList = document.getElementById('popupFakeNewsTopics');
        topicsList.innerHTML = ''; // Clear existing topics

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

/**
 * Adds functionality to take a screenshot of the map.
 */
document.getElementById('screenshotButton').addEventListener('click', function () {
    const targetElement = document.getElementById('regions_div'); // 指定需要截图的元素

    html2canvas(targetElement).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'map-screenshot.png';
        link.click();
    });
});
