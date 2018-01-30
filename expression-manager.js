<script type="text/javascript">

//event listeners
var btn = document.getElementById("submitBtn");
//error handling for different browsers
if(btn.addEventListener){
    btn.addEvenListener("click", processInput);
} else if(btn.attachEvent){
    btn.attachEvent("onclick", processInput);
}

function processInput(){
    //retrieve input text
    var inputEx = 5; //FIX
    //check validity of expression
    if(!checkValidity(inputEx)){
        //return error
        //TODO:: Return notification to user about incorrect format
        return;
     }
     

     //maybe set up a class or some way of tagging an expression (object with type and expression
     //process expressions


}


function checkValidity(){


    return;
}

