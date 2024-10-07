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

function initMap() {
            // Create a map object centered at a specific latitude and longitude
            var mapOptions = {
                center: { lat: -25.344, lng: 131.036 },  // Example coordinates (Uluru, Australia)
                zoom: 8  // Zoom level (1 = world, 8 = city, 15 = streets)
            };

            // Create the map object and attach it to the 'map' div
            var map = new google.maps.Map(document.getElementById('map'), mapOptions);
        }