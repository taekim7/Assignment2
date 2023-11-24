//server.js

// Importing the Express.js framework 
const express = require('express');
// Create an instance of the Express application called "app"
// app will be used to define routes, handle requests, etc
const app = express();

app.use(express.urlencoded({ extended: true }));

//grabs everything from public
app.use(express.static(__dirname + '/public'));

//sets up the product array from the json file
let products = require(__dirname + '/products.json');
products.forEach( (prod,i) => {prod.total_sold = 0});

// Define a route for handling a GET request to a path that matches "./products.js"
app.get("/products.js", function (request, response, next) {
    response.type('.js');
    let products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});
//whenever a post with proccess form is recieved
app.post("/process_form", function (request, response) {
    //get the quantities
    let qtys = request.body[`quantity_textbox`];
    //console.log(qtys);
    let valid = true;
    //set url
    let url = '';
    let soldArray =[];
    //loop through quantities
    for (i in qtys) { 
        //set q as the number
        let q = Number(qtys[i]);
        //call validate quantity
        if (validateQuantity(q)=='') {
            //if not enough in stock, set valid to false
            if(products[i]['qty_available'] - Number(q) < 0){
                valid = false;
                url += `&prod${i}=${q}`
            }
            //else, add to sold array
            else{
                soldArray[i] = Number(q);
                //add to url
                url += `&prod${i}=${q}`
            }
        }
        //if not a number, set valid to false
         else {
            valid = false;
            url += `&prod${i}=${q}`
        }
        //if there is no quantity, set valid to false
        if(url == `&prod0=0&prod1=0&prod2=0&prod3=0&prod4=0&prod5=0`){
            valid = false
        }
    }
    //if not valid, redirect back
    if(valid == false)
    {
        response.redirect(`products_display.html?error=true` + url);
    }
    //else, redirect to invoice
    else{
         for (i in qtys)
        {
            //add to total sold
            products[i]['total_sold'] += soldArray[i];
            products[i]['qty_available'] -= soldArray[i];
        }
        response.redirect('invoice.html?' + url);
    }
 });

// Route all other GET requests to serve static files from a directory named "public"

app.all('*', function (request, response, next) {
    //console.log(request.method + ' to ' + request.path);
    next();
 });

// Start the server; listen on port 8080 for incoming HTTP requests
app.listen(8080, () => console.log(`listening on port 8080`));

//function to validate the quantity
function validateQuantity(quantity){
    //console.log(quantity);
    if(isNaN(quantity)){
        return "Not a Number";
    }else if (quantity<0 && !Number.isInteger(quantity)){
        return "Negative Inventory & Not an Integer";
    }else if (quantity <0){
        return "Negative Inventory";
    }else if(!Number.isInteger(quantity)){
        return "Not an Integer";
    }else{
        return"";
    }

}