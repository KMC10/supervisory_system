document.getElementById('logoutBtn').addEventListener('click', () => {
    fetch('/logout', {
        method: 'GET',
        credentials: 'same-origin' // Include cookies in the request
    })
    .then(response => {
        if (statusCode === 200) {
            // Redirect to the login page
            localStorage.clear(); // Clear local storage
            window.location.href = response.url;
        } else {
            // Handle other responses
            console.log('Logout successful');
        }
    })
    .catch(error => {
        console.error('Error logging out:', error);
    });
});