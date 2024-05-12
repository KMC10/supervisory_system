checkinButton = document.getElementById('check-in-btn');
checkoutButton = document.getElementById('check-out-btn');

window.onload = function () {
    // Get the button states from localStorage
    var isCheckinDisabled = localStorage.getItem('checkinDisabled');
    var isCheckoutDisabled = localStorage.getItem('checkoutDisabled');

    // If the button states are stored in localStorage, apply them to the buttons
    if (isCheckinDisabled !== null) {
        checkinButton.disabled = (isCheckinDisabled === 'true');
    }
    if (isCheckoutDisabled !== null) {
        checkoutButton.disabled = (isCheckoutDisabled === 'true');
    }

    // Fetch button statuses from the server
    fetch('/button_state')
        .then(response => response.json())
        .then(data => {
            // Update button states based on received data
            checkinButton.disabled = data.checkinDisabled;
            checkoutButton.disabled = data.checkoutDisabled;

            // Update the button states in localStorage
            localStorage.setItem('checkinDisabled', checkinButton.disabled);
            localStorage.setItem('checkoutDisabled', checkoutButton.disabled);
        })
        .catch(error => console.error('Error:', error));
}
checkinButton.addEventListener('click', function () {
    fetch('/checkin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Error: ' + response.status);
            }
        })
        .then(text => {
            alert(text);
            checkoutButton.disabled = false;
            checkinButton.disabled = true;
            // Save button states to localStorage
            localStorage.setItem('checkinDisabled', checkinButton.disabled);
            localStorage.setItem('checkoutDisabled', checkoutButton.disabled);
            location.reload();
            return sessionStorage.getItem('check');
        })
        .catch(error => alert(error));
});

checkoutButton.addEventListener('click', function () {
    fetch('/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Error: ' + response.status);
            }
        })
        .then(text => {
            alert(text);
            checkinButton.disabled = true;
            checkoutButton.disabled = true;
            // Save button states to localStorage
            localStorage.setItem('checkinDisabled', checkinButton.disabled);
           localStorage.setItem('checkoutDisabled', checkoutButton.disabled);
           location.reload();
            return;
        })
        .catch(error => alert(error));
});
window.addEventListener('load', function() {
    var isCheckinDisabled = localStorage.getItem('checkinButtonDisabled');
    var isCheckoutDisabled = localStorage.getItem('checkoutButtonDisabled');

    // If the buttons' state is stored in localStorage, apply it to the buttons
    if (isCheckinDisabled !== null) {
        checkinButton.disabled = (isCheckinDisabled === 'true');
    }
    if (isCheckoutDisabled !== null) {
        checkoutButton.disabled = (isCheckoutDisabled === 'true');
    }
});

// document.getElementById('fileInput').addEventListener('change', function(e) {
//     const file = e.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             document.getElementById('profilePic').src = e.target.result;
//             // No need to alert here, as we'll handle the response from the server
//         }
//         reader.readAsDataURL(file);

//         // Create a FormData object and append the file
//         const formData = new FormData();
//         formData.append('image', file);

//         // Send the file to the server with AJAX
//         fetch('/upload', {
//             method: 'POST',
//             body: formData
//         })
//         .then(response => response.json())
//         .then(data => {
//             // Handle the response from the server
//             console.log(data);
//             alert('Profile picture uploaded successfully');
//         })
//         .catch(error => {
//             // Handle the error
//             console.error(error);
//         });
//     }
// });






