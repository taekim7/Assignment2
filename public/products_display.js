//products_display.js

// Function to check if the user is logged in
function checkIfLoggedIn() {
    // In a real-world scenario, you might have a more sophisticated check
    // This is a simple example using a flag
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Update UI based on login status
function updateUIBasedOnLoginStatus() {
    let isLoggedIn = checkIfLoggedIn();
    let logoffButton = document.getElementById('logoffButton');

    if (isLoggedIn) {
        logoffButton.style.display = 'block';
    } else {
        logoffButton.style.display = 'none';
    }
}

// Logoff button click event
document.getElementById('logoffButton').addEventListener('click', function () {
    // Perform logoff actions
    performLogoffActions();
});

// Perform logoff actions
function performLogoffActions() {
    // Clear the login status flag
    localStorage.removeItem('isLoggedIn');
    // Redirect to the login page
    window.location.href = '/login.html';
}

// Call the function to update the UI based on login status
updateUIBasedOnLoginStatus();

//get parameters
let params = (new URL(document.location)).searchParams;
let error;
let order = [];

//get error value
error = params.get('error');

//get order array
params.forEach((value,key) => {
    if (key.startsWith('prod')) {
            order.push(parseInt(value));
        }
});
console.log('Order Array:', order);

//Populate error message
if(error == 'true'){
    
    document.getElementById('errorDiv').innerHTML += `<h2 class="text-danger"></h2><br>`;
}

//Populate products
for (let i = 0; i < products.length; i++) {
    document.querySelector('.row').innerHTML += 
        `<div class="col-md-6 product_name mb-4">
        <div class="name">
            <div class="text-center">
                <img src="${products[i].image}" class="name-img" alt="Product Image" data-tooltip="${products[i].description}">
            </div>
            <div class="name-body">
                <h5 class="name-title">${products[i].name}</h5>
                <p class="name-text">
                    Price: $${(products[i].price).toFixed(2)}<br>
                    Available: ${products[i].qty_available}<br>
                    Total Sold: ${products[i].total_sold}
                </p>
                
                <input type="text" placeholder="0" name="quantity_textbox" id="${[i]}" class="form-control" oninput="validateQuantity(this)" value="${order[i] !== 0 && order[i] !== undefined ? order[i] : ''}" onload="validateQuantity(this)">
                <p id="invalidQuantity${[i]}" class="text-danger"></p>
                </div>
            </div>
        </div>`
        validateQuantity(document.getElementById(`${[i]}`));
 ;}

//function to validate the quantity, returns a string if not a number, negative, not an integer, or a combination of both
    function validateQuantity(quantity){
        //set variables, and grab number from the quantity and set it to an number
        let valMessage = '';
        let quantityNumber = Number(quantity.value);
        //console.log(Number.isInteger(quantityNumber));
        document.getElementById(`invalidQuantity${quantity.id}`).innerHTML = "validationMessage";
        //console.log(products[quantity.id]['qty_available']);
        //gets validation message if not a number, negative, not an integer, or if there is not enough items in stock
        //else  empty string 
        if(isNaN(quantityNumber)){
            valMessage = "Please Enter a Number";
        }else if (quantityNumber<0 && !Number.isInteger(quantityNumber)){
            valMessage = "Please Enter a Positive Integer";
        }else if (quantityNumber <0){
            valMessage = "Please Enter a Positive Value";
        }else if(!Number.isInteger(quantityNumber)){
            valMessage = "Please Enter an Integer";
        }else if(quantityNumber > products[quantity.id]['qty_available']){
            valMessage = "Not Enough Items in Stock!";
        }
        else{
            valMessage = '';
        }
        //set the valMessage to the innerHTML to the section
        document.getElementById(`invalidQuantity${quantity.id}`).innerHTML = valMessage;
        //console.log(products[quantity.id])
    }

    document.querySelector('form[name="qty_form"]').addEventListener('submit', function (event) {
        event.preventDefault();
    
        // Check if the user is logged in (you can implement your own authentication logic)
        let isLoggedIn = checkIfLoggedIn();
    
        if (isLoggedIn) {
            // User is logged in, proceed to the invoice page
            submitFormAndRedirect();
        } else {
            // User is not logged in, redirect to the login page
            window.location.href = '/login.html';
        }
    });
    
    function checkIfLoggedIn() {
        // In a real-world scenario, you might have a more sophisticated check
        // This is a simple example using a session variable
        return sessionStorage.getItem('isLoggedIn') === 'true';
    }

    function submitFormAndRedirect() {
        // Submit the form to the process_form route
        document.forms['qty_form'].submit();
    }