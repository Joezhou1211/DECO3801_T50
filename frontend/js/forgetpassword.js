document.getElementById('emailForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const emailInput = document.getElementById('email').value;

        // Retrieve stored user information from localStorage
        const storedUser = JSON.parse(localStorage.getItem('registeredUser'));

        // Check if the entered email matches the registered user's email
        if (storedUser && storedUser.email === emailInput) {
            // Show success message and redirect to login page
            document.getElementById('success-message').style.display = 'block';
            setTimeout(function() {
                window.location.href = 'login.html'; // Redirect to login page
            }, 2000); // Delay before redirecting
        } else {
            // Show error message if email is not found
            document.getElementById('error-message').style.display = 'block';
        }
    });