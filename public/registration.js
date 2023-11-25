// registration.js

document.forms['registration_form'].addEventListener('submit', function (event) {
    event.preventDefault();

    // Get entered values
    let username = document.forms['registration_form']['username'].value;
    let password = document.forms['registration_form']['password'].value;
    let repeatPassword = document.forms['registration_form']['repeat_password'].value;
    let email = document.forms['registration_form']['email'].value;
    let name = document.forms['registration_form']['name'].value;

    // Perform basic validation
    if (username.trim() === '' || password.trim() === '' || repeatPassword.trim() === '' || email.trim() === '' || name.trim() === '') {
        alert('Please fill in all fields.');
        return;
    }

    // Check if the password and repeat password match
    if (password !== repeatPassword) {
        alert('Password and Repeat Password do not match.');
        return;
    }

    // Check if the email is valid and unique
    if (!isValidEmail(email)) {
        alert('Invalid email format. Please use only letters, numbers, "_" and ".", and make sure it is unique.');
        return;
    }

    // Check if the email is unique
    if (isEmailUnique(email)) {
        alert('Email address is already in use. Please choose a different one.');
        return;
    }

    // Registration successful, you can now proceed with storing the user data
    // For simplicity, you might want to use a server and a database in a real-world scenario

    // Set login status and redirect
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = '/invoice.html';
});


// Function to check if the password is valid
function isValidPassword(password) {
    // Check length, case sensitivity, and absence of spaces
    return password.length >= 10 && password.length <= 16 && password === password && !/\s/.test(password);
}


// Function to check if the email is valid
function isValidEmail(email) {
    // Use a regular expression to check the format
    // Allow letters, numbers, "_", and ".", case-sensitive
    const emailRegex = /^[a-zA-Z0-9_.]+@[a-zA-Z0-9]+\.[a-zA-Z]+$/;
    return emailRegex.test(email);
}

// Function to check if the email is unique
function isEmailUnique(email) {
    // In a real-world scenario, you would check against a database or an authentication service
    // For simplicity, let's assume a hardcoded list of existing email addresses
    const existingEmails = [
        'user@example.com',
        'another_user@example.com'
        // Add more existing email addresses as needed
    ];

    // Check if the email is in the existing list
    return existingEmails.includes(email);
}
