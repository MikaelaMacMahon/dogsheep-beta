//Rest-based server using Node.js and Express.js


var http = require('http');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser);
var app = express();

app.use(bodyParser.json());

var server = app.listen(8080, function () {
    console.log("Server running on port 8080");
});

//TODO::do an intial get for the locations of the endpoints? - ie "/" location
//TODO:: add self descriptive messages

//handle get requests for/api/boolean/simplify/result path
app.get('/api/boolean/simplify/result', (request, response) => {
    console.log("GET request recieved at /api/boolean/simplify/result)";
    //read file to return result
    fs.readFile(__dirname + "/" + "results.json", 'utf8',
    function (error, data) {
    if(err && err.code == "ENOENT"){
        console.error("Invalid filename provided");
        return;
    }
    //read JSON data
    
   
    //TODO::format response (status, content, headers)
});

//return JSON object containing all of the steps
//handle get requests for/api/boolean/simplify/steps path
app.get('/api/boolean/simplify/steps', (request, response) => {
    console.log("GET request recieved at /api/boolean/simplify/steps");
    //read file to return steps
    fs.readFile(__dirname + "/" + "results.json", 'utf8',
    function (error, data) {
    if(err && err.code == "ENOENT"){
        console.error("Invalid filename provided");
        return;
    }
   
    //format response (status, content, headers)
});

//TODO:: check for expression match to previous - maybe step 1 or seperate endpoint
//return result of previously computed expression

//post new expression
//update JSON file with steps and result
//clear after each time?
app.post('/api/boolean/simplify', (request, response) => {
    console.log("Post request recieved at '/api/boolean/simplify/");
    //read file to return steps
    fs.readFile(__dirname + "/" + "results.json", 'utf8',
    function (error, data) {
    if(err && err.code == "ENOENT"){
        console.error("Invalid filename provided");
        return;
    }
   
});


app.post('/api/boolean/simplify/steps', (request, response) => {
    console.log("Post request recieved at '/api/boolean/simplify/steps");

});
//post to recieve data from client (ie expression)

//http server to handle simplification and respond to front end requests





//two endpoints
//write results to a file for easy recollection
