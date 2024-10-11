let currentIndex = 0;

function moveLeft() {
    const items = document.querySelectorAll('.carousel-item');
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = items.length - 3;
    }
    updateCarousel();
}

function moveRight() {
    const items = document.querySelectorAll('.carousel-item');
    if (currentIndex < items.length - 3) {
        currentIndex++;
    } else {
        currentIndex = 0;
    }
    updateCarousel();
}

function updateCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    items.forEach((item, index) => {
        item.style.transform = `translateX(-${currentIndex * 100}%)`;
    });
}

// When the user scrolls down 20px from the top, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    const btn = document.getElementById("scrollToTopBtn");
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop < 3500) {
        btn.style.display = "block";
    } else {
        btn.style.display = "none";
    }
}

// When the user clicks the button, scroll to the top of the page
function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
}

