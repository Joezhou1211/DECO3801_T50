// Handle password change
document.getElementById('changePasswordForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword === confirmPassword) {
        // Retrieve stored user data
        const storedUser = JSON.parse(localStorage.getItem('registeredUser'));

        if (storedUser) {
            // Update password
            storedUser.password = newPassword;
            localStorage.setItem('registeredUser', JSON.stringify(storedUser));

            // Show success message
            document.getElementById('successMessage').style.display = 'block';

            // Clear the form fields
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            alert('No user is currently logged in.');
        }
    } else {
        alert('Passwords do not match.');
    }
});

// Handle logout
function logout() {
    // Redirect to login page
    window.location.href = 'login.html';
}