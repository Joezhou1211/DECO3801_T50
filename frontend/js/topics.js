
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
    console.log('Toggle button clicked');
    topicSidebar.classList.toggle('open');
    contentWrapper.classList.toggle('shifted');
    toggleBtn.textContent = topicSidebar.classList.contains('open') ? '<' : '>';
});


// document.addEventListener('DOMContentLoaded', function() {
//     const topics = ["Finance", "Development", "Design", "Marketing", "Sales", "HR"];
//
//     const bubbleContainer = document.getElementById('bubble-container');
//
//     topics.forEach(topic => {
//         const bubble = document.createElement('div');
//         bubble.className = 'bubble';
//         bubble.textContent = topic;
//
//         const randomTop = Math.floor(Math.random() * 300) - 150;
//         const randomLeft = Math.floor(Math.random() * 300) - 150;
//
//         bubble.style.transform = `translate(${randomLeft}px, ${randomTop}px)`;
//
//         bubbleContainer.appendChild(bubble);
//     });
//
//     document.querySelectorAll('.bubble').forEach(bubble => {
//         bubble.addEventListener('mouseenter', () => {
//             bubble.style.transform += ' scale(Page Design Doc.2)';
//         });
//         bubble.addEventListener('mouseleave', () => {
//             bubble.style.transform = bubble.style.transform.replace(' scale(Page Design Doc.2)', '');
//         });
//     });
//
//     document.querySelectorAll('.bubble').forEach(bubble => {
//         bubble.addEventListener('click', () => {
//             document.querySelectorAll('.bubble').forEach(b => b.style.transform = b.style.transform.replace(' scale(Page Design Doc.2)', ''));
//
//             bubble.style.transform = 'translate(-50%, -50%) scale(Page Design Doc.5)';
//             bubble.style.top = '50%';
//             bubble.style.left = '50%';
//             bubble.style.zIndex = '10';
//
//             // toggleSidebar();
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

