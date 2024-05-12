console.log("kmc");
fetch('/submit', {
    method: 'POST',
    body: formData
})
console.log(formData)
.then(response => response.json())
.then(data => {
    //console.log
    if (data.redirection === true) {
        console.log("Success");
        // Redirect the user to a new page or perform other actions
    } else {
        console.log("Failure");
        // Handle the failure case
    }
})
.catch(error => {
    console.error('Error submitting form:', error);
    // Handle errors in the request or response
});
