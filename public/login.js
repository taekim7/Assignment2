// login.js

document.forms['login_form'].addEventListener('submit', function (event) {
    event.preventDefault();

    // Get entered username and password
    let username = document.forms['login_form']['username'].value;
    let password = document.forms['login_form']['password'].value;

    // Perform basic username/password validation (you might have more sophisticated validation)
    if (username.trim() === '' || password.trim() === '') {
        alert('Please enter both username and password.');
        return;
    }

    // Check if the entered username and password are valid (you might have a server-side check)
    if (checkCredentials(username, password)) {
        // Valid credentials, set login status and redirect
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = '/products_display.html';
    } else {
        // Invalid credentials, show error message and clear the password
        alert('Username or Password does not exist. Please try again.');
        document.forms['login_form']['password'].value = ''; // Clear the password field
    }
});


// Assuming successful login
// Verify credentials and other login logic...

// Set the user token in localStorage
localStorage.setItem("userToken", "some_unique_token");

// Redirect to the invoice page or perform other actions
window.location.href = "/invoice.html";



// During logout
localStorage.removeItem("userToken");

// Redirect to the login page or perform other actions
window.location.href = "/login.html";