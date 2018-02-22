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

//handle get requests for/api/boolean/simplify/result path
app.get('/api/boolean/simplify/result', (request, response) => {
    console.log("GET request recieved at /api/boolean/simplify/result)";
    //format response (status, content, headers)
});


//handle get requests for/api/boolean/simplify/steps path
app.get('/api/boolean/simplify/steps', (request, response) => {
    console.log("GET request recieved at /api/boolean/simplify/steps");
    //format response (status, content, headers)
});


//post to recieve data from client (ie expression)
//put?

//http server to handle simplification and respond to front end requests





//two endpoints
//write results to a file for easy recollection
