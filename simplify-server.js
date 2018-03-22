//Rest-based server using Node.js and Express.js
/*
AZURE DATABASE SETUP:
//max 5 sets of brackets corresponding to 6 steps
//TODO:: do not store the entire expression as first step
CREATE TABLE Expressions (
expID VARCHAR(255) NOT NULL UNIQUE,
expresult VARCHAR(255) NOT NULL
step1 VARCHAR(255) NOT NULL,
step2 VARCHAR(255),
step3 VARCHAR(255),
step4 VARCHAR(255),
step5 VARCHAR(255),
step6 VARCHAR(255)


Once Node is running correctly, install needed dependencies:
- npm install express
- npm install body-parser

- npm install passport
- npm install passport-local
- npm install jsonwebtoken
- npm install express-jwt

);
*/
'use strict'; // set JavaScript to run in strict mode
var http = require('http');
var fs = require('fs');
//TODO:: add dependency to readme
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const passport = require('passport');  
const strategy = require('passport-local');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');  

const serverSecret = 'bobisawesome';
var authenticate = expressJwt({secret : serverSecret});


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "authorization, content-type");
    res.header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    next();
});

app.use(bodyParser.json());
app.use(passport.initialize()); 

var server = app.listen(8080, function () {
    console.log("Server running on port 8080");
});

// purpose: uses passport-local strategy to handle username/password authentication
passport.use(new strategy( 
  function(username, password, done) {
    // (1) replace the following with data retrieved from database
    // (2) ensure that password is not handled as plaintext
    if(username === 'bob' && password === '42'){ 
      done(null, { // stub call to a database; returning fixed info
        id: 42, fname: 'bob', lname: 'no-name', contact: 'bob@no-name.com', legit: true
      });
    }
    else {
      done(null, false);
    }
  }
));


// purpose: generates a token based on provided user.id; token is set to expire based on expiresIn value
function generateToken(req, res, next) {  
  req.token = jwt.sign({
    id: req.user.id,
  }, serverSecret, {
    expiresIn : 60*30 // set to expire in 30 minutes
  });
  next(); // pass on control to the next function
}

// purpose: return generated token to caller
function returnToken(req, res) {  
  res.status(200).json({
    user: req.user,
    token: req.token
  });
}

// purpose: update or create user data in database and only return user.id
function serializeUser(req, res, next) {  
  db.updateOrCreate(req.user, function(err, user){
    if(err) {return next(err);}
      req.user = {
        id: user.id
      };
      next();
  });
}
  
var db = {  
  updateOrCreate: function(user, cb){
    cb(null, user);
  }
};

//setup database connection
var db_conn_info = {
    userName: 'super_user',
    password: 'Dogsheepbeta1!',
    server: 'dogsheepbeta.database.windows.net',
    options: {
        database: 'syde322dogsheepbeta',
        encrypt: true,
        rowCollectionOnRequestCompletion:true
    }
};


var rules = {"NULL":0, "IDENTITY":1, "NULL_ELEMENT":2, "IDEMPOTENCY":3, "COMPLEMENTS":4, "DISTRIBUTIVITY":5, "COVERING":6, "COMBINING":7};

var op = {"NULL":0, "AND": 1, "OR":2};
/*
//purpose for encryption
app.get('/api/', (req, res) => {
    console.log("GET request recieved for '/api/');
    res.status(200).json({"message": "Welcome to DogSheep Beta"});
})
*/

// purpose: handles POST requests for '/authenticate' path
app.post('/authenticate', passport.authenticate(  
  'local', {
    session: false
  }), serializeUser, generateToken, returnToken);

app.get('/api/boolean/simplify/:id/result', authenticate, (request, response) => {
    console.log("GET request recieved at /api/boolean/simplify/"  + request.params.id + "/result");
    var query = 'SELECT A.expResult FROM dbo.ExpResult A INNER JOIN dbo.Expressions B ON B.expID=A.expID WHERE B.exp=\''+ request.params.id + '\';';
    if(!query.includes("dbo.ExpResult")){
        res.status(400).json({ error: "Invalid service request" });
	console.error("Invalid service request");
	return;
    }
    getDBData(request,response, db_conn_info, query);
});

