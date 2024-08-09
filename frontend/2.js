google.charts.load('current', {
    'packages': ['geochart'],
    'mapsApiKey': 'YOUR_GOOGLE_MAPS_API_KEY'
});
google.charts.setOnLoadCallback(drawRegionsMap);

function drawRegionsMap() {
    var data = google.visualization.arrayToDataTable([
        ['Country', 'Tweet Count'],
        ['Australia', 250],
        ['United States', 300],
        ['United Kingdom', 150],
        ['Canada', 100],
        ['India', 200]
    ]);

    var options = {
        colorAxis: { colors: ['#e0f2f1', '#004d40'] }
    };

    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    chart.draw(data, options);

    google.visualization.events.addListener(chart, 'regionClick', function (event) {
        zoomRegion(event.region);
        showSidebar(event.region);
    });
}

function zoomRegion(region) {
    // This function would handle zooming into the selected region.
    // You might need to adjust the chart options or redraw with new data centered on this region.
    var data = google.visualization.arrayToDataTable([
        ['Country', 'Tweet Count'],
        [region, 300], // Example data point
    ]);

    var options = {
        region: region, // Zoom into the selected region.
        displayMode: 'regions',
        colorAxis: { colors: ['#e0f2f1', '#004d40'] },
        resolution: 'provinces' // This depends on the detail level you need.
    };

    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    chart.draw(data, options);
}

function showSidebar(region) {
    var sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '<h2>' + region + '</h2><p>Details about ' + region + '...</p>';
    sidebar.style.display = 'flex'; // Ensure the sidebar is visible.
}
