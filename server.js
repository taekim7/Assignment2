//server.js

// Importing the Express.js framework 
const express = require('express');
// Create an instance of the Express application called "app"
// app will be used to define routes, handle requests, etc
const app = express();
const qs = require ('querystring');
app.all('*', function (request, response, next) {
    //console.log(request.method + ' to ' + request.path);
    next();
 });

 //grabs everything from public
app.use(express.static(__dirname + '/public'));

// Start the server; listen on port 8080 for incoming HTTP requests
app.listen(8080, () => console.log(`listening on port 8080`));

//sets up the product array from the json file
let products = require(__dirname + '/products.json');


// Define a route for handling a GET request to a path that matches "./products.js"
app.get("/products.js", function (request, response, next) {
    response.type('.js');
    let products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});
app.use(express.urlencoded({ extended: true }));



//function to validate the quantity
function validateQuantity(quantity, availableQuantity) {
    let errors = [];
    quantity = Number(quantity);

    switch (true) {
        case isNaN(quantity) || quantity === '':
            errors.push("Not a number. Please enter non-negative quantity");
            break;
        case quantity < 0 && !Number.isInteger(quantity):
            errors.push("Not an integer. Please enter non-negative quantity");
            break;
        case quantity < 0:
            errors.push("Negative quantity. Please enter non-negative quantity");
            break;
        case quantity > availableQuantity:
            errors.push("Not enough items in stock");
            break;
    }
    return errors;
}







//------------------------------Assigntment 2-----------------------------//
// Declare a variable to store user data
let user_data;

// Import the 'fs' module for file system operations
const fs = require('fs');

// Define the file path of the JSON file containing user data
const filename= __dirname + '/user_data.json';

// Check if the file exists
if (fs.existsSync(filename)){
    // If the file exists, read its contents
    let data = fs.readFileSync(filename, 'utf8');
    // Parse the JSON data into a JavaScript object
    user_data = JSON.parse(data);
    // Log the user data to the console
    console.log(user_data);
} else {
    // If the file does not exist, log an error message
    console.log(`${filename} does not exist`);
    // Initialize the user_data variable as an empty object
    user_data = {};
}

// Declare a temporary variable to store user inputs
let temp_user = {}; // temp storage for user inputs to be passed along

/*
for (let i in products){
    products.forEach((prod, i) => {prod.qty_sold = 0});
}
*/                         


//===========================App Post Purchase Form==========================//
app.post("/process_purchase", function (request, response,) {
//extract content of request's body
let POST = request.body;
console.log("Received from data:", POST);
//assuming input box are empty
let has_qty = false;
//creating object to store error message for each input
let errorObject = {};

//iterating through each input
for (let i in products) {
    let qty = POST[`qty${[i]}`];
    has_qty = has_qty || (qty > 0);

    let errorMessage = validateQuantity(qty, products[i].qty_available);

    //store error messages
    if (errorMessage.length > 0) {
        errorObject[`qty${[i]}_error`] = errorMessage.join(', ');
    }
}
//if all input boxes are empty with no error
if (has_qty == false && Object.keys(errorObject).length == 0) {
    //redirect to products_display with error in url
    response.redirect("./products_display.html?error");

} else if (has_qty == true && Object.keys(errorObject).length == 0) {
    //update quantities and redirect to invoice
    for (let i in products) {
        temp_user [`qty${[i]}`]= POST [`qty${[i]}`];

        console.log(temp_user);

        /*
        //update quantity sold and available
        products[i].qty_sold += Number(qty);
        products[i].qty_available = products[i].qty_available - qty;
        */

    }
    //redirect to invoice page
    let params = new URLSearchParams(temp_user);
    console.log(params);
    response.redirect(`./login.html?${params.toString()}`);
}
//If there is an error
else if (Object.keys(errorObject).length > 0) {
    response.redirect("./products_display.html?" + qs.stringify(POST) + `&inputError`);
}

else {
    if (has_qty == false) {
        response.redirect("./products_display.html?" + qs.stringify(POST) + `&error`);
    }
}
});
    








//===========================App Post Login Form==========================//
// This code block defines a route handler for the POST request to the "/process_login" endpoint.
app.post("/process_login", function (request, response) {
    // Retrieve the data from the request body
    let POST = request.body;
    let entered_email = POST['email'].toLowerCase();
    let entered_password = POST['password'];

    // Check if the entered email and password are empty
    if (entered_email.length == 0 && entered_password.length == 0) {
        // Set an error message indicating that the email and password should be entered
        response.query.loginError = 'Please enter email and password';
    }
    // If the entered email exists in the user_data object
    else if (user_data[entered_email]) {
        // Check if the entered password matches the password associated with the entered email
        if (user_data[entered_email].password == entered_password) {
            // If the password is correct, create a temporary user object with the entered email and name
            temp_user['email'] = entered_email;
            temp_user['name'] = user_data[entered_email].name;

            // Log the temporary user object
            console.log(temp_user);

            // Create a URLSearchParams object with the temporary user object
            let params = new URLSearchParams(temp_user);
            // Redirect the user to the invoice page with a query parameter indicating success and the temporary user information
            response.redirect(`./invoice.html?valid&${params.toString()}`);
            return;
        }
        // If the entered password is empty
        else if (entered_password == 0) {
            // Set an error message indicating that the password should be entered
            request.query.loginError = 'Please enter password';
        }
        // If the entered password is incorrect
        else {
            // Set an error message indicating that the password is incorrect
            request.query.loginError = 'Incorrect password';
        }
    }
    // If the entered email does not exist in the user_data object
    else {
        // Set an error message indicating that the email is incorrect
        request.query.loginError = 'Incorrect email';
    }

    // Set the entered email as a query parameter in the request
    request.query.email = entered_email;
    // Create a URLSearchParams object with the request query parameters
    let params = new URLSearchParams(request.query);
    // Redirect the user back to the login page with the query parameters indicating the login error and the entered email
    response.redirect (`./login.html?${params.toString()}`);
});







