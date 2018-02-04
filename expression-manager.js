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
          
    var e1 = "AB|(AB+1)"
    var e2 = "AB|(ABC+1)(ABGHT+1)" 
    var e3 = "(AB + 1)"
    var e4 = "(TEST + (ABC + 1))";
    processBool(e1);
    processBool(e2);
    processBool(e3);
    processBool(e4);

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
//TODO:: pass in eqn
function processBool(exp){
    var simplified = false;
    var parseData = detectOrder(exp);
    var ctr = parseData.indexOp.length;
    var modExp;
    //check all sets of parenthsess
    var maxChecks = parseData.indexOp.length + 1;
    modExp = exp;
    var lowInd, highInd;
    //TODO:: modify so it only checks for parentheses once and adjusts indexes with mods
    while(!simplified){
        lowInd = parseData.indexOp[ctr - 1];
        highInd = parseData.indexCls[ctr - 1];
        modExp = exp.slice(lowInd, highInd);
        //check no brackets condition
        if(ctr == 0){
   //         modExp = detectSimp(0, modExp, false);
        }
        else{
            console.log(modExp);
            var modExp2 = detectSimp(modExp, true);
            console.log(modExp2);
        }
        if(ctr == maxChecks){
             simplified = true;
        }

        ctr++;        
    }
    //operation order of preference: () ~ > & ^ |
}


function detectSimp(exp, brackets){
    //if(brackets == false){
      //  return;
  //  }
    var str = /(\()/g;
    var test = /\(([^)]+1)\)/g;
    var tes2 = /(\((?!1))/g;
    //check for + 1 condition
    var check2 = /(\+1?=^\))/g;
    if(tes2.test(exp)){
        var exp2 = simplify(exp, rules.NULL_ELEMENT);
        console.log("YAY");
        return exp2;
    }
       
}

function detectOrder(exp){
    var stack = [];
    var order = [];
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
        if((ch == open) && (exp[i+1] != '1')){
            stack.push(openCnt);
            order.push(1);
            indexCls.push(1);
            indexOp.push(i);
            openCnt++;

        }
        else if((ch == closed) && (exp[i-2] + exp[i-1] != '(1')){
            closedCnt++;
            bracket = stack.pop();
            order[bracket] = closedCnt;
            indexCls[bracket] = i;

        }

    }
    //may want to know order in the future?
    var par = {'order':order, 'indexCls':indexCls, 'indexOp': indexOp};
    return par;

}



//call from detectSimp?
function simplify(exp, code){
    var newExp = exp;
    switch(code){
        case rules.IDENTITY:
            //apply identity simp
            break;
        case rules.NULL_ELEMENT:
            // var ind = exp.search(/[^\(]*(\))\w*$/);
            /*if(startIndex != endIndex){             
                console.log("Exp" + endIndex);
                newExp = exp.slice(0,startIndex) + "1" + exp.slice(endIndex + 1);
            }
            else{
               newExp = 1;
             }*/
            newExp = 1;
      
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







