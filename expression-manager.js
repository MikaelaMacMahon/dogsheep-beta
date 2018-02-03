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

//define simplification rules
var rules = {"NULL":0, "IDENTITY":1, "NULL_ELEMENT":2, "IDEMPOTENCY":3, "INVOLUTION":4, "COMPLEMENTS":5};

function processInput(){
    //retrieve input text
    var inputEx = textbox.value;
    //check validity of expression
    textbox.value = "WORKS";
   /* if(!checkValidity(inputEx)){
        //return error
        //TODO:: Return notification to user about incorrect format
        return;
    }*/
    detectSimp("AB|(((AB+1)");
    detectSimp("AB|(ABC+1)(ABGHT+1)");
    detectSimp("(AB+1)");
    detectSimp("(TEST + (ABC +1))");
          

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

/*TODO::

  * butto interface (0, 1, A, B..., (), +, -, ~)
  * 5 boolean simplification rules (ie. 1 + A = 1)
        * apply the rules to the input expression
        & = and
        | = or
        ^ = xor
        ~ = NOT
        ()
        > 
        < (shifts)
        in reformat - count number of ands, ors, etc
        treaat every phrase as a tree - ie. & is the parent to children of variables
 
        First five:

        A & ~A = 0
        A&0 = 0
        A&A = A
        A&1 = A
        A|1 = 1
        A|0 = A
        A&B|A&~B = A
 
 */               
function processBool(exp){
    var simplified = false;
    while(!simplified){
    
//        params = detectSimp(exp);
        if(!detectSimp){
             simplified = true;
        }
        
    }
    //operation order of preference: () ~ > & ^ |
    //split on operator - check fo simplification
    //else return
    //identify need for simplification  

}


function detectSimp(exp){
    //locate last internal open bracket
    //set start and end indexes equal if no brackets to replace
    var match = [];
    var str = /(\()/g;
    var test = /\(([^)]+)\)/g;
    var parseData = detectOrder(exp);
    //check outside of brackets
    
    var opnBrkt = exp.search(str);
    console.log(opnBrkt); 
    var matchNum = 0; 
    while((match = str.exec(exp)) != null){
       var sec = exp.slice(match.index);
       var check = /[^\)|\(]*(\+1).*\)/g;
       var check2 = /(\+1?=^\))/g;
       //fix to consider +1 at end of input (ignore stuff in brackets - or only if no closing bracket after) 
       if(check.test(sec)){
            exp = simplify(exp, rules.NULL_ELEMENT, match.index, parseData.index[matchNum]);
            console.log("YAY");
       }
       
       matchNum++;
       
          


       
   }
   return true;

    //regex operations, parse, look for knowns
     //try regex alteration - match compoent before an after
  
}

function detectOrder(exp){
    var stack = [];
    var order = [];
    var index = [];
    var open = '('
    var closed = ')'
    var ch;  
    var openCnt = 0;
    var closedCnt = 0;
    var diff;
    var bracket;
    for(var i = 0; i < exp.length; i++){
        ch = exp[i];
        if(ch == open){
            stack.push(openCnt);
            order.push(1);
            index.push(1);
            openCnt++;

        }
        else if(ch == closed){
            closedCnt++;
            bracket = stack.pop();
            order[bracket] = closedCnt;
            index[bracket] = i;

        }

    }
    console.log(order);
    var par = {'order':order, 'index':index};
    return par;

}



//call from detectSimp?
function simplify(exp, code, startIndex, endIndex){
    var newExp = exp;
    switch(code){
        case rules.IDENTITY:
            //apply identity simp
            break;
        case rules.NULL_ELEMENT:
            // var ind = exp.search(/[^\(]*(\))\w*$/);
            if(startIndex != endIndex){             
               newExp = exp.slice(0,startIndex) + "(1)" + exp.slice(endIndex + 1);
            }
            else{
               newExp = 1;
             }
      
            console.log(newExp);
            return newExp;
            break;
        case rules.IDEMPOTENCY:
            break;
        case rules.INVOLUTION:
            break;
        case rules.COMPLEMENTS:
           break;
      default:
           return exp;
    }
}







