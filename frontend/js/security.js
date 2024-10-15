window.onload = function() {
    const storedUser = JSON.parse(localStorage.getItem('registeredUser'));

    if (storedUser && storedUser.userId) {
        // Display userId in the input field
        document.getElementById('userIdDisplay').value = storedUser.userId;
    } else {
        // If no user is logged in, redirect to login page
        alert("No user is currently logged in.");
        window.location.href = 'login.html';
    }
}