//return JSON object containing all of the steps
//handle get requests for/api/boolean/simplify/steps path
//Submit provided token as part of the header using: authorization: Bearer full-token-string
app.get('/api/boolean/simplify/:id/steps', authenticate, (request, response) => {
    console.log("GET request recieved at /api/boolean/simplify/" + request.params.id + "/steps");
    var query = 'SELECT A.step, A.stepNum FROM dbo.Steps A INNER JOIN dbo.Expressions B ON B.expID=A.expID WHERE B.exp=\'' + request.params.id + '\';';
    //TODO:: Add more error checking
    if(!query.includes("dbo.Steps")){
        res.status(400).json({ error: "Invalid service request" });
	console.error("Invalid service request");
	return;
    }
    getDBData(request,response, db_conn_info, query);
});

//Submit provided token as part of the header using: authorization: Bearer full-token-string
app.post('/api/boolean/simplify', authenticate, (request, response) => {
    console.log("Post request recieved at '/api/boolean/simplify/");
    //retrieve body of request
    var newExp = request.body;
    var query = newExp['query'];
    var exp = newExp['input'];
    if(!query.includes("dbo.Expressions")){
        res.status(400).json({ error: "Invalid service request" });
	console.error("Invalid service request");
	return;
    }
   console.log(exp);
   //retrieve json simplification results
   var simpResults = processBoolean(exp);
   //format quer
   console.log(simpResults);
   var str = "INSERT INTO Steps(expID, step, stepNum) SELECT dbo.Expressions.expID,";
   var strEnd = "FROM dbo.Expressions WHERE exp=";
   var index;
   for(i in simpResults[exp].Steps){
       query += str + '\'' + simpResults[exp].Steps[i] + '\',' + (i++) + strEnd + '\'' + exp + "\';";
   }
   //add result
   query += "INSERT INTO ExpResult(expID, expResult) SELECT dbo.Expressions.expID,'" + simpResults[exp].Result + '\''+ strEnd + '\''+ exp +'\'' + ';';
   console.log(query);
   getDBData(request, response, db_conn_info,query);     
})

function processBoolean(exp){
    console.log(exp);
    var output = {};
    var origExp = exp;
    output[origExp] = {};
    //var output = document.getElementById("output");
    var lowInd, highInd, simExp, len, modExp;
    //check without bracket analysis
    exp = detectSimp(exp);
    output[origExp]["Steps"] = new Array();
    output[origExp]["Steps"][0] = exp;
    console.log(output);
    //detect indices of brackets
    var parseData = detectOrder(exp);
    //count how many simplifications you will do (how many sets of brackets there are to process)
    var maxChecks = parseData.indexOp.length;
    var simplified = false;
    var ctr = 0;
    modExp = exp;
    var stepStr;
    // if there are brackets, simplify contents within brackets
    while(!simplified && maxChecks > 0){
       // working from most inward bracket outward (last bracket you find is the most inward)
        lowInd = parseData.indexOp[maxChecks - 1 - ctr];
        highInd = parseData.indexCls[maxChecks - 1 - ctr];
        // isolates content within brackets
        modExp = exp.slice(lowInd + 1, highInd);
        // simplify brackets contents
        simExp = detectSimp(modExp);
        // check if it simplified (was there a change in length?)
        len = modExp.length - simExp.length;
        // if change occurred, update expression
        if(len != 0) exp = exp.slice(0, lowInd) + simExp + exp.slice(highInd + 1);
        
        //update indices
        if(len != 0){
            for(i = 0; i < maxChecks -1; i++){
                if(parseData.indexOp[i] > highInd){
                    parseData.indexOp[i] -= (len + 2);
                }
                if(parseData.indexCls[i] > highInd){
                    parseData.indexCls[i] -= (len + 2);
                }
            } 
            
        }
        // check if brackets are simplified
        ctr++;        
        if(ctr == maxChecks){
             simplified = true;
        }
        //Display number of steps depending on number of brackets
        
        output[origExp]["Steps"][ctr] = exp;
    }
    //process equation one more time to catch stragglers
    exp = detectSimp(exp);
    output[origExp]["Result"] = exp;
    return output;
}

function detectSimp(exp){
	// closing parenthesis
    var str = /(\()/g;
	// or 0
    var test_0_a = /(\|0)(?!\))/g;
	// 0 or
    var test_0_b = /(0\|)(?!\))/g;
	// and 1
    var test_1_a = /(\&1)(?!\))/g;
	// 1 and
    var test_1_b = /(1\&)(?!\))/g;
	// or 1
    var test_2_a = /(\|1)(?!\))/g;
	// 1 or
    var test_2_b = /(1\|)(?!\))/g;
	// and 0
    var test_3_a = /(\&0)(?!\))/g;
	// 0 and
    var test_3_b = /(0\&)(?!\))/g;
	// A or not A
	var test_4_a = /(^|\|)([A-Z]).*\|(\~(\2))/;
	// not A or A
	var test_4_b = /(^|\|)(\~([A-Z])).*\|(\3)/;
	// A and not A
	var test_5 = /([A-Z])\&~(\1)/g;
	// A or (B and C)
	var test_6 = /([A-Z])\|(\(((?!\1)[A-Z])&((?!\1)(?!\3)[A-Z])\))/;
	// A and (B or C)
	var test_7 = /([A-Z])\&\(((?!\1)[A-Z])\|((?!\1)(?!\2)[A-Z])\)/g;
	// A or (A and B)
	var test_8_a = /([A-Z])\|(\(\1\&((?!\1)[A-Z])\))/;
	// A or (B and A)
	var test_8_b = /([A-Z])\|(\(((?!\1)[A-Z])\&\1\))/;
	// (A and B) or A
	var test_8_c = /(\(([A-Z])\&((?!\1)[A-Z])\))\|\1/;
	// (B and A) or A
	var test_8_d = /(\(((?!\1)[A-Z])\&\1\))\|([A-Z])/;
	// (A and B) or (A and not B)
	var test_9 = /\(([A-Z])\&((?!\1)[A-Z])\)\|\(\1\&\~\2\)/g;
	// (A or B) and (A or not B)
	var test_10 = /\(([A-Z])\|((?!\1)[A-Z])\)\&\(\1\|\~\2\)/g;
    var exp2 = exp;
	var matchArray;
    var test;
    //Test for A|0 condition
    if(test_0_a.test(exp2) || test_0_b.test(exp2)){
		console.log("0");
        exp2 = simplify(exp2, rules.IDENTITY, op.OR);
    }
    //Test for A&1 condition
    if(test_1_a.test(exp2) || test_1_b.test(exp2)){
		console.log("1");
        exp2 = simplify(exp2, rules.IDENTITY, op.AND);
    }  
    //Test for A|1 condition
    if(test_2_a.test(exp2) || test_2_b.test(exp2)){
		console.log("2");
        exp2 = simplify(exp2, rules.NULL_ELEMENT, op.OR);
    }
    //Test for A&0 = 0
    if(test_3_a.test(exp2) || test_3_b.test(exp2)){
		console.log("3");
        exp2 = simplify(exp2, rules.NULL_ELEMENT, op.AND);
    }
	//Test for A|~A = 0
    if(test_4_a.test(exp2)) {
		console.log("4a");
		test = test_4_a;
		if (!trappedInBrackets(exp2, test.exec(exp2)[2], test.exec(exp2)[3])){
			matchArray = test.exec(exp2);
			console.log("a: " + matchArray);
			exp2 = placeAtEnd(exp2, matchArray[2], matchArray[3], 0);
			exp2 = simplify(exp2, rules.COMPLEMENTS, op.OR);
		}
    }
	//Test for ~A|A = 0
	if(test_4_b.test(exp2)) {
		console.log("4b");
		test = test_4_b;
		if (!trappedInBrackets(exp2, test.exec(exp2)[2], test.exec(exp2)[3])){
			matchArray = test.exec(exp2);
			console.log("b: " + matchArray);
			exp2 = placeAtEnd(exp2, matchArray[3], matchArray[2], 0);
			exp2 = simplify(exp2, rules.COMPLEMENTS, op.OR);
		}
	}
	//Test for A&~A = 0
    if(test_5.test(exp2)){
		console.log("5");
        exp2 = simplify(exp2, rules.COMPLEMENTS, op.AND);
    }
	//Test for A|(B&C) = (A|B)&(A|C)
    if(test_6.test(exp2)) {
		console.log("6");
		test = test_6;
		if (!trappedInBrackets(exp2, test.exec(exp2)[1], test.exec(exp2)[2])){
			matchArray = test.exec(exp2);
			exp2 = placeAtEnd(exp2, test.exec(exp2)[1], test.exec(exp2)[2], 0);
			exp2 = simplify(exp2, rules.DISTRIBUTIVITY, op.OR);
		}
    }
	//Test for A&(B|C) = (A&B)|(A&C)
    if(test_7.test(exp2)){
		console.log("7");
        exp2 = simplify(exp2, rules.DISTRIBUTIVITY, op.AND);
    }
	//Test for A|(A&B) = A
	if(test_8_a.test(exp2)) {
		console.log("8a");
		test = test_8_a;
		if (!trappedInBrackets(exp2, test.exec(exp2)[1], test.exec(exp2)[2])){
			matchArray = test.exec(exp2);
			console.log(matchArray);
			exp2 = placeAtEnd(exp2, test.exec(exp2)[1], test.exec(exp2)[2], 0);
			exp2 = simplify(exp2, rules.COVERING, op.OR);
		}
	}
	//Test for A|(B&A)
	if(test_8_b.test(exp2)) {
		console.log("8b");
		test = test_8_b;
		if (!trappedInBrackets(exp2, test.exec(exp2)[1], test.exec(exp2)[2])){
			matchArray = test.exec(exp2);
			console.log(matchArray);
			exp2 = placeAtEnd(exp2, test.exec(exp2)[1], test.exec(exp2)[2], 0);
			exp2 = simplify(exp2, rules.COVERING, op.OR);
		}
	}
	//Test for (A&B)|A = A
	if(test_8_c.test(exp2)) {
		console.log("8c");
		test = test_8_c;
		if (!trappedInBrackets(exp2, test.exec(exp2)[1], test.exec(exp2)[2])){
			matchArray = test.exec(exp2);
			console.log(matchArray);
			exp2 = placeAtEnd(exp2, test.exec(exp2)[1], test.exec(exp2)[2], 0);
			exp2 = simplify(exp2, rules.COVERING, op.OR);
		}
	}
	//Test for (B&A)|A
	if(test_8_d.test(exp2)) {
		console.log("8d");
		test = test_8_d;
		if (!trappedInBrackets(exp2, test.exec(exp2)[1], test.exec(exp2)[2])){
			matchArray = test.exec(exp2);
			console.log(matchArray);
			exp2 = placeAtEnd(exp2, test.exec(exp2)[1], test.exec(exp2)[2], 0);
			exp2 = simplify(exp2, rules.COVERING, op.OR);
		}
	}
	//Test for (A&B)|(A&~B) = A
	if(test_9.test(exp2)){
		console.log("9");
		exp2 = simplify(exp2, rules.COMBINING, op.OR);
	}
	//Test for (A|B)&(A|~B) = A
	if(test_10.test(exp2)){
		console.log("10");
		exp2 = simplify(exp2, rules.COMBINING, op.AND);
	}
    //idempotency test
    exp2 = idemTest(exp2);
    
    return exp2;
}
	
