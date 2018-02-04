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

var op = {"NULL":0, "AND": 1, "OR":2};


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
    var e5 = "AB|(AB+0)"
    var e6 = "AB|(ABC&1)(ABGHT&0)" 
    var e7 = "(AB+AB)"
    var e8 = "(TEST+(ABC+0))";
    processBool(e1);
    processBool(e2);
    processBool(e3);
    processBool(e4);
    processBool(e5);
    processBool(e6);
    processBool(e7);
    processBool(e8);

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
    //only if +1 is at the end of a line
    var str = /(\()/g;
    var test_2 = /(\+1)(?!\))/g;
    var test_0 = /(\+0)(?!\))/g;
    var test_1 = /(\&1)(?!\))/g;
    var test_3 = /(\&0)(?!\))/g;
    //var test_4 = /(\&0)(?!\))/g;
    //var test_5 = /(\&0)(?!\))/g;
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
    //TODO:: Consider both directions -> 0&A and A&0
    //Test for A&0 = 0
    if(test_3.test(exp2)){
        exp2 = simplify(exp2, rules.NULL_ELEMENT, op.AND);
    }
    //idempotency test 
    exp2 = idemTest(exp2);
    
    return exp2;

       
}

function idemTest(exp){
    //OR test (B+B=B)
    var str = /([^\(|\)|\&|\||\^|0|1]*\+*[^\(|\)|\&|\||\^|0|1])/g;
    var str2 = /([^\(|\)|\&|\||\^|0|1]*\&*[^\(|\)|\&|\||\^|0|1])/g;
    var test = /([^\(]*\b[a-z]*\+*[a-z]\b*[^\)])/g
    var result, match;
    var exp2 = exp;
    while(match = test.exec(exp)){
        result = match[1].split("+", 2);
        if(result[0] == result[1]){
            exp2 = exp.replace(match[1], result[0]);
        }
      
    } 
    while(match = str2.exec(exp)){
        result = match[1].split("&", 2);
        if(result[0] == result[1]){
            exp2 = exp.replace(match[1], result[0]);
        }
      
    } 
    return exp2;
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
function simplify(exp, code, oper){
    var newExp = exp;
    var str, str2;
    switch(code){
        //do 1.1 = 1
        case rules.IDENTITY:
            //B&1 = B
            if(oper == op.AND){
                str = /\&1/g;
            }
            //B|0 = B
            else if(oper = op.OR){
                str = /\+0/g;
            }
            newExp = exp.replace(str, "");
            return newExp;
        case rules.NULL_ELEMENT:
            //B&0 = 0
            if(oper == op.AND){
                str = /([^\(|\)|\&|\||\^]*\&0)/g; 
                str2 = /(0\&*[^\(|\)|\&|\||\^])/g; 
                if(str.test(exp))
                    newExp = exp.replace(str, "0"); 
                else
                    newExp = exp.replace(str2, "0"); 
            }
            //B+1 = 1 
            else if(oper == op.OR){
                newExp = "1";
            } 

            return newExp;
        case rules.INVOLUTION:
            break;
        case rules.COMPLEMENTS:
           break;
      default:
           return exp;
    }
}







