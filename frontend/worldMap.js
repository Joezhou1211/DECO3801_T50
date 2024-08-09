// 加载 Google Charts 库
google.charts.load('current', {
    'packages': ['geochart'],
    'mapsApiKey': 'YOUR_GOOGLE_MAPS_API_KEY'
});
google.charts.setOnLoadCallback(drawRegionsMap);

function drawRegionsMap() {
    // 定义数据
    var data = google.visualization.arrayToDataTable([
        ['Country', 'Tweet Count'],
        ['Australia', 250],
        ['United States', 300],
        ['United Kingdom', 150],
        ['Canada', 100],
        ['India', 200]
    ]);

    // 定义地图选项
    var options = {
        colorAxis: { colors: ['#e0f2f1', '#004d40'] }
    };

    // 创建 GeoChart 对象
    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

    // 绘制地图
    chart.draw(data, options);

    // 添加事件监听器
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