function placeAtEnd(expression, var1, var2, operation) {
	var generalMatch1, generalMatch2, matchArray, fullVar1, fullVar2;
	
	// make a general match expression for the two variables, with or without something in between
	generalMatch1 = new RegExp("(" + var1 + ")" + ".*" + "(" + var2 + ")");	
	generalMatch2 = new RegExp("(" + var2 + ")" + ".*" + "(" + var1 + ")");
	
	// specify each variable
		// it is a group
		// it is preceded by either | or & (operation) OR start of string
		// it is proceeded by either | or & (operation) OR end of string
		
	if (generalMatch1.test(expression)) {
		fullVar1 = new RegExp("((" + operation + "|^)(" + var1.replace(/[\(\)\|\&]/g, "\\$&") + ")(" + operation + "|$))");
		fullVar2 = new RegExp("((" + operation + "|^)(" + var2.replace(/[\(\)\|\&]/g, "\\$&") + ")(" + operation + "|$))");
	}
	else if (generalMatch2.test(expression)) {
		fullVar1 = new RegExp("((" + operation + "|^)(" + var2.replace(/[\(\)\|\&]/g, "\\$&") + ")(" + operation + "|$))");
		fullVar2 = new RegExp("((" + operation + "|^)(" + var1.replace(/[\(\)\|\&]/g, "\\$&") + ")(" + operation + "|$))");
	}
	else {
		console.log("Called by mistake.");
		return;
	}
	
	// replace var1 with nothing, replace var2 with nothing
	if (fullVar1.exec(expression)[2] === operation || fullVar1.exec(expression)[fullVar1.exec(expression).length] === operation) {
		expression = expression.replace(fullVar1.exec(expression)[1], operation);
	}
	else {
		expression = expression.replace(fullVar1.exec(expression)[1], "");
	}
	
	if (fullVar2.exec(expression)[2] === operation || fullVar2.exec(expression)[fullVar2.exec(expression).length] === operation) {
		expression = expression.replace(fullVar2.exec(expression)[1], operation);
	}
	else {
		expression = expression.replace(fullVar2.exec(expression)[1], "");
	}
	
	// append var1 | var2 to the end of the expression
	if (expression === "") {
		expression = var1 + operation.replace("\\", "") + var2;
	}
	else {
		expression = expression + operation.replace("\\", "") + var1 + operation.replace("\\", "") + var2;
	}
	expression = expression.replace("()","");
	
	return expression;
}

