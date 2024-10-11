// Function to load current user details from localStorage
function loadUserData() {
    const storedUser = JSON.parse(localStorage.getItem('registeredUser'));
    if (storedUser) {
        document.getElementById('name').value = storedUser.username;
    } else {
        alert('No user is currently logged in.');
        window.location.href = 'logIn.html'; // Redirect to login if no user is found
    }
}

// Call the loadUserData function when the page loads
window.onload = loadUserData;

// Handle Save button click (updating user details)
document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();

    const newUsername = document.getElementById('name').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword === confirmPassword) {
        // Retrieve stored user data
        const storedUser = JSON.parse(localStorage.getItem('registeredUser'));

        if (storedUser) {
            // Update the username and password in localStorage
            storedUser.username = newUsername;
            storedUser.password = newPassword;

            // Store updated data back into localStorage
            localStorage.setItem('registeredUser', JSON.stringify(storedUser));

            alert('Details updated successfully!');

            // Optionally clear the form fields after saving
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        } else {
            alert('No user is currently logged in.');
        }
    } else {
        alert('Passwords do not match.');
    }
});
