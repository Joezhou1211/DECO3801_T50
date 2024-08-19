
// const toggleBtn = document.querySelector('.toggle-btn');
// const topicSidebar = document.querySelector('.topic-sidebar');
// const modelingContainer = document.querySelector('.topic-modeling-container');
// const statisticsContainer = document.querySelector('.statistics-container');

// toggleBtn.addEventListener('click', () => {
//     topicSidebar.classList.toggle('open');
//     modelingContainer.classList.toggle('shifted');
//     statisticsContainer.classList.toggle('shifted');
//     toggleBtn.textContent = topicSidebar.classList.contains('open') ? '<' : '>';
// });

const toggleBtn = document.querySelector('.toggle-btn');
const topicSidebar = document.querySelector('.topic-sidebar');
const contentWrapper = document.getElementById('content-wrapper');

toggleBtn.addEventListener('click', () => {
    console.log('Toggle button clicked'); // 调试信息
    topicSidebar.classList.toggle('open');
    contentWrapper.classList.toggle('shifted');
    toggleBtn.textContent = topicSidebar.classList.contains('open') ? '<' : '>';
});


// document.addEventListener('DOMContentLoaded', function() {
//     // 假设从后端获得的 topic 数据
//     const topics = ["Finance", "Development", "Design", "Marketing", "Sales", "HR"];
//
//     // 获取气泡容器
//     const bubbleContainer = document.getElementById('bubble-container');
//
//     topics.forEach(topic => {
//         // 动态创建一个 bubble
//         const bubble = document.createElement('div');
//         bubble.className = 'bubble';
//         bubble.textContent = topic;
//
//         // 随机生成一个位置 (位置的生成可以根据实际需求调整范围)
//         const randomTop = Math.floor(Math.random() * 300) - 150; // -150px 到 +150px
//         const randomLeft = Math.floor(Math.random() * 300) - 150; // -150px 到 +150px
//
//         // 设置初始位置和偏移
//         bubble.style.transform = `translate(${randomLeft}px, ${randomTop}px)`;
//
//         // 将 bubble 添加到 bubble-container 中
//         bubbleContainer.appendChild(bubble);
//     });
//
//     // 模拟鼠标悬停效果
//     document.querySelectorAll('.bubble').forEach(bubble => {
//         bubble.addEventListener('mouseenter', () => {
//             bubble.style.transform += ' scale(1.2)'; // 放大
//         });
//         bubble.addEventListener('mouseleave', () => {
//             bubble.style.transform = bubble.style.transform.replace(' scale(1.2)', ''); // 恢复
//         });
//     });
//
//     // 模拟点击效果
//     document.querySelectorAll('.bubble').forEach(bubble => {
//         bubble.addEventListener('click', () => {
//             // 重置所有 bubbles 的样式
//             document.querySelectorAll('.bubble').forEach(b => b.style.transform = b.style.transform.replace(' scale(1.2)', ''));
//
//             // 设置点击的 bubble 为中心
//             bubble.style.transform = 'translate(-50%, -50%) scale(1.5)';
//             bubble.style.top = '50%';
//             bubble.style.left = '50%';
//             bubble.style.zIndex = '10';
//
//             // 显示侧边栏
//             // toggleSidebar(); // 调用你已有的侧边栏展示逻辑
//         });
//     });
// });


document.addEventListener('DOMContentLoaded', function() {
    const topics = ["Finance", "Development", "Design", "Marketing", "Sales", "HR"];
    const bubbleContainer = document.getElementById('bubble-container');
    const colors = ['red', 'blue', 'green'];
    const sizes = ['small', 'medium', 'large'];

    topics.forEach(topic => {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = topic;

        // 随机分配颜色和大小
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        bubble.classList.add(randomColor, randomSize);

        // 随机位置，确保气泡在一定范围内
        const randomTop = Math.floor(Math.random() * 200) - 100;
        const randomLeft = Math.floor(Math.random() * 200) - 100;
        bubble.style.transform = `translate(${randomLeft}px, ${randomTop}px)`;

        // 点击事件：气泡移动到中心并放大
        bubble.addEventListener('click', function() {
            // 移除其他气泡的中心状态
            document.querySelectorAll('.bubble').forEach(b => b.classList.remove('center'));
            // 添加当前气泡的中心状态
            this.style.transform = 'translate(-50%, -50%)';
            this.style.top = '50%';
            this.style.left = '50%';
            this.classList.add('center');
        });

        bubbleContainer.appendChild(bubble);
    });
});