function trappedInBrackets(expression, str1, str2){
	var i, bracketTracker = 0;
	var lowerIndex = Math.min(expression.indexOf(str1) + str1.length, expression.indexOf(str2));
	var higherIndex = Math.max(expression.indexOf(str1) + str1.length, expression.indexOf(str2));

	for (i = lowerIndex; i <= higherIndex; i++) {
		if (i == expression.length)
			break;
		if (expression[i] === '(') {
			bracketTracker++;
		}
		else if (expression[i] === ')') {
			if (bracketTracker == 0) return 1;
			bracketTracker--;
		}
	}
	return bracketTracker;
}

// special case for idempotency to avoid code cloning
// otherwise, the same code would be reused in order to find & simplify idempotency instances
function idemTest(exp){
    //OR test (A|A=A)
	//anything that isn't a non-letter symbol
    var str = /(([A-Z]|[a-z])*\|([A-Z]|[a-z])*)/g;
    var str2 = /([^\(|\)|\&|\||0|1]*\&[^\(|\)|\&|\||\^|0|1]*)/g;
    var result, match;
    var exp2 = exp;
    while((match = str.exec(exp)) != null){
	    // split at operand & compare both sides
        result = match[1].split("|", 2);
        if((result[0] == result[1]) && (result[0] != 0) && (result[0] != null)){
            exp2 = exp.replace(match[1], result[0]);
        }
    }
    //AND test (A&A=A) 
    while(match = str2.exec(exp)){
	    // split at operand & compare both sides
        result = match[1].split("&", 2);
        if((result[0] == result[1]) && (result[0] != 0) && (result[0] != null)){
            exp2 = exp.replace(match[1], result[0]);
        }
    } 
   return exp2;
}

function detectOrder(exp){
    var stack = [];
    var indexCls = [];
    var indexOp = [];
    var open = '('
    var closed = ')'
    var ch;  
    var openCnt = 0;
    var closedCnt = 0;
    var diff;
    var bracket;
    for(var i = 0; i < exp.length; i++){
        ch = exp[i];
        // add open bracket to stack
        if((ch == open) && (exp[i+1] != '1')){
            stack.push(openCnt);
            indexCls.push(1);
            indexOp.push(i);
            openCnt++;
        }
        // add closed bracket to stack
        else if((ch == closed) && (exp[i-2] + exp[i-1] != '(1')){
            closedCnt++;
            bracket = stack.pop();
            indexCls[bracket] = i;
            
        }
        
    }
    // return indices of closed and open brackets
    var par = {'indexCls':indexCls, 'indexOp':indexOp};
    return par;
    
}

