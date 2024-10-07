// Retrieve query parameter from URL
function SearchWithQuery(query) {
    if (query) {
        window.location.href = `search.html?query=${encodeURIComponent(query)}`;
    }
    else {
        alert('Please enter a search query.');
    }
}


// Show/hide the drop-down menu when the user clicks the avatar
document.getElementById('userAvatar').addEventListener('click', function() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu.style.display === 'block') {
        dropdownMenu.style.display = 'none';
    } else {
        dropdownMenu.style.display = 'block';
    }
});

//  Logout function
document.getElementById('logout').addEventListener('click', function() {
    // the logic when logout
    window.location.href = 'login.html';
});

// Close the drop-down menu when you click elsewhere on the page
window.onclick = function(event) {
    if (!event.target.matches('#userAvatar')) {
        const dropdownMenu = document.getElementById('dropdownMenu');
        if (dropdownMenu.style.display === 'block') {
            dropdownMenu.style.display = 'none';
        }
    }
}