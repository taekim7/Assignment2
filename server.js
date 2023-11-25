//server.js
const fs = require('fs');

//Define user_data.json
let filename = __dirname + '/user_data.json';

// Load existing user registration data from the file
let user_reg_data = {};
if (fs.existsSync(filename)) {
    user_reg_data = JSON.parse(fs.readFileSync(filename, 'utf-8'));
}



// Importing the Express.js framework
const express = require('express');
// Create an instance of the Express application called "app"
// app will be used to define routes, handle requests, etc
const app = express();

app.use(express.urlencoded({ extended: true }));

// grabs everything from public
app.use(express.static(__dirname + '/public'));

// sets up the product array from the json file
let products = require(__dirname + '/products.json');
products.forEach((prod, i) => {
    prod.total_sold = 0
});

// Define a route for handling a GET request to a path that matches "./products.js"
app.get("/products.js", function (request, response, next) {
    response.type('.js');
    let products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

// whenever a post with process form is received
app.post("/process_form", function (request, response) {
    // get the quantities
    let qtys = request.body[`quantity_textbox`];
    // console.log(qtys);
    let valid = true;
    // set url
    let url = '';
    let soldArray = [];
    // loop through quantities
    for (i in qtys) {
        // set q as the number
        let q = Number(qtys[i]);
        // call validate quantity
        if (validateQuantity(q) == '') {
            // if not enough in stock, set valid to false
            if (products[i]['qty_available'] - Number(q) < 0) {
                valid = false;
                url += `&prod${i}=${q}`;
            }
            // else, add to sold array
            else {
                soldArray[i] = Number(q);
                // add to url
                url += `&prod${i}=${q}`;
            }
        } else {
            valid = false;
            url += `&prod${i}=${q}`;
        }
    }

    // if there is no quantity, set valid to false
    if (url == `&prod0=0&prod1=0&prod2=0&prod3=0&prod4=0&prod5=0`) {
        valid = false;
    }

    if (valid == false) {
        response.redirect(`products_display.html?error=true` + url);
    } else {
        // store quantities in response.locals
        response.locals.qtys = soldArray;
        // Check if the user is logged in (Note: No session used)
        // You might want to implement your own user tracking mechanism if needed
        if (loggedInUsers.has(/* user identifier, you need a way to identify users */)) {
            // User is logged in, proceed with the purchase or redirect to invoice
            for (i in qtys) {
                // add to total sold
                products[i]['total_sold'] += soldArray[i];
                products[i]['qty_available'] -= soldArray[i];
            }
            response.redirect('invoice.html?' + url);
        } else {
            // User is not logged in (new user), redirect to registration page
            response.redirect('/login.html');
        }
    }
});

// app post for login
app.post("/login", function (request, response) {
    let username_entered = request.body['username'];
    let password_entered = request.body['password'];

    // Assuming you have user_reg_data defined somewhere in your code
    const user_reg_data = {
        // Your user data here
    };

    let response_msg = '';
    let errors = false;

    // Check if username and password exist in user_reg_data
    if (typeof user_reg_data[username_entered] !== 'undefined') {
        // Check if the entered password meets the criteria
        if (!isValidPassword(password_entered)) {
            response_msg = 'Invalid password. Password must be between 10 and 16 characters, case-sensitive, and not contain spaces.';
            errors = true;
        } else if (password_entered == user_reg_data[username_entered].password) {
            // Redirect to invoice page after successful login
            response.redirect(`./invoice.html?username=${username_entered}`);
            return;
        } else {
            // Incorrect Password
            response_msg = 'Wrong username or password. Please try again.';
            errors = true;
        }
    } else {
        // Username does not exist
        response_msg = `${username_entered} does not exist`;
        errors = true;
    }

    // If there are errors, redirect to login page with error message and retained username
    if (errors) {
        // Redirect to login page with error message
        response.redirect(`/login.html?error=${response_msg}&username=${username_entered}`);
    }
});

// Function to check if the password is valid
function isValidPassword(password) {
    // Check length, case sensitivity, and absence of spaces
    return password.length >= 10 && password.length <= 16 && password === password && !/\s/.test(password);
}

// Route all other GET requests to serve static files from a directory named "public"
app.all('*', function (request, response, next) {
    // console.log(request.method + ' to ' + request.path);
    next();
});




// Post for Register
app.post("/register", function (request, response) {
    // Process a simple register form
    let new_user = request.body.username.trim(); // Trim to remove leading and trailing spaces
    let new_email = request.body.email.trim().toLowerCase(); // Trim and convert to lowercase

    let errors = false;
    let resp_msg = "";

    // Check if username contains spaces
    if (new_user.includes(" ")) {
        resp_msg = "Username cannot contain spaces.";
        errors = true;
    }

    // Check if email is valid (contains only letters, numbers, "_", ".", and "@")
    if (!/^[a-zA-Z0-9_.@]+$/.test(new_email)) {
        resp_msg = "Invalid email format. Email can only contain letters, numbers, '_', '.', and '@'.";
        errors = true;
    }

    // Check if email is already registered
    if (Object.values(user_reg_data).some(user => user.email.toLowerCase() === new_email)) {
        resp_msg = "Email address is already registered.";
        errors = true;
    }

    if (typeof user_reg_data[new_user] != 'undefined') {
        resp_msg = `${new_user} already exists`;
        errors = true;
    } else if (request.body.password == request.body.repeat_password) {
        // Check if password meets the criteria
        if (!isValidPassword(request.body.password)) {
            resp_msg = 'Invalid password. Password must be between 10 and 16 characters, case-sensitive, and not contain spaces.';
            errors = true;
        } else {
            // Save user data
            user_reg_data[new_user] = {};
            user_reg_data[new_user].password = request.body.password;
            user_reg_data[new_user].email = new_email;
            user_reg_data[new_user].name = request.body.name;

            fs.writeFileSync(filename, JSON.stringify(user_reg_data), 'utf-8');

            // Redirect to the invoice page after successful registration
            response.redirect(`./invoice.html?username=${new_user}`);
        }
    } else {
        resp_msg = `Passwords do not match`;
        errors = true;
    }

    if (errors) {
        response.send(resp_msg);
    }
});

// Function to check if the password is valid
function isValidPassword(password) {
    // Check length, case sensitivity, and absence of spaces
    return password.length >= 10 && password.length <= 16 && password === password && !/\s/.test(password);
}




// Start the server; listen on port 8080 for incoming HTTP requests
app.listen(8080, () => console.log(`listening on port 8080`));

// function to validate the quantity
function validateQuantity(quantity) {
    // console.log(quantity);
    if (isNaN(quantity)) {
        return "Not a Number";
    } else if (quantity < 0 && !Number.isInteger(quantity)) {
        return "Negative Inventory & Not an Integer";
    } else if (quantity < 0) {
        return "Negative Inventory";
    } else if (!Number.isInteger(quantity)) {
        return "Not an Integer";
    } else {
        return "";
    }
}
