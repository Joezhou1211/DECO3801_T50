const toggleBtn = document.querySelector('.toggle-btn');
const topicSidebar = document.querySelector('.topic-sidebar');
const contentWrapper = document.getElementById('content-wrapper');

toggleBtn.addEventListener('click', () => {
    console.log('Toggle button clicked'); 
    topicSidebar.classList.toggle('open');
    contentWrapper.classList.toggle('shifted');
    toggleBtn.textContent = topicSidebar.classList.contains('open') ? '<' : '>';
});

document.addEventListener('DOMContentLoaded', function() {
    const topics = ["Finance", "Development", "Design", "Marketing", "Sales", "HR"];
    const bubbleContainer = document.getElementById('bubble-container');
    const colors = ['red', 'blue', 'green'];
    const sizes = ['small', 'medium', 'large'];

    topics.forEach(topic => {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = topic;

        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        bubble.classList.add(randomColor, randomSize);

        const randomTop = Math.floor(Math.random() * 200) - 100;
        const randomLeft = Math.floor(Math.random() * 200) - 100;
        bubble.style.transform = `translate(${randomLeft}px, ${randomTop}px)`;

        bubble.addEventListener('click', function() {
            document.querySelectorAll('.bubble').forEach(b => b.classList.remove('center'));
            this.style.transform = 'translate(-50%, -50%)';
            this.style.top = '50%';
            this.style.left = '50%';
            this.classList.add('center');
        });

        bubbleContainer.appendChild(bubble);
    });
});