//===========================App Post Continue Shoppin==========================//
// This code block handles a POST request to the '/continue_shopping' endpoint of the app.

app.post("/continue_shopping", function (request, response) {
    // Create a new URLSearchParams object with the 'temp_user' parameter.
    let params = new URLSearchParams(temp_user);

    // Redirect the response to the '/products_display.html' endpoint with the query parameters from the 'params' object.
    response.redirect(`/products_display.html?${params.toString()}`);
})






//===========================App Post Purchase Logout==========================//
app.post("/purchase_logout", function (request, response) {
    // Loop through each product in the products array
    for (let i in products) {
        // Increment the quantity sold of the current product by the number specified in the temp_user object
        products[i].qty_sold += Number(temp_user[`qty${[i]}`]);
        // Decrease the available quantity of the current product by the number specified in the temp_user object
        products[i].qty_available = products[i].qty_available - Number(temp_user[`qty${[i]}`]);
    }

    // Write the updated products array to the products.json file
    fs.writeFile(__dirname + '/products.json', JSON.stringify(products), 'utf-8', (error) => {
        if (error) {
            // If there's an error while writing the file, log the error message
            console.log('error updating products', error);
        } else {
            // If the file is written successfully, log a success message
            console.log('File written successfully. Products are updated.');
        }
    });

    // Remove the 'email' and 'name' properties from the temp_user object
    delete temp_user['email'];
    delete temp_user['name'];

    // Redirect the user to the products_display.html page
    response.redirect('./products_display.html');
})







//==============================App Post Register Form==========================//
//Declare registration errors
let registration_errors = {};

app.post("/process_register", function (request, response) {
    //Get user's input from form
    let reg_name = request.body.name;
    let reg_email = request.body.email.toLowerCase();
    let reg_password = request.body.password;
    let reg_confirm_password = request.body.confirm_password;

    //Validate Password
    validateConfirmPassword(reg_password, reg_confirm_password);
    validatePassword(reg_password);
    //Validate Email to see if it's only letters and "@"  "." and domain names
    validateEmail(reg_email);
    //Validate Name to see if it's only letters
    validateName(reg_name);


    //Server Response to check if there are no errors
    if (Object.keys(registration_errors).length == 0) {
        user_data[reg_email] = {};
        user_data[reg_email].name = reg_name;
        user_data[reg_email].password = reg_password;
        
        //Write the updated user_data object to the user_data.json file
        fs.writeFile(__dirname + '/user_data.json', JSON.stringify(user_data), 'utf-8', (error) => {
            if (error) {
                //If there's an error while writing the file, log the error message
                console.log('error updating user_data', error);
            } else {
                //If the file is written successfully, log a success message
                console.log('File written successfully. User data is updated.');

            //Add user's info to temp_user
            temp_user['name'] = reg_name;
            temp_user['email'] = reg_email;

            //console log temp_user
            console.log(temp_user);
            console.log(user_data);

            let params = new URLSearchParams(temp_user);
            response.redirect(`/invoice.html?regSuccess&valid&${params.toString()}`);
            }
        });
            
        
    }else { //If there are errors
        delete request.body.password;
        delete request.body.confirm_password;

        let params = new URLSearchParams(request.body);
        response.redirect(`/register.html?${params.toString()}&${qs.stringify(registration_errors)}`);
    }
});
function validateConfirmPassword(password, confirm_password) {
    delete registration_errors['confirm_password_type'];
    console.log(registration_errors);

    if (confirm_password !== password) {
        registration_errors ['confirm_password_type'] = 'Passwords do not match';
    }
}

// Validate Password Function
function validatePassword(password) {
    if (password.length < 10 || password.length > 16) {
        registration_errors.password_error = "Password must be between 10 and 16 characters.";
    } else if (/\s/.test(password)) {
        registration_errors.password_error = "Password cannot contain spaces.";
    }
    // Add more password validation rules as needed
}


// Validate Email Function
function validateEmail(email) {
    // Basic email validation using a regular expression
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        registration_errors.email_error = "Invalid email format.";
    }
}

//Validate Name
function validateName(name) {
    // Basic name validation using a regular expression
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
        registration_errors.name_error = "Invalid name format.";
    }
}