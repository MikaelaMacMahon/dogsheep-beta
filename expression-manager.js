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

        //ENTER SERVER HERE
        procesBoolean(input.expr);
	var result = getResult(input.expr);
        var steps = getSteps(input.expr);
	output.innerHTML += "Result: " + result + "<br>";
	output.innerHTML += "Steps: " + steps + "<br>";
    //clear input textbox
    textbox.value = "";
    
}

//post boolean expression to server
function processBoolean(expr)
{
   jQuery.ajax({
        type: 'POST',
        url: 'http://localhost:8080/api/boolean/simplify/',
        dataType: 'json',
        contentType: "application/json", //content sent from cliet to server
        data: JSON.stringify({expr : '{}'}),
        success: function(){
            console.log('Succesful request');
        },
        error: function(){
            console.log('Request failed');
        }
    });
}

//retrieve result from server
function getResult(expr){
    var result;

    jQuery.ajax({
        type: 'GET',
        url: 'http://localhost:8080/api/boolean/simplify/' + expr + '/result/',
        dataType: 'json',
        contentType: "application/json", //content sent from cliet to server
        data: JSON.stringify({"id" : expr}),
        success: function(){
            console.log('Succesful get request');
            //read result
        },
        error: function(){
            console.log('Get request failed');
        }
    });

    return result;
}

function getSteps(expr){
    var steps;
    
    jQuery.ajax({
        type: 'GET',
        url: 'http://localhost:8080/api/boolean/simplify/' + expr + '/result/',
        dataType: 'json',
        contentType: "application/json", //content sent from cliet to server
        data: JSON.stringify({"id" : expr}),
        success: function(){
            console.log('Succesful get request');
            //read steps
        },
        error: function(){
            console.log('Get request failed');
        }
    });

    return steps;

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


