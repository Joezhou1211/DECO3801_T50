// Load the Google Charts library and specify the 'geochart' package.
google.charts.load('current', {
    'packages': ['geochart'],
    'mapsApiKey': 'YOUR_GOOGLE_MAPS_API_KEY'
});
google.charts.setOnLoadCallback(drawRegionsMap);

// Define the start and end colors for the map's color gradient
const color_start = '#e0f2f1';
const color_end = '#004d40';

// Fetch Data and Draw Initial Map
function drawRegionsMap() {
    $.getJSON('../../data/processed/location_counts.json', function(jsonData) {
        drawMap(jsonData);
    });
}

// Draw Map with Data
function drawMap(jsonData) {
    var dataArray = [['Country', 'Tweet Count']];
    for (var location in jsonData.count) {
        dataArray.push([location, jsonData.count[location]]);
    }

    var data = google.visualization.arrayToDataTable(dataArray);
    var options = {
        colorAxis: { colors: [color_start, color_end] },
        width: '100%',
        height: '100%'
    };

    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    chart.draw(data, options);

    setupInteraction(chart, jsonData);
}

// Region Mapping for Australian Territories
var regionMapping = {
    "Victoria, Australia": "AU-VIC",
    "New South Wales, Australia": "AU-NSW",
    "Queensland, Australia": "AU-QLD",
    "South Australia, Australia": "AU-SA",
    "Western Australia, Australia": "AU-WA",
    "Tasmania, Australia": "AU-TAS",
    "Northern Territory, Australia": "AU-NT",
    "Australian Capital Territory, Australia": "AU-ACT",
};

// Zoom into Specific Regions
function zoomRegion(region, jsonData) {
    var dataArray = [['Country', 'Tweet Count']];
    for (var location in jsonData.count) {
        var mappedRegion = regionMapping[location] || location;
        if (mappedRegion === region || mappedRegion.startsWith(region)) {
            dataArray.push([mappedRegion, jsonData.count[location]]);
        }
    }

    var data = google.visualization.arrayToDataTable(dataArray);
    var options = {
        region: region,
        displayMode: 'regions',
        colorAxis: { colors: [color_start, color_end] },
        resolution: 'provinces',
        width: '100%',
        height: '100%'
    };

    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    google.visualization.events.removeAllListeners(chart);
    chart.draw(data, options);

    document.getElementById('backButton').style.display = 'block';

    google.visualization.events.addListener(chart, 'regionClick', function (event) {
        showSidebar(event.region);
    });
}

// Display Sidebar with Region Details
function showSidebar(region) {
    var sidebar = document.querySelector('.right-sidebar');
    var regionsDiv = document.getElementById('regions_div');
    var regionDetails = document.getElementById('regionDetails');

    sidebar.style.display = 'flex';
    regionsDiv.style.width = 'calc(100% - 300px)';

    var regionName = Object.keys(regionMapping).find(key => regionMapping[key] === region) || region;
    regionDetails.innerHTML = '<h2>' + regionName + '</h2><p>Details about ' + regionName + '...</p>';
}

// Setup Back Button Functionality
function setupBackButton() {
    var backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function() {
            drawRegionsMap();
            document.getElementById('regionDetails').innerHTML = '';
            document.querySelector('.right-sidebar').style.display = 'none';

            document.getElementById('regions_div').style.width = '100%';

            this.style.display = 'none';
        });
    }
}

// Setup Map Interaction
function setupInteraction(chart, jsonData) {
    var sidebar = document.querySelector('.right-sidebar');
    var regionsDiv = document.getElementById('regions_div');

    sidebar.style.display = 'none';
    regionsDiv.style.width = '100%';

    google.visualization.events.addListener(chart, 'regionClick', function (event) {
        zoomRegion(event.region, jsonData);
        showSidebar(event.region);
    });

    setupBackButton();
}

// Function to parse CSV data
function parseCSVData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {
            var tarr = {};
            for (var j=0; j<headers.length; j++) {
                tarr[headers[j]] = data[j];
            }
            lines.push(tarr);
        }
    }
    return lines;
}

// Load CSV Data
function loadCSVData() {
    $.ajax({
        type: "GET",
        url: "../../data/single_location_time_tweet_count.csv",
        dataType: "text",
        success: function(data) {
            var jsonData = parseCSVData(data);
            setupSlider(jsonData);
        }
     });
}

// Setup Slider interaction
function setupSlider(jsonData) {
    var slider = document.getElementById('yearSlider');
    slider.oninput = function() {
        var yearIndex = parseInt(this.value); // Assuming slider value corresponds to an index in your data
        updateDisplay(jsonData, yearIndex);
    };
}

// Update display according to selected year
function updateDisplay(jsonData, yearIndex) {
    var filteredData = jsonData.filter(function(item) {
        return item.Year == yearIndex; // Replace 'Year' with your actual data column if different
    });
    // Assume function to redraw or update your map or display
    drawMap(filteredData);
}

document.addEventListener("DOMContentLoaded", function() {
    loadCSVData(); // Call this function on page load to setup everything
});
