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
    var inputEx = textbox.value;
    //check validity of expression
    textbox.value = "WORKS";
    if(!checkValidity(inputEx)){
        //return error
        //TODO:: Return notification to user about incorrect format
        return;
     }
     

    //maybe set up a class or some way of tagging an expression (object with type and expression
    //process expressions

    //clear input textbook
    textbox.value = "";

}


function checkValidity(){

    //check if its empty
    //ok formats include
        // equation form y = A + B
        //just the expression A + B
        //spaces or no spaces - so get rid of them
    //check if "variable" "=" "valid expression"

    return;
}

