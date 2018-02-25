//event listeners
var btn = document.getElementById("submitBtn");
//error handling for different browsers
btn.addEventListener("click", processInput);
if(btn.addEventListener){
    btn.addEventListener("click", processInput);
} else if(btn.attachEvent){
    btn.attachEvent("onclick", processInput);
}


//add enter button
var textbox = document.getElementById("expr");
textbox.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("submitBtn").click();
    }
});

var keys = ["addVar", "&", "|", "clear", "back", 
            "~", "nand", "nor", "(", ")",
            "xor", "xnor", "+", "-",
            "sll", "srl", "rol", "ror", "*", "/",
            "0", "1", "2", "^", "&#8730", 
            "3", "4", "5", "x", "y",
            "6", "7", "8", "{", "}",
            "9", ","];

var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
//define simplification rules
var rules = {"NULL":0, "IDENTITY":1, "NULL_ELEMENT":2, "IDEMPOTENCY":3, "COMPLEMENTS":4, "DISTRIBUTIVITY":5, "COVERING":6, "COMBINING":7};

var op = {"NULL":0, "AND": 1, "OR":2};

function inputChar(keyIn) {
    var textbox = document.getElementById("expr");
    var letters;
    if (keyIn == 0) {
        // extract letters
        letters = textbox.value.replace(/[^A-Za-z]/g, "");
        if (letters == "") {
            textbox.value = "A";
            return;
        }
        // alphabetise letters
        letters = letters.toUpperCase().split('').sort().join('');
        // get index of letter alphabetically after last letter
		if (letters.substr(letters.length-1) == "Z") {
		    textbox.value += "Z";
		}
		else {
            textbox.value += alphabet[alphabet.indexOf(letters.substr(letters.length-1))+1];
		}
        return;
    }
    else if (keyIn == 3) {
        textbox.value = null;
        return;
    }
    else if (keyIn == 4) {
        textbox.value = textbox.value.slice(0, -1);
        return;
    }
    
    // whenever calculator button is clicked
    else {
        textbox.value += keys[keyIn];
        return;
    }
}

function processInput(){
    //retrieve input text
    var textbox = document.getElementById("expr");
    var output = document.getElementById("output");
    var input = {expr:textbox.value, exprArr:[], errorStatus:0, type:null};
	var origInput = input.expr;
	output.innerHTML = "";
    testAPI();
    //check validity of expression
    checkValidity(input);
    if (input.errorStatus) {
        switch(input.errorStatus) {
            case 1: {
            // tell them that it is an empty string
            output.innerHTML = "Input field empty.";
            return;
            }
            case 2: {
            //tell them that expression cannot include characters other than...
            output.innerHTML = "Input cannot include characters other than letters, 0, 1, ', ~, |, +, *, &, space, and ^.";
            return;
            }
        }
    }
    console.log("Before formatting: " + input.expr);
	// remove spaces
    input.expr = input.expr.replace(/\s/g, "");
     console.log("Spaces removed: " + input.expr);
    // replace AND, OR, and NOT with symbols
    formatExpr(input);
	if (input.errorStatus == 3) {
		output.innerHTML = "Somewhere, an apostrophe is placed after a character that is neither a variable, nor an apostrophe, nor a closing parenthesis.";
        return;
	}
	output.innerHTML += "Initial input: " + origInput + "<br>";
    output.innerHTML += "Formatted: " + input.expr + "<br>";
	input.expr = processBool(input.expr);
    
	output.innerHTML += "Result: " + input.expr + "<br>";
	
    //clear input textbox
    textbox.value = "";
    
}

function testAPI(){
    jQuery.ajax({
        type: 'POST',
        url: 'http://localhost:8080/api/boolean/simplify/',
        dataType: 'json',
        contentType: "application/json", //content sent from cliet to server
        data: JSON.stringify({"AB|A" : '{}'}),
        success: function(){
            console.log('Succesful request');
        },
        error: function(){
            console.log('Request failed');
        }
    });

    jQuery.ajax({
        type: 'GET',
        url: 'http://localhost:8080/api/boolean/simplify/AB|A/',
        dataType: 'json',
        contentType: "application/json", //content sent from cliet to server
        data: JSON.stringify({"id" : '{AB|A}'}),
        success: function(){
            console.log('Succesful get request');
        },
        error: function(){
            console.log('Get request failed');
        }
    });


    return;

}


