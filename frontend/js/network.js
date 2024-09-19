function closeSidebar() {
    document.getElementById("rightSidebar").classList.remove("open");
}


d3.csv("test_data_2.csv").then(function(data) {
        console.log(data);

        const nodeData = [
            { nodeId: "node1", dataIndex: 0 },
            { nodeId: "node2", dataIndex: 1 },
            { nodeId: "node3", dataIndex: 2 },
            { nodeId: "node4", dataIndex: 3 },
            { nodeId: "node5", dataIndex: 4 },
            { nodeId: "node6", dataIndex: 5 },
            { nodeId: "node7", dataIndex: 6 },
            { nodeId: "node8", dataIndex: 7 },
        ];

        nodeData.forEach(function(node) {
            document.getElementById(node.nodeId).addEventListener("click", function() {
                const nodeStats = data[node.dataIndex];
                openSidebar(nodeStats);
            });
        });

    }).catch(function(error) {
        console.log("Error loading CSV data: " + error);
    });

    function openSidebar(stats) {
        const sidebar = document.getElementById('rightSidebar');
        document.getElementById("rightSidebar").classList.add("open");
        document.getElementById('likesCount').textContent = stats["favourite_count"];
        document.getElementById('sharesCount').textContent = stats["retweet_count"];
        document.getElementById('commentsCount').textContent = stats["reply_count"];
        document.getElementById('topSection').textContent = stats["text"];
        document.getElementById('bottomLeft').textContent = stats["_id"];
        document.getElementById('bottomRight').textContent = stats["sentiment"];

        sidebar.style.display = 'block';
    }

// Dataset
const positiveData = { percentage: 40, count: 200 };
const neutralData = { percentage: 30, count: 150 };
const negativeData = { percentage: 30, count: 150 };

// Dynamically update the circle animation
function updateCircle(container, data, duration) {
    const circle = container.querySelector('.progress-circle');
    const percentageElement = container.querySelector('.percentage');
    const numberElement = container.querySelector('.number');

    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    // Dynamically update percentage values
    let startPercentage = 0;
    const endPercentage = data.percentage;
    const stepTime = duration / endPercentage; 

     const interval = setInterval(() => {
        startPercentage += 1;
        if (startPercentage > endPercentage) {
             clearInterval(interval);
        } else {
             const offset = circumference - (startPercentage / 100) * circumference;
             circle.style.strokeDashoffset = offset;

              percentageElement.textContent = startPercentage + '%';
         }
      }, stepTime);

    numberElement.textContent = data.count + ' tweets';
}

// Get each container
const positiveContainer = document.querySelector('.positive');
const neutralContainer = document.querySelector('.neutral');
const negativeContainer = document.querySelector('.negative');

// Dynamically update circles and numbers in 1 second
updateCircle(positiveContainer, positiveData, 1000);
updateCircle(neutralContainer, neutralData, 1000);
updateCircle(negativeContainer, negativeData, 1000);