google.charts.load('current', {
    'packages': ['geochart'],
    'mapsApiKey': 'YOUR_GOOGLE_MAPS_API_KEY'
});
google.charts.setOnLoadCallback(drawRegionsMap);

function drawRegionsMap() {
    console.log("Drawing the main map.");
    var data = google.visualization.arrayToDataTable([
        ['Country', 'Tweet Count'],
        ['Australia', 250],
        ['United States', 300],
        ['United Kingdom', 150],
        ['Canada', 100],
        ['India', 200]
    ]);

    var options = {
        colorAxis: { colors: ['#e0f2f1', '#004d40'] },
        width: '100%',  // 确保地图宽度始终为100%
        height: '100%'  // 确保地图高度始终为100%
    };

    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    chart.draw(data, options);

    // 确保返回主界面时隐藏侧边栏并恢复地图宽度
    var sidebar = document.querySelector('.right-sidebar');
    var regionsDiv = document.getElementById('regions_div');

    sidebar.style.display = 'none';
    regionsDiv.style.width = '100%';

    console.log("Sidebar hidden, map set to full width.");

    google.visualization.events.addListener(chart, 'regionClick', function (event) {
        console.log("Region clicked:", event.region);
        zoomRegion(event.region);
        showSidebar(event.region);
    });

    setupBackButton();
}

function zoomRegion(region) {
    console.log("Zooming into region:", region);
    var data = google.visualization.arrayToDataTable([
        ['Country', 'Tweet Count'],
        [region, 300],
    ]);

    var options = {
        region: region,
        displayMode: 'regions',
        colorAxis: { colors: ['#e0f2f1', '#004d40'] },
        resolution: 'provinces',
        width: '100%',  // 确保地图宽度始终为100%
        height: '100%'  // 确保地图高度始终为100%
    };

    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    chart.draw(data, options);

    document.getElementById('backButton').style.display = 'block'; // 显示返回按钮
}

function showSidebar(region) {
    var sidebar = document.querySelector('.right-sidebar');
    var regionsDiv = document.getElementById('regions_div');
    var regionDetails = document.getElementById('regionDetails');

    sidebar.style.display = 'flex'; // 显示侧边栏
    regionsDiv.style.width = 'calc(100% - 300px)'; // 调整地图容器的宽度

    // 填充侧边栏中的区域详情
    regionDetails.innerHTML = '<h2>' + region + '</h2><p>Details about ' + region + '...</p>';
}

function setupBackButton() {
    var backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function() {
            console.log("Back button clicked, returning to main map.");
            drawRegionsMap(); // 重新绘制初始世界地图
            document.getElementById('regionDetails').innerHTML = ''; // 清空详情内容
            document.querySelector('.right-sidebar').style.display = 'none'; // 隐藏侧边栏

            // 恢复地图容器的宽度
            document.getElementById('regions_div').style.width = '100%';

            this.style.display = 'none'; // 隐藏返回按钮
        });
    }
}
