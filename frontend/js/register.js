        const storedToken = "123456";
        function generateUserId() {
            return 'user_' + Date.now() + Math.floor(Math.random() * 1000);
       }

        document.getElementById('registerForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const token = document.getElementById('token').value;  // Get user input token
            const userId = generateUserId();

            // Check if email ends with .gov
            if (!email.endsWith('.gov') || token !== storedToken) {
                document.getElementById('error-message').style.display = 'block';
                return;
            }

            // Store user information in localStorage
            const newUser = {
                username: username,
                password: password,
                email: email,
                userId: userId
            };

            localStorage.setItem('registeredUser', JSON.stringify(newUser));
            alert('Registration successful!');
            window.location.href = 'login.html'; // Redirect to login page
        });