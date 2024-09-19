const imgs = [
    '../assets/1.jpeg',
    '../assets/2.jpeg',
    '../assets/3.jpeg',
    '../assets/4.jpeg',
    '../assets/5.jpeg',
];

// get container element
const container = document.querySelector('.scroll-container');
const text1 = document.getElementById('text1');
const text2 = document.getElementById('text2');
const text3 = document.getElementById('text3');

let curIndex = 0; // current image index

function preIndex() { // get previous image index
    return curIndex === 0 ? imgs.length - 1 : curIndex - 1;
}

function nextIndex() {  // get next image index
    return curIndex === imgs.length - 1 ? 0 : curIndex + 1;
}

function createImg(index, className) {  // create image element
    const img = document.createElement('img');
    img.src = imgs[index]; // set image source

    // set image style
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';

    // create div element
    const div = document.createElement('div');
    div.className = className;  // set class name
    div.appendChild(img); // append image element to div element
    return div;
}

function resetElements() { // reset image elements
    container.innerHTML = ''; // clear container content
    const prev = createImg(preIndex(), 'item_prev'); // create previous image element
    const cur = createImg(curIndex, 'item_current'); // create current image element
    const next = createImg(nextIndex(), 'item_next'); // create next image element

    container.appendChild(prev);
    container.appendChild(cur);
    container.appendChild(next);
}

resetElements(); // initialize image elements


let scrollThreshold = 13;  // min scroll distance to trigger scroll event
let lastScrollTime = 0;  // last scroll time
let scrollTimeout = 800;  // min time between two scroll events

window.addEventListener('wheel', (e) => { // scroll event listener
    const currentTime = new Date().getTime();  // get current time
    if (Math.abs(e.deltaY) < scrollThreshold || currentTime - lastScrollTime < scrollTimeout) return;  // check scroll distance and time

    if (e.deltaY > 0) {
        container.classList.add('scroll-down');  //if scroll down, add scroll-down class
        parallaxEffect(-30);  // Apply parallax effect upwards
    } else {
        container.classList.add('scroll-up');  // else, add scroll-up class
        parallaxEffect(30);  // Apply parallax effect downwards
    }

    lastScrollTime = currentTime;  // update last scroll time
});

container.addEventListener('transitionend', () => {
    // update current index based on scroll direction
    if (container.classList.contains('scroll-down')) {
        curIndex = nextIndex();  // if scroll down, get next image index
    } else if (container.classList.contains('scroll-up')) {
        curIndex = preIndex();  // else get previous image index
    }
    container.className = 'scroll-container'; // Reset scroll class
    resetElements();  // reset image elements
});

// Parallax effect for text
function parallaxEffect(offset) {
    // Apply different parallax speeds to the text elements
    text1.style.transform = `translateY(${offset}px)`;
    text2.style.transform = `translateY(${offset / 2}px)`; // Different speed for text2
    text3.style.transform = `translateY(${offset / 3}px)`; // Different speed for text3
}
