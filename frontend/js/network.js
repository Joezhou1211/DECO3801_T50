// Sidebar Control Functions
function openSidebar() {
    document.getElementById("rightSidebar").classList.add("open");
}

function closeSidebar() {
    document.getElementById("rightSidebar").classList.remove("open");
}

// Calculate Distance and Angle Between Two Points
function getAngelLength(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    var c = Math.sqrt(a * a + b * b);
    var angle = Math.PI - Math.atan2(-b, a);
    return [c, angle];
}

// Draw a Line Connecting Two Nodes
function connectNodes(node1, node2) {
    var pos1 = node1.getBoundingClientRect();
    var pos2 = node2.getBoundingClientRect();

    // Calculate the center points of the two nodes
    var x1 = pos1.left + pos1.width / 2;
    var y1 = pos1.top + pos1.height / 2;
    var x2 = pos2.left + pos2.width / 2;
    var y2 = pos2.top + pos2.height / 2;

    var [length, angle] = getAngelLength(x1, y1, x2, y2);

    // Create a line element and set its dimensions and position
    var line = document.createElement('div');
    line.className = 'line';
    line.style.width = length + 'px';
    line.style.top = y1 + 'px';
    line.style.left = x1 + 'px';
    line.style.transform = `rotate(${angle}rad)`;

    document.getElementById('body').appendChild(line);
}

// Connect All Nodes in the Network
function connectAllNodes() {
    var nodes = [
        document.getElementById('node1'),
        document.getElementById('node2'),
        document.getElementById('node3'),
        document.getElementById('node4'),
        document.getElementById('node5'),
        document.getElementById('node6'),
        document.getElementById('node7'),
        document.getElementById('node8'),
        document.getElementById('node9'),
        document.getElementById('node10')
    ];

    // Nested loops to connect each pair of nodes
    for (var i = 0; i < nodes.length - 1; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
            connectNodes(nodes[i], nodes[j]);
        }
    }
}

// Initialize Node Connections on Page Load
window.onload = function() {
    connectAllNodes();
};
