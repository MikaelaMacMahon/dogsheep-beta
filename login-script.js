var btn = document.getElementById("authBtn");
var output = document.getElementById("errorText");
//check for redirect after token expiration
if(redirected()) output.innerHTML = "Sorry your login expired. Please sign back in to access application.";

//error handling for different browsers
btn.addEventListener("click", login);
if(btn.addEventListener){
    btn.addEventListener("click", login);
} else if(btn.attachEvent){
    btn.attachEvent("onclick", login);
}


function login(){
   
    //add encryption in after rerouting
    var usernameBox = document.getElementById("username");
    var passwordBox = document.getElementById("password");
    //var output = document.getElementById("output");
    //encrypting username (other application of encryption)

    //encyrpting password
    var encryptedPassword = hashCode2(passwordBox.value);
    console.log(encryptedPassword);

    authenticateUser(username.value, password.value, encryptedPassword);
	//console.log(hashCode2(pass));
	// if successful, redirect to other page, passing user info
	// if not, don't
}

function redirected(){
    var queryString = decodeURIComponent(window.location.search);
    queryString = queryString.split("=");
    var message = queryString[1];
    if(message =='login_expired') return true;
    else return false;
}
function hashCode2(str){
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);       
		hash = ((hash<<5)-hash)+char;     
		hash = hash & hash; // Convert to 32bit integer
    }
    return hash;

}

//Authenticate user
//TODO:: add output param back in
function authenticateUser(username, password, ePassword)
{
   var input = {};
   var token;
   input['username'] = username;
   input['password'] = ePassword; 
   jQuery.ajax({
        type: 'POST',
        url: 'http://localhost:8080/authenticate/',
        dataType: 'json',
        contentType: "application/json", //content sent from client to server
        data: JSON.stringify(input),
        success: function(res){
            console.log('Authentication succeeded');
            token = JSON.stringify(res['token']);
            token = token.replace(/(\")/gi, "");
            redirect(token);
            //callback to next html
            //begin processing boolean on token retrieval 
            //processBoolean(token, exp, output);
            //return token;

        },
        //authenticate - not an actual
        error: function(){
            //if failed - output failure and clear inputs
            console.log('Post request failed');
            username = "";
            password = "";

            //notify users of failure
            output.innerHTML = 'Authentication Failed: Username or password is incorrect. Please try again.';
        }
    });
}

function redirect(myToken)
{
    jQuery.ajax({
         type: 'GET',
         url: 'http://localhost:8080/',
         contentType: "application/json", //content sent from client to server
         headers : {
            'Authorization': 'Bearer ' + myToken
        },
         success: function(res){
             document.cookie = myToken;
             console.log(document.cookie);
             //document.write(res);

             //TODO:: encrypt token here
             var tokenString = "?token=" + myToken;
             window.location.href = 'page.html' + tokenString; //TODO: pass back url
         },
         //authenticate - not an actual
         error: function(res){
                console.log("Redirect failed");
         }
     });
              //  document.write(JSON.stringify)
}