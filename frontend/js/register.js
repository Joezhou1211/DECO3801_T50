document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check if email ends with .gov
    if (!email.endsWith('.gov')) {
        document.getElementById('error-message').style.display = 'block';
        return;
    }

    // Store user information in localStorage
    localStorage.setItem('registeredUser', JSON.stringify({username, password}));

    alert('Registration successful!');
    window.location.href = 'login.html'; // Redirect to login page
});