function checkValidity(input){
    //check if it's empty
	if (input.expr == "") {
		input.errorStatus = 1;
		return;
	}
	else if (input.expr.match(/[^A-Za-z0-1\^\&\|\+\'\~\* \(\)]/g)) {
		input.errorStatus = 2;
		return;
	}
    return;
}

function formatExpr(input){
	console.log("formatting");
	for (var i = 0; i < alphabet.length; i++) {
		input.expr = input.expr.split(alphabet[i].toLowerCase()).join(alphabet[i]);
	}
	console.log(input.expr);
	console.log("after uppercase: " + input.expr);
	input.expr = input.expr.replace(/AND/g,"&");
	input.expr = input.expr.replace(/\*/g,"&");
	input.expr = input.expr.replace(/OR/g,"|");
	input.expr = input.expr.replace(/\+/g,"|");
	input.expr = input.expr.replace(/NOT/g,"~");
	insertAnds(input);
	console.log(input.expr);
	removeDoubleNegatives(input);
	apostrophesToTildes(input);
	return input.expr;
}

function isLetter(character){
	var isALetter = /([A-Z])/g;
	return isALetter.test(character);
}

function insertAnds(input){
	var arrayOfChecks = [
		/([A-Z])([A-Z])/g,
		/([A-Z])(\()/g,
		/(\))([A-Z])/g
	]
	for (var i = 0; i < 3; i++) {
		while (arrayOfChecks[i].test(input.expr)) {
			input.expr = input.expr.replace(arrayOfChecks[i],'$1&$2');
		}
	}
}

function removeDoubleNegatives(input) {
	input.expr = input.expr.replace(/\'\'/g, "");
}

function apostrophesToTildes(input) {
	var bracketIndex, i, j;
	input.exprArray = input.expr.split("");
	// loop through and find all instances of apostrophes
	for (i = 0; i < input.expr.length; i++) {
		// when you find an apostrophe
		if (input.exprArray[i] === '\'') {
			// if apostrophe directly after a letter			
			if (isLetter(input.exprArray[i - 1])) {
				// shuffle the letter forward
				input.exprArray[i] = input.exprArray[i - 1];
				// place the tilde before the letter 
				input.exprArray[i - 1] = '~';
			}
			// if apostrophe directly after a closing parenthesis
			else if (input.exprArray[i - 1] === ')') {
				// find opening parenthesis
				bracketIndex = findOtherBracket(input.exprArray, i - 1);
				// shuffle parentheses & content forward by one
				for (j = i - 1; j >= bracketIndex; j--) {
					input.exprArray[j + 1] = input.exprArray[j];
				}
				// replace the apostrophe with a tilde
				input.exprArray[bracketIndex] = '~';
			}
			else {
				input.errorStatus = 3;
				return;
			}
		}
		input.expr = input.exprArray.join('');
	}
}

function findOtherBracket(arr, curBracketIndex) {
	var i;
	// increment trackOtherPairs when you find an opening parenthesis & decrement when you find a closing one
	var trackOtherPairs = 0;
	if (arr[curBracketIndex] === '(') {
		// iterate forward through the string to find closing parenthesis
		for (i = curBracketIndex + 1; i < arr.length; i++) {
			if (arr[i] === '(')
				trackOtherPairs++;
			if (arr[i] === ')') {
				if (trackOtherPairs)
					trackOtherPairs--;
				else return i;
			}
		}
	}
	else if (arr[curBracketIndex] === ')') {
		// iterate backward through the string to find opening parenthesis
		for (i = curBracketIndex - 1; i >= 0; i--) {
			if (arr[i] === '(') {
				if (trackOtherPairs) {
					trackOtherPairs++;
				}
				else return i;
			}
			if (arr[i] === ')') {
				trackOtherPairs--;
			}
		}
	}
}

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
