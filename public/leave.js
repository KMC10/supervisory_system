document.addEventListener('DOMContentLoaded', () => {
    const approveButtons = document.querySelectorAll('.button');

    approveButtons.forEach(approveButton => {
        approveButton.addEventListener('click', function (event) {
            const leaveId = event.currentTarget.getAttribute('data-leave-id');

            if (!leaveId) {
                console.error('Leave ID not found');
                return;
            }

            fetch('/approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ leaveId: leaveId })
            })
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    throw new Error('Error: ' + response.status);
                }
            })
            .then(text => {
                alert("Leave Approved!");
                //remove the row from the table
                //const row = document.getElementById(leaveId);
                location.reload();
            })
            .catch(error => alert(error));
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const approveButtons = document.querySelectorAll('.button1');

    approveButtons.forEach(approveButton => {
        approveButton.addEventListener('click', function (event) {
            const leaveId = event.currentTarget.getAttribute('data-leave-id');

            if (!leaveId) {
                console.error('Leave ID not found');
                return;
            }

            fetch('/reject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ leaveId: leaveId })
            })
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    throw new Error('Error: ' + response.status);
                }
            })
            .then(text => {
                alert("Leave Rejected");
                //remove the row from the table
                location.reload();
            })
            .catch(error => alert(error));
        });
    });
});
//     .then(text => {
//         alert(text);
//         //reload the page
//         location.reload();
//     })
//     .catch(error => alert(error));
// });