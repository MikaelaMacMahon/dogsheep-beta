var btn = document.getElementById("authBtn");
//error handling for different browsers
btn.addEventListener("click", login);
if(btn.addEventListener){
    btn.addEventListener("click", login);
} else if(btn.attachEvent){
    btn.attachEvent("onclick", login);
}


function login(){
   
    var usernameBox = document.getElementById("username");
    var passwordBox = document.getElementById("password");
    //var output = document.getElementById("output");
    //encrypting username (other application of encryption)
    //var encryptedUsername = hashCode2(usernameBox.value);
   // console.log(encryptedUsername);

    //encyrpting password
    //var encryptedPassword = hashCode2(passwordBox.value);
    authenticateUser(username.value, password.value, username, password);
	//console.log(hashCode2(pass));
	// if successful, redirect to other page, passing user info
	// if not, don't
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
function authenticateUser(eUsername, ePassword, username, password)
{
   var input = {};
   var token;
   input['username'] = eUsername;
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
            console.log(token);
            //begin processing boolean on token retrieval 
            //processBoolean(token, exp, output);
            //return token;

        },
        //authenticate - not an actual
        error: function(){
            console.log('Post request failed');
            //if failed - output failure and clear inputs
            username.value = "";
            password.value = "";
        }
    });
}