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


window.onload = function() {
            setTimeout(function() {
                document.getElementById('background-screen').style.display = 'none';
                var mainContent = document.getElementById('main-content');
                mainContent.style.display = 'block';
                setTimeout(function() {
                    mainContent.style.opacity = 1;
                }, 50);
            }, 3000);
        };

document.querySelector('.contact-us').addEventListener('click', function() {
    const contactBox = document.getElementById('contactInfoBox');
    contactBox.classList.toggle('show');
});