//call from detectSimp?
function simplify(exp, code, oper){
    var newExp = exp;
    var str, str2;
    switch(code){
        case rules.IDENTITY:
            //A|0 = A
            if(oper == op.OR){
                str = /(\|0)|(0\|)/g;
            }
            //A&1 = A
            else if(oper == op.AND){
                str = /(\&1)|(1\&)/g;
            }
            newExp = exp.replace(str, "");
            return newExp;
        case rules.NULL_ELEMENT:
            //A|1 = 1
            if(oper == op.OR){
                newExp = "1";
            } 
            //A&0 = 0 
            else if(oper == op.AND){
				// something & 0
                str = /(([A-Z]|[0-1]|\(|\))\&0)|(0\&([A-Z]|[0-1]|\(|\)))/g;
                if(str.test(exp))
                    newExp = exp.replace(str, "0");
                }

            return newExp;
        case rules.COMPLEMENTS:
            //A|~A = 1
            if(oper == op.OR) {
				str = /([A-Z])\|\~\1/g;
				newExp = exp.replace(str, "0");
			}
            //A&~A = 0 or ~A&A = 0
            else if(oper == op.AND) {
                str = /([A-Z])\&\~\1/g;
				str2 = /\~([A-Z])\&\1/g;
				if (str.test(exp)) {
					newExp = exp.replace(str, "0");
				}
				else if (str2.test(exp)) {
					newExp = exp.replace(str2, "0");
				}
			}
			return newExp;
        case rules.DISTRIBUTIVITY:
			//A|(B&C) = (A|B)&(A|C)
            if(oper == op.OR) {
				str = /([A-Z])\|\(((?!\1)[A-Z])&((?!\1)(?!\2)[A-Z])\)/;
                newExp = exp.replace(str, "(" 
				+ str.exec(exp)[1] + "|" 
				+ str.exec(exp)[2] + ")" + "&" + "(" 
				+ str.exec(exp)[1] + "|" 
				+ str.exec(exp)[3] + ")");
			}
            //A&(B|C) = (A&B)|(A&C)
            else if(oper == op.AND) {
				str = /([A-Z])\&\(((?!\1)[A-Z])\|((?!\1)(?!\2)[A-Z])\)/;
                newExp = exp.replace(str, "(" 
				+ str.exec(exp)[1] + "&" 
				+ str.exec(exp)[2] + ")" + "|" + "(" 
				+ str.exec(exp)[1] + "&" 
				+ str.exec(exp)[3] + ")");
			}
			return newExp;
		case rules.COVERING:
			//A|(A&B) = A; or A|(B&A) = A
			str = /([A-Z])\|(\(\1\&((?!\1)[A-Z])\))/;
			str2 = /([A-Z])\|(\(((?!\1)[A-Z])\&\1\))/;
            if (str.test(exp))
				newExp = exp.replace(str, str.exec(exp)[1]);
			else if (str2.test(exp))
				newExp = exp.replace(str2, str2.exec(exp)[1]);
			return newExp;
		case rules.COMBINING:
			//(A&B)|(A&~B) = A
			if(oper == op.OR){
				str = /(\(([A-Z])\&((?!\2)[A-Z])\))\|(\(\2\&\~\3\))/;
			}
			//(A|B)&(A|~B) = A
			else if (oper == op.AND) {
				str = /(\(([A-Z])\|((?!\2)[A-Z])\))\&(\(\2\|\~\3\))/;
			}
            newExp = exp.replace(str, str.exec(exp)[2]); 
			return newExp;
      default:
            return exp;
    }
}

// run SQL query and obtain result set data
function getDBData(req, res, db_conn_info, inputstring) {
  var connection = new Connection(db_conn_info);
  connection.on('connect', function(err) {
    if (err) {
      res.status(400).json({ error: "Invalid service request" });      
      console.log(err)
      return;
    } 
    console.log("SQL query submitted: " + inputstring);
    var request = new Request(inputstring, function(err, rowCount, rows) {
        if(err) {
          res.status(400).json({ error: "Invalid SQL query request" });          
          console.log('Invalid service request');
          connection.close();
          return;
        }
        // log number of rows returned
        console.log(rowCount + ' row(s) returned');
        // process results set data
        var rowarray = [];
        rows.forEach(function(columns){
          var rowdata = new Object();
          columns.forEach(function(column) {
            rowdata[column.metadata.colName] = column.value;
          });
          rowarray.push(rowdata);
        })
        // close the connection and return results set
        connection.close();        
        var ret_value = JSON.stringify(rowarray);
        console.log(ret_value);
        res.end(ret_value);
      }
    );      
    // execute SQL query
    connection.execSql(request); 
   }); 
}
