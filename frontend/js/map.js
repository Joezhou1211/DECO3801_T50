// Global Variables and Constants
let intervalId = null;
let globalData = {};
let currentRegion = null;
let selectedSubRegion = null;

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

// File path to the JSON data file containing map data.
const file_path = '../../data/processed/fake_news_data.json'

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
    initializePopup();
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
            // updateCurrentLabelPosition();
        });
        timelineSlider.addEventListener('mouseleave', function () {
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
    'mapsApiKey': 'YOUR_GOOGLE_MAPS_API_KEY'
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
    $.getJSON(file_path, function (jsonData) {
        globalData = jsonData;
        initializeTimeline();

        const dayIndex = parseInt(timelineSlider.value, 10);
        const dateData = globalData.data[dayIndex];

        // Initialize DataTable with 'tooltip' column
        dataTable = new google.visualization.DataTable();
        dataTable.addColumn('string', 'Region');
        dataTable.addColumn('number', 'Tweet Count');
        dataTable.addColumn({ type: 'string', role: 'tooltip', 'p': { 'html': true } });

        // Initialize Data Rows
        const dataRows = dateData.locations.map(location => {
            let tooltip = `<div class="tooltip-content" style="padding: 5px;"><strong>${location.region_name}</strong><br/>Tweet Count: ${location.tweet_count}</div>`;
            if (selectedSubRegion && location.region_code === selectedSubRegion) {
                tooltip = `<div style="padding:5px; background-color:#ffeb3b;"><strong>${location.region_name}</strong><br/>Tweet Count: ${location.tweet_count}</div>`;
            }
            return [location.region_code, location.tweet_count, tooltip];
        });
        dataTable.addRows(dataRows);

        currentLabel.style.display = 'none';

        // Initialize Color Axis
        const tweetCounts = dateData.locations.map(location => location.tweet_count);
        const minTweetCount = Math.min(...tweetCounts);
        const maxTweetCount = Math.max(...tweetCounts);

        defaultOptions = {
            backgroundColor: { fill: 'transparent' },
            colorAxis: {
                colors: [color_start, color_end],
                minValue: minTweetCount,
                maxValue: maxTweetCount
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
        console.log(`Filtered to continent: ${currentRegion}, Locations count: ${filteredLocations.length}`);
    } else if (isCountryCode(currentRegion)) {
        // Handle country-specific data aggregation (e.g., Australia)
        let countryLocations = dateData.locations.filter(location => location.region_code.startsWith(currentRegion + '-'));
        let generalCountryLocation = dateData.locations.find(location => location.region_code === currentRegion);

        let totalTweetCount = 0;
        let totalFakeNewsCount = 0;
        let allFakeNewsTopics = [];

        // Sum up the tweet counts from all subregions (states) within the country
        countryLocations.forEach(location => {
            totalTweetCount += location.tweet_count;
            totalFakeNewsCount += location.fake_news_count;
            allFakeNewsTopics = allFakeNewsTopics.concat(location.fake_news_topics);
        });

        // Add the tweet count of the general country data (if present)
        if (generalCountryLocation) {
            totalTweetCount += generalCountryLocation.tweet_count;
            totalFakeNewsCount += generalCountryLocation.fake_news_count;
            allFakeNewsTopics = allFakeNewsTopics.concat(generalCountryLocation.fake_news_topics);
        }

        // Update tooltip for the country to include the aggregated data
        let tooltip = `<div class="tooltip-content" style="padding:5px;"><strong>${generalCountryLocation ? generalCountryLocation.region_name : currentRegion}</strong><br/>Tweet Count: ${totalTweetCount}</div>`;

        // Clear existing rows in the DataTable
        dataTable.removeRows(0, dataTable.getNumberOfRows());

        // Add the aggregated country data row to the map
        if (generalCountryLocation) {
            dataTable.addRow([generalCountryLocation.region_code, totalTweetCount, tooltip]);
        }

        console.log(`Country: ${currentRegion}, Total Tweet Count: ${totalTweetCount}`);
    } else {
        // Global view, display all locations
        console.log("Global view: displaying all locations.");
    }

    // Update the DataTable with the filtered data
    const dataRows = filteredLocations.map(location => {
        let tooltip = `<div style="padding:5px;"><strong>${location.region_name}</strong><br/>Tweet Count: ${location.tweet_count}</div>`;
        if (selectedSubRegion && location.region_code === selectedSubRegion) {
            tooltip = `<div style="padding:5px; background-color:#ffe1c1;"><strong>${location.region_name}</strong><br/>Tweet Count: ${location.tweet_count}</div>`;
        }
        return [location.region_code, location.tweet_count, tooltip];
    });
    dataTable.addRows(dataRows);

    // Update Color Axis
    const tweetCounts = filteredLocations.map(location => location.tweet_count);
    const minTweetCount = Math.min(...tweetCounts);
    const maxTweetCount = Math.max(...tweetCounts);
    defaultOptions.colorAxis.minValue = minTweetCount;
    defaultOptions.colorAxis.maxValue = maxTweetCount;

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
 * it adjusts the view and updates the map and sidebar accordingly depending on the type of region clicked.
 *
 * @param {String} region - The code of the region that was clicked by the user.
 */
function zoomRegion(region) {
    const dayIndex = parseInt(timelineSlider.value, 10);
    const dateData = globalData.data[dayIndex];
    const backButton = document.getElementById('backButton');

    if (isCountryCode(region)) {
        currentRegion = region;
        selectedSubRegion = null;
        viewMode = 'country';
        backButton.style.display = 'block';
        backButton.innerText = 'Back to World Map';

        updateMap(dateData);
        updateContinentFilterForCountry(region);
        updateSidebar(dateData);
        updatePopupForCountry(region, dateData);
    } else if (isSubRegionCode(region)) {
        // Sub-region click handling
        selectedSubRegion = region;
        viewMode = 'subregion';
        backButton.style.display = 'block';
        backButton.innerText = 'Back to Country View';

        updateMap(dateData);
        setupSidebarForSubRegionView(selectedSubRegion, dateData);
    } else if (isContinentCode(region)) {
        // Continent click handling
        currentRegion = region;
        selectedSubRegion = null;
        viewMode = 'continent';
        backButton.style.display = 'block';
        backButton.innerText = 'Back to World Map';

        updateMap(dateData);
        updateContinentFilterForContinent(region);
        updateSidebar(dateData);
    } else {
        // Global view handling
        currentRegion = null;
        selectedSubRegion = null;
        viewMode = 'global';
        backButton.style.display = 'none';

        updateMap(dateData);
        setupSidebarForGlobalView(dateData);
    }
}

function updatePopupForCountry(countryCode, dateData) {
    let totalTweets = 0;
    dateData.locations.forEach(location => {
        if (location.region_code.startsWith(countryCode)) {
            totalTweets += location.tweet_count;
        }
    });

    const popupTweetCount = document.getElementById('popupTweetCount');
    popupTweetCount.textContent = totalTweets;
}


function openUnknownPopup() {
    const popupContainer = document.getElementById('popupContainer');
    const togglePopupBtn = document.getElementById('togglePopupBtn');
    const popupArrowIcon = document.getElementById('popupArrowIcon');

    console.log('Opening Unknown Popup');

    popupContainer.classList.add('open');
    updatePopupData();

    popupArrowIcon.style.transform = 'rotate(180deg)';
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

    // Add event listener to update the label during slider input (no post-event centering)
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
        regionName = 'Global View';
        locations = dateData.locations;
    } else if (viewMode === 'continent') {
        setupSidebarForContinentView(currentRegion, dateData);
        return;
    } else if (viewMode === 'country') {
        regionName = getRegionName(currentRegion);
        locations = dateData.locations.filter(location => location.region_code.startsWith(currentRegion));
    } else if (viewMode === 'subregion') {
        regionName = getRegionName(selectedSubRegion);
        const locationData = dateData.locations.find(location => location.region_code === selectedSubRegion);
        if (locationData) {
            locations = [locationData];
        }
    }

    const countryDataContainer = document.getElementById('countryDataContainer');
    const countryHeader = document.querySelector('#regionDetails h3');

    if (locations.length === 0) {
        if (countryHeader) countryHeader.style.display = 'none';
        if (countryDataContainer) countryDataContainer.style.display = 'none';
    } else {
        if (countryHeader) countryHeader.style.display = 'block';
        if (countryDataContainer) countryDataContainer.style.display = 'block';
    }

    regionDetails.innerHTML = generateSidebarContent(locations, regionName);
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

    // count the most common false news topics
    const topicCounts = {};
    allFakeNewsTopics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    const sortedTopics = Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a]);
    const topFakeNewsTopics = sortedTopics.slice(0, 5); // Only take the first five topics

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

    // Get all countries in a continent
    const countriesInContinent = Object.keys(countryToContinent).filter(countryCode => countryToContinent[countryCode] === continentCode);

    // Filter locations within a continent
    const locationsInContinent = dateData.locations.filter(location => countriesInContinent.includes(location.region_code));

    let totalTweetCount = 0;
    let totalFakeNewsCount = 0;
    let allFakeNewsTopics = [];

    // Cumulative tweets and fake news statistics
    locationsInContinent.forEach(location => {
        totalTweetCount += location.tweet_count;
        totalFakeNewsCount += location.fake_news_count;
        allFakeNewsTopics = allFakeNewsTopics.concat(location.fake_news_topics);
    });

    const fakeNewsRatio = totalTweetCount > 0 ? (totalFakeNewsCount / totalTweetCount).toFixed(4) : 0;

    // Count the most popular fake news topics
    const topicCounts = {};
    allFakeNewsTopics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    const sortedTopics = Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a]);
    const topFakeNewsTopics = sortedTopics.slice(0, 5); // Only take the first five topics

    // Check if there are any top fake news topics, if not, display 'No data available'
    const topicsContent = topFakeNewsTopics.length > 0
        ? topFakeNewsTopics.map(topic => `<li>${topic}</li>`).join('')
        : '<li>No data available</li>';

    // Check if there are any countries data, if not, hide the countries section
    const countriesContent = locationsInContinent.length > 0
        ? locationsInContinent.map((location, index) => `
            <div>
                <strong>${index + 1}. ${location.region_name}</strong><br>
                <strong>Total Tweet Count:</strong> ${location.tweet_count}<br>
                <strong>Total Fake News Count:</strong> ${location.fake_news_count}<br>
                <strong>Fake News Ratio:</strong> ${(location.fake_news_count / location.tweet_count).toFixed(4)}<br>
                <strong>Top Fake News Topics:</strong>
                <ul>${location.fake_news_topics.map(topic => `<li>${topic}</li>`).join('')}</ul>
            </div>
        `).join('')
        : ''; // If no country data, leave it empty

    // Structure the Sidebar Content
    let content = `
        <h2>${regionName}</h2>
        <p><strong>Total Tweet Count:</strong> ${totalTweetCount}</p>
        <p><strong>Total Fake News Count:</strong> ${totalFakeNewsCount}</p>
        <p><strong>Fake News Ratio:</strong> ${fakeNewsRatio}</p>
        <p><strong>Top Fake News Topics:</strong></p>
        <ul>${topicsContent}</ul>
    `;

    // Only add the countries section if there is country data available
    if (countriesContent) {
        content += `
            <h3>Countries</h3>
            <div id="countryDataContainer">
                ${countriesContent}
            </div>
        `;
    }

    // Update sidebar content
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
    const regionName = subRegionNames[subRegionCode] || getRegionName(subRegionCode);  // 闂備礁鍚嬮崕鎶藉床閼艰翰浜归柛銉戝苯鏅犻梺璺ㄥ櫐閹凤拷/闂備焦妞挎禍娆戠矆娓氣偓楠炲啴寮撮悩鐢电厠闂佽法鍣﹂幏锟�

    // Get data for the state/province
    const locationData = dateData.locations.find(location => location.region_code === subRegionCode);

    // Process the list of fake news topics associated with that location.
    if (locationData) {
        const fakeNewsTopicsList = locationData.fake_news_topics
            .map(topic => `<li>${topic}</li>`)
            .join('');  // Traverse the topic list

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
                selectedSubRegion = null;
                viewMode = 'country';
                backButton.innerText = 'Back to World Map';
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

    if (continentCode === "000") {
        currentRegion = null;
        viewMode = 'global';
        updateContinentFilter(viewMode);
        updateMap(dateData);
        setupSidebarForGlobalView(dateData);

        const backButton = document.getElementById('backButton');
        backButton.style.display = 'none';
    } else {
        currentRegion = continentCode;
        viewMode = 'continent';
        updateMap(dateData);
        setupSidebarForContinentView(currentRegion, dateData);

        const backButton = document.getElementById('backButton');
        backButton.style.display = 'block';
        backButton.innerText = 'Back to World Map';
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

document.addEventListener("DOMContentLoaded", function () {
    setupEventListeners();
    initializeChart();
    initializePopup();
});

function initializePopup() {
    const togglePopupBtn = document.getElementById('togglePopupBtn');
    const popupContainer = document.getElementById('popupContainer');
    const popupArrowIcon = document.getElementById('popupArrowIcon');

    console.log('Initializing Popup');

    if (togglePopupBtn && popupContainer && popupArrowIcon) {
        togglePopupBtn.addEventListener('click', function () {
            console.log('Popup toggle button clicked');
            popupContainer.classList.toggle('open');

            if (popupContainer.classList.contains('open')) {
                console.log('Popup opened');
                updatePopupData();
                popupArrowIcon.style.transform = 'rotate(180deg)';
            } else {
                console.log('Popup closed');
                popupArrowIcon.style.transform = 'rotate(0deg)';
            }
        });
    } else {
        console.error('No DOM Found');
    }
}

/**
 * 更新弹窗中的数据
 */
function updatePopupData() {
    const dayIndex = parseInt(timelineSlider.value, 10);
    const dateData = globalData.data[dayIndex];
    console.log(`Updating popup data for day index: ${dayIndex}`);

    const unknownData = dateData.locations.find(location => location.region_code === 'Unknown');
    console.log('Unknown Data:', unknownData);

    if (unknownData) {
        document.getElementById('popupTweetCount').textContent = unknownData.tweet_count;
        document.getElementById('popupFakeNewsCount').textContent = unknownData.fake_news_count;
        document.getElementById('popupFakeNewsRatio').textContent = unknownData.fake_news_ratio.toFixed(4);

        const topicsList = document.getElementById('popupFakeNewsTopics');
        topicsList.innerHTML = '';

        unknownData.fake_news_topics.forEach(topic => {
            const li = document.createElement('li');
            if (typeof topic === 'number') {
                li.textContent = `Topic ${topic}`;
            } else {
                li.textContent = topic;
            }
            topicsList.appendChild(li);
        });
    } else {
        document.getElementById('popupTweetCount').textContent = '0';
        document.getElementById('popupFakeNewsCount').textContent = '0';
        document.getElementById('popupFakeNewsRatio').textContent = '0';
        document.getElementById('popupFakeNewsTopics').innerHTML = '<li>No data available</li>';
    }
}
