// Function to handle form submission for resetting password
function resetPassword() {
    const verificationCode = document.getElementById('verification_code').value;
    const newPasswordInput = document.getElementById('new_password');
    const confirmPasswordInput = document.getElementById('confirm_password');

    // Send POST request to server to verify code
    fetch('/verify-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            verification_code: verificationCode
        })
    })
        .then(response => {
            if (response.ok) {
                // Verification code is valid
                alert('Type New Password Below');
                newPasswordInput.disabled = false;
                confirmPasswordInput.disabled = false;
            } else {
                fetch('/error_verify', {
                    method: 'GET'
                })
                    .then(response => response.text())
                    .then(ejs => {
                        // Insert the rendered HTML into the page
                        document.body.innerHTML = ejs;
                        newPasswordInput.disabled = true;
                        confirmPasswordInput.disabled = true;
                    });
                newPasswordInput.disabled = true;
                confirmPasswordInput.disabled = true;
            }
        })
        .catch(error => {
            console.error('Error verifying code:', error);
            alert('An error occurred while verifying code');
        });
}

// Event listener for form submission
document.getElementById('reset_password_form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission behavior
    resetPassword(); // Call function to handle form submission
});
