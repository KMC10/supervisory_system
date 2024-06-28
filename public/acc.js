function checkIn() {
    getLocation(function(latitude, longitude) {
        fetch('/checkin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude, longitude })
        })
        .then(handleResponse)
        .then(data => {
            alert(data.message);
            checkinButton.disabled = true;
            checkoutButton.disabled = false;
            // Save button states to localStorage
            localStorage.setItem('checkinDisabled', checkinButton.disabled);
            localStorage.setItem('checkoutDisabled', checkoutButton.disabled);
            // Refresh the page
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message || 'An error occurred while checking in');
        });
    });
}

function checkOut() {
    getLocation(function(latitude, longitude) {
        fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude, longitude })
        })
        .then(handleResponse)
        .then(data => {
            alert(data.message);
            checkinButton.disabled = false;
            checkoutButton.disabled = true;
            // Save button states to localStorage
            localStorage.setItem('checkinDisabled', checkinButton.disabled);
            localStorage.setItem('checkoutDisabled', checkoutButton.disabled);
            // Refresh the page
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message || 'An error occurred while checking out');
        });
    });
}

const checkinButton = document.getElementById('check-in-btn');
const checkoutButton = document.getElementById('check-out-btn');

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

function getLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            callback(position.coords.latitude, position.coords.longitude);
        }, function(error) {
            console.error('Error getting location', error);
            alert('Unable to retrieve your location');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function handleResponse(response) {
    return response.json().then(data => {
        if (!response.ok) {
            throw new Error(data.message);
        }
        return data;
    });
}

checkinButton.addEventListener('click', checkIn);
checkoutButton.addEventListener('click', checkOut);