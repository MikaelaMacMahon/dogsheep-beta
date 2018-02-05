//event listeners
var btn = document.getElementById("submitBtn");
//error handling for different browsers
btn.addEventListener("click", processInput);
if(btn.addEventListener){
    btn.addEventListener("click", processInput);
} else if(btn.attachEvent){
    btn.attachEvent("onclick", processInput);
}


//TODO:: add enter listener

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
	
	// replace AND, OR, and NOT with symbols
	formatExpr(input);
	
	// remove spaces
	input.expr = input.expr.replace(/\s/g, "");

    //clear input textbook
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
	input.expr.replace("AND","&");
	input.expr.replace("OR","|");
	input.expr.replace("NOT","~");
}