// const socket = page1('/page1');

//   // Listen for the 'notification' event
//   socket.on('notification', function(msg) {
//     // Display the notification
//     alert(msg);
//   });

const socket = io();
        socket.on('notification', (data) => {
            console.log('Notification:', data);
        });