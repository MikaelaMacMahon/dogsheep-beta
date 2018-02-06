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
var rules = {"NULL":0, "IDENTITY":1, "NULL_ELEMENT":2, "IDEMPOTENCY":3, "INVOLUTION":4, "COMPLEMENTS":5};

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
    var input = {expr:textbox.value, errorStatus:0, type:null};
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
            output.innerHTML = "Input cannot include characters other than letters, 0, 1, ', |, +, *, &, space, and ^.";
            return;
            }
        }
    }
     console.log("Before formatting: " + input.expr);
    // replace AND, OR, and NOT with symbols
    input.expr = formatExpr(input);
    console.log("Formatted: " + input.expr);
    // remove spaces
    input.expr = input.expr.replace(/\s/g, "");
     console.log("Spaces removed: " + input.expr);
	input.expr = processBool(input.expr);
    
	output.innerHTML += "Exp: " + input.expr + "<br>";
	
    //clear input textbox
    textbox.value = "";
    
}

function checkValidity(input){
    //check if it's empty
	if (input.expr == "") {
		input.errorStatus = 1;
		return;
	}
	else if (input.expr.match(/[^A-Za-z0-1\^\&\|\+\'\* ]/g)) {
		input.errorStatus = 2;
		return;
	}
    return;
}

function formatExpr(input){
	input.expr = input.expr.replace("AND","&");
	input.expr = input.expr.replace("*","&");
	input.expr = input.expr.replace("OR","|");
	input.expr = input.expr.replace("+","|");
	input.expr = input.expr.replace("NOT","~");
	input.expr = input.expr.replace("'","~");
	return input.expr;
}

function processBool(exp){
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
    var test_0 = /(\|0)(?!\))/g;
	// and 1
    var test_1 = /(\&1)(?!\))/g;
	// or 1
    var test_2 = /(\|1)(?!\))/g;
	// and 0
    var test_3 = /(\&0)(?!\))/g;
    var exp2 = exp;
    
    //Test for A + 0 condition
    if(test_0.test(exp2)){
        exp2 = simplify(exp2, rules.IDENTITY, op.OR);
    }
    //Test for A&1 condition
    if(test_1.test(exp2)){
        exp2 = simplify(exp2, rules.IDENTITY, op.AND);
    }  
    //Test for A + 1 condition
    if(test_2.test(exp2)){
        exp2 = simplify(exp2, rules.NULL_ELEMENT, op.OR);
    }
    //Test for A&0 = 0
    if(test_3.test(exp2)){
        exp2 = simplify(exp2, rules.NULL_ELEMENT, op.AND);
    }
    //idempotency test 
    exp2 = idemTest(exp2);
    
    return exp2;
}

// special case for idempotency to avoid code cloning
// otherwise, the same code would be reused in order to find & simplify idempotency instances
function idemTest(exp){
    //OR test (B|B=B)
	//anything that isn't a non-letter symbol
    var str = /([^\(|\)|\&|\||0|1]*\|[^\(|\)|\&|\||\^|0|1]*)/g;
    var str2 = /([^\(|\)|\&|\||0|1]*\&[^\(|\)|\&|\||\^|0|1]*)/g;
    var result, match;
    var exp2 = exp;
    while(match = str.exec(exp)){
	    // split at operand & compare both sides
        result = match[1].split("|", 2);
        if(result[0] == result[1]){
            exp2 = exp.replace(match[1], result[0]);
        }
        
    }
    //AND test (B&B=B) 
    while(match = str2.exec(exp)){
	    // split at operand & compare both sides
        result = match[1].split("&", 2);
        if(result[0] == result[1]){
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
            //B&1 = B
            if(oper == op.AND){
                str = /\&1/g;
            }
            //B|0 = B
            else if(oper = op.OR){
                str = /\|0/g;
            }
            newExp = exp.replace(str, "");
            return newExp;
        case rules.NULL_ELEMENT:
            //B&0 = 0
            if(oper == op.AND){
				// something & 0
                str = /([^\(|\)|\&|\||\^]*\&0)/g;
                if(str.test(exp))
                    newExp = exp.replace(str, "0"); 
                }
            //B+1 = 1 
            else if(oper == op.OR){
                newExp = "1";
            } 

            return newExp;
        case rules.INVOLUTION:
            // future implementation
            break;
        case rules.COMPLEMENTS:
            // future implementation
            break;
      default:
            return exp;
    }
}