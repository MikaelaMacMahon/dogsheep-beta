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
//consider post as posting an expression?
//post creates resource on server
//get returns data from server to client
//TODO::do an intial get for the locations of the endpoints? - ie "/" location
//TODO:: add self descriptive messages
//TODO:: just return success status with post
//handle get requests for/api/boolean/simplify/result path


//POST:: Create a new entry in the collection where the ID is assigned automatically by the collection. ID created is usually included as part of the data returned by the operation
/*id: A|B
  result: 
  steps:

*/

app.get('/api/boolean/simplify/:id/result', (request, response) => {
    console.log("GET request recieved at /api/boolean/simplify/result)";
    //read file to return result
    fs.readFile(__dirname + "/" + "results.json", 'utf8',
    function (error, data) {
    if(error && error.code == "ENOENT"){
        console.error("Invalid filename provided");
        return;
    }
    try {
        var expDB = JSON.parse(data);
        var expResult = expDB[request.params.id].result; //grab result of simplification
        if(expResult == undefined) //check if incorrectly called
        {
            console.error("Expression simplify result is undefined");
            response.status(400).json({error: "Invalid result request"});
            return;
        }
        response.writeHead(200, {"Content-Type": "application/json"});
        response.end(JSON.stringify(expResult));
        //return result of simplification
    } catch (error) {
        response.status(400).json({error: "Invalid result request" });
        console.error("Simplified expresion request invalid");
        return;
    }
   
});

//return JSON object containing all of the steps
//handle get requests for/api/boolean/simplify/steps path
app.get('/api/boolean/simplify/:id/steps', (request, response) => {
    console.log("GET request recieved at /api/boolean/simplify/steps");
    //read file to return steps
    fs.readFile(__dirname + "/" + "results.json", 'utf8',
    function (error, data) {
    if(error && error.code == "ENOENT"){
        console.error("Invalid filename provided");
        return;
    }
    try {
        var expDB = JSON.parse(data);
        var expSteps = expDB[request.params.id].steps; //grab steps of simplification
        if(expSteps == undefined) //check if incorrectly called
        {
            console.error("Expression simplify steps are undefined");
            response.status(400).json({error: "Invalid steps request"});
            return;
        }
        response.writeHead(200, {"Content-Type": "application/json"});
        response.end(JSON.stringify(expSteps));
        //return result of simplification
    } catch (error) {
        response.status(400).json({error: "Invalid steps request" });
        console.error("Simplified expresion steps request invalid");
        return;
    }
   
});

//TODO:: check for expression match to previous - maybe step 1 or seperate endpoint
//return result of previously computed expression

app.post('/api/boolean/simplify', (request, response) => {
    console.log("Post request recieved at '/api/boolean/simplify/");
    //read file to return steps
    fs.readFile(__dirname + "/" + "results.json", 'utf8',
    function (error, data) {
    if(error && error.code == "ENOENT"){
        console.error("Invalid filename provided");
        return;
    }
    try {
        var expDB = JSON.parse(data);
        //retrieve body of request
        var newExp = request.body;
        //check if already in DB
        if(expDB.hasOwnProperty(newExp){
            response.end(JSON.stringify(expDB[newExp]));
            return;
        }        
        //retrieve json simplification results
        var simpResults = processBoolean(newExp);
        expDB = Object.assign(expDB, simpResults); //add new expression entry
        response.end(JSON.stringify(simpResults));

    }catch (error) {
        response.status(400).json({error: "Invalid service request" });
        console.error("Invalid service requeust");
        return;
    }
   
});


function processBoolean(exp){
    var jsonResult = '{ "TEST" : "5", "Result" : "6", "Steps" : { "step1" : "4", "step2" : "3", "step3" : "7" }}';
    return jsonResult;
}
