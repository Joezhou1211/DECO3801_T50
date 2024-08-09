// ���� Google Charts ��
google.charts.load('current', {
    'packages': ['geochart'],
    'mapsApiKey': 'YOUR_GOOGLE_MAPS_API_KEY'
});
google.charts.setOnLoadCallback(drawRegionsMap);

function drawRegionsMap() {
    // ��������
    var data = google.visualization.arrayToDataTable([
        ['Country', 'Tweet Count'],
        ['Australia', 250],
        ['United States', 300],
        ['United Kingdom', 150],
        ['Canada', 100],
        ['India', 200]
    ]);

    // �����ͼѡ��
    var options = {
        colorAxis: { colors: ['#e0f2f1', '#004d40'] }
    };

    // ���� GeoChart ����
    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

    // ���Ƶ�ͼ
    chart.draw(data, options);

    // ����¼�������
    google.visualization.events.addListener(chart, 'regionClick', function (event) {
        var region = event.region;
        showSidebar(region);
    });
}

function showSidebar(region) {
    var sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '<h2>' + region + '</h2><p>Details about ' + region + '...</p>';
    sidebar.classList.add('visible');
}
