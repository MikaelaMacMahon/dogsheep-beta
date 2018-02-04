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
    var e2 = "AB|(ABC+1)(ABGHT+1)+1" 
    var e3 = "(AB+1)"
    var e4 = "(TEST+(ABC+1))";
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

//TODO:: pass in eqn
function processBool(exp){
    var lowInd, highInd, simExp, len, modExp;
    //check without bracket analysis
    exp = detectSimp(exp, true);
    console.log("WITHOUT B:"  + exp);
    //initiate bracket analysis
    var parseData = detectOrder(exp);
    var maxChecks = parseData.indexOp.length;
    var simplified = false;
    var ctr = 0;
    modExp = exp;
    
    while(!simplified && maxChecks > 0){
        lowInd = parseData.indexOp[maxChecks - 1 - ctr];
        highInd = parseData.indexCls[maxChecks - 1 - ctr];
        console.log(parseData.indexCls);
        console.log(highInd);
        modExp = exp.slice(lowInd + 1, highInd);
        //check no brackets condition
        simExp = detectSimp(modExp, true);
        len = modExp.length - simExp.length;
        console.log("len:" + len);
        if(len != 0) exp = exp.slice(0, lowInd) + simExp + exp.slice(highInd + 1);
        console.log("SimEXP" + simExp);
        console.log("Exp:" + exp);
        
        //update indicies
        if(len != 0){
            for(i = 0; i < maxChecks -1; i++){
                if(parseData.indexOp[i] > highInd){
                    //confirm numbers
                    parseData.indexOp[i] -= (len + 2);
                }
                if(parseData.indexCls[i] > highInd){
                    parseData.indexCls[i] -= (len + 2);
                }
            } 

        }
        ctr++;        
        if(ctr == maxChecks){
             simplified = true;
        }
    }
    //operation order of preference: () ~ > & ^ |
}


function detectSimp(exp, brackets){
    //if(brackets == false){
      //  return;
  //  }
    
    var str = /(\()/g;
    var test_1 = /\(([^)]+1)\)/g;
    //var test_1 = /(\((?!1))/g;
    var test_x = /(\+1)(?!\))/g;
    var test_0 = /\(([^)]+0)\)/g;
    //check for + 1 condition
    //var check2 = /(\+1?=^\))/g;
    var exp2;
    
    //Test for A + 0 condition
    if(test_0.test(exp)){
        exp2 = simplify(exp, rules.IDENTITY);
        return exp2;
    }  
    //Test for A + 1 condition
    else if(test_x.test(exp)){
        exp2 = simplify(exp, rules.NULL_ELEMENT);
        return exp2;
    }
    else return exp;

       
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
        //do 1.1 = 1
        case rules.IDENTITY:
            //B(1) = B



            //B|0 = B

        case rules.NULL_ELEMENT:
            newExp = "1";
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







