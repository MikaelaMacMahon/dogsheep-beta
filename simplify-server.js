//Rest-based server using Node.js and Express.js


var http = require('http');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    next();
});
//TODO:: add get for first page
app.use(bodyParser.json());
//TODO:: XML parsing error - not well formed (symbol, request, response) slahses?
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
//TODO:: FIGURE OUT IDS
app.get('/api/boolean/simplify/:id/result', (request, response) => {
    console.log("GET request recieved at /api/boolean/simplify/result");
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
        var expDB;
        if(fs.statSync("results.json").size == 0)
        {
            expDB = {}; 

        }
        else{
            expDB = JSON.parse(data);
        }
        //retrieve body of request
        var newExp = request.body;
        console.log(request.body);
        console.log("test");
        //check if already in DB
        if(expDB.hasOwnProperty(newExp)){
            response.end(JSON.stringify(expDB[newExp]));
            console.log("Expression has already been simplified");

            return;
        }     
        //retrieve json simplification results
        var simpResults = processBoolean(newExp);
        console.log("test3");
	console.log(simpResults);
        expDB = Object.assign(expDB, newExp); //add new expression entry FAILS HERE!!!!
        var textResults = JSON.stringify(expDB);
        //TODO:: FIX REQUEST FAILURE
        //do I write text resultsor entire data entry
        console.log("test6");
        fs.writeFileSync(__dirname + "/" + "results.json", textResults);  
        console.log("test5");
        response.end(textResults);
//        response.end();
         
    }catch (error) {
        response.status(400).json({error: "Invalid service request" });
        console.error("Invalid service requeust");
        return;
    }
 });  
})

function processBool(exp){
    var output = document.getElementById("output");
	var lowInd, highInd, simExp, len, modExp;
    //check without bracket analysis
    exp = detectSimp(exp);
    //detect indices of brackets
    var parseData = detectOrder(exp);
    //count how many simplifications you will do (how many sets of brackets there are to process)
    var maxChecks = parseData.indexOp.length;
    var simplified = false;
    var ctr = 0;
    modExp = exp;
    
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
		output.innerHTML += "Step " + ctr + ": " + exp + "<br>";
    }
    //process equation one more time to catch stragglers
    exp = detectSimp(exp);
    //operation order of preference: () ~ > & ^ |
    return exp;
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
    console.log("Entering idempotency"); 
    console.log("ExP" + exp2);
    exp2 = idemTest(exp2);
    
    return exp2;
}
	
// this function rearranges all cases where not-a-number variables are separated with "or"
function placeAtEnd(expression, var1, var2) {
	var generalMatch1, generalMatch2, matchArray, fullVar1, fullVar2;
	
	generalMatch1 = new RegExp("(" + var1 + ")" + ".*" + "(" + var2 + ")");	
	generalMatch2 = new RegExp("(" + var2 + ")" + ".*" + "(" + var1 + ")");

	console.log("new var1: " + var1);
	console.log("new var2: " + var2);
	
	if (generalMatch1.test(expression)) {
		fullVar1 = new RegExp("((\\||^)" + "(" + var1 + ")" + "(\\||$))");
		fullVar2 = new RegExp("((\\||^)" + "(" + var2 + ")" + "(\\||$))");
	}
	else if (generalMatch2.test(expression)) {
		fullVar1 = new RegExp("((\\||^)" + "(" + var2 + ")" + "(\\||$))");
		fullVar2 = new RegExp("((\\||^)" + "(" + var1 + ")" + "(\\||$))");
	}
	else {
		console.log("Called by mistake.");
		return;
	}
	
	// replace var1 with nothing, replace var2 with nothing
	console.log(fullVar1.exec(expression));
	expression = expression.replace(fullVar1.exec(expression)[1], "");
	console.log("after first replacement: " + expression);
	console.log(fullVar2.exec(expression));
	expression = expression.replace(fullVar2.exec(expression)[1], "");
	console.log("after replacement: " + expression);
	
	// append var1 | var2 to the end of the expression
	console.log("expression: " + expression);
	if (expression === "") {
		console.log("o no!");
		expression = var1 + "|" + var2;
	}
	else {
		expression = expression + "|" + var1 + "|" + var2;
	}
	expression = expression.replace("()","");
	console.log("expression: " + expression);
	
	return expression;
}

function trappedInBrackets(expression, str1, str2){
	var i, bracketTracker = 0;
	var lowerIndex = Math.min(expression.indexOf(str1), expression.indexOf(str2));
	var higherIndex = Math.max(expression.indexOf(str1), expression.indexOf(str2));
	for (i = lowerIndex; i < higherIndex; i++) {
		if (expression[i] === '(') {
			bracketTracker++;
		}
		else if (expression[i] === ')') {
			bracketTracker--;
		}
		console.log(bracketTracker);
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
	console.log("beginning of idemtest: " + exp2);
    while((match = str.exec(exp)) != null){
	    // split at operand & compare both sides
		console.log("match[1]: " + match[1]);
        result = match[1].split("|", 2);
		console.log("result: " + result);
		console.log("result[0]: " + result[0]);
	    if(result[0] ==0 || result[0] == null) console.log("IS NULL");
    	console.log("result[1]: " + result[1]);
        if((result[0] == result[1]) && (result[0] != 0) && (result[0] != null)){
			console.log("exp2 before replace: " + exp2);
			console.log("match[1]: " + match[1]);
			console.log("result[0]: " + result[0]);
            exp2 = exp.replace(match[1], result[0]);
			console.log("exp2: " + exp2);
        }
    }
	console.log("after or: " + exp2);
    //AND test (A&A=A) 
    while(match = str2.exec(exp)){
	    // split at operand & compare both sides
        result = match[1].split("&", 2);
        if(result[0] == result[1]){
            exp2 = exp.replace(match[1], result[0]);
        }
    } 
	console.log("after and: " + exp2);
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
            if(oper = op.OR){
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
				newExp = exp.replace(str, "1");
			}
            //A&~A = 0
            else if(oper == op.AND)
                str = /([A-Z])\&\~\1/g;
				newExp = exp.replace(str, "0");
			return newExp;
        case rules.DISTRIBUTIVITY:
			//A|(B&C) = (A|B)&(A|C)
            if(oper == op.OR) {
				str = /([A-Z])\|\(((?!\1)[A-Z])&((?!\1)(?!\2)[A-Z])\)/;
				console.log(str.exec(exp));
                newExp = exp.replace(str, "(" 
				+ str.exec(exp)[1] + "|" 
				+ str.exec(exp)[2] + ")" + "&" + "(" 
				+ str.exec(exp)[1] + "|" 
				+ str.exec(exp)[3] + ")");
			}
            //A&(B|C) = (A&B)|(A&C)
            else if(oper == op.AND) {
				console.log(exp);
				str = /([A-Z])\&\(((?!\1)[A-Z])\|((?!\1)(?!\2)[A-Z])\)/;
				console.log(str.exec(exp));
                newExp = exp.replace(str, "(" 
				+ str.exec(exp)[1] + "&" 
				+ str.exec(exp)[2] + ")" + "|" + "(" 
				+ str.exec(exp)[1] + "&" 
				+ str.exec(exp)[3] + ")");
			}
			return newExp;
		case rules.COVERING:
			//A|(A&B) = A
            if(oper == op.OR)
				
                newExp = exp[0];
			return newExp;
		case rules.COMBINING:
            newExp = exp[1];
			return newExp;
      default:
            return exp;
    }
}
