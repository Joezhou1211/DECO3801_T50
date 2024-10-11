    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Retrieve stored user information from localStorage
        const storedUser = JSON.parse(localStorage.getItem('registeredUser'));

        // Check if username and password match
        if (storedUser && storedUser.username === username && storedUser.password === password) {
            alert('Logged in successfully!');
            // Redirect to the homepage after successful login
            window.location.href = 'index.html'; // Make sure to update this to your actual homepage
        } else {
            // Show error message if login fails
            document.getElementById('error-message').style.display = 'block';
        }
    });