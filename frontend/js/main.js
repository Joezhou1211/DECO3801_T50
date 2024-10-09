document.getElementById('userAvatar').addEventListener('click', function() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu.style.display === 'block') {
        dropdownMenu.style.display = 'none';
    } else {
        dropdownMenu.style.display = 'block';
    }
});

function checkIfLoggedIn() {
    const storedUser = JSON.parse(localStorage.getItem('registeredUser'));

    if (!storedUser && window.location.href !== 'login.html') {
        window.location.href = 'logIn.html';
    }
}
window.onload = checkIfLoggedIn;


//  Logout function
document.getElementById('logout').addEventListener('click', function() {
    const confirmLogout = confirm("Are you sure you want to logout?");
    if (confirmLogout) {


        window.location.href = 'login.html';
    }
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
