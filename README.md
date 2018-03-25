# SYDE 322 Assignment 1 - DogSheep Beta
## Authors: Daphne Walford (20603000) & Mikaela MacMahon(20601136)


### Description:
DogSheep Beta is an adaption of "Wolfram Alpha" currently designed to accept Boolean expression inputs, and simplify the equations according to a set of common rules. Input can either be received as test input, or entered using the provided button interface. Once entered, the expression is validated and reformatted for processing. To account for the computational requirements of the processing stage, the simplification logic is located on a backend server based on Nodejs. This server interacts with a JSON file for the storage and retrieval of simplified expressions. If an expression has been simplified before, the algorithm will skip the transformation step, before the result is outputed to the user interface.

Equations are processed according to the order of operations, where the most internal parentheses group is processed first, before working outwards. Several simplification rules are then iteratively applied to these subsections, to produce a simplified expression. Once simplified, the modified expressed is then displayed to the user for review. 

### How to Use:
1. Install dependencies
```
npm install express
npm install body-parser
npm install passport-local-roles
npm install passport
npm install passport-local
npm install jsonwebtoken
npm install express-jwt
npm install crypto-js
```
2. Open page.html in a web browser
3. Deploy the server
```
nodejs simplify-server.js
```
or
```
node simplify-server.js
```
4. Enter credentials 
There are two users that correspond to:
* username: bob, password: 42 (basic user)
* username: jake, password: 43 (premium user (has access to simplification steps))

5. Enter expression and retrieve simplified result (and intermediate steps if a premium user)

## Implementation

### Simplification Rules
Several simplification rules have been implemented, with a few examples shown below:
* A&1 = A
* A|0 = A
* A&0 = 0
* A|1 = 1
* A&A = A
* A|A = A

These rules can be applied to expressions with and without brackets. 

### Authentication
There are two registerd users: bob and jake. Both are granted different role-based access to features of the application. 
Logins will time out after 10min and redirect to the login page.

### Encryption
The password of the users are encrypted in the login client before being passed to the user. The token (displayed in the URL) is encrypted on the server side before it is passed to the front end. It is also decrypted within each subsequent REST api call to authenticate the user.

### Rest API
A rest API it utilized to interface between the frontend and backend. This includes the use of three methods and three endpoints:
#### POST Authentcation
Get authenticated
 - /localhost:8080/authenticate
#### GET Redirect
Get page.html data and redirect to main page
 - /localhost:8080/authenticate
#### POST Expression
Post expressions
 - /localhost:8080/api/boolean/simplify
#### Get Steps 
Return simplification steps
- /localhost:8080/api/boolean/simplify/:id/steps
#### Get Result
Return result of simplification
- /localhost:8080/api/boolean/simplify/:id/result

* Number of steps is dependent on number of sets of brackets

#### Example Usage:
* AB|(AB|1) = 1
* AB|(ABC|1)(ABGHT|1))|1 = 1
* (AB|1) = 1
* (ABCD|(ABC|1))
* AB|(AB|0) = AB
* AB|(ABC&1)(ABGHT&0) = AB|ABC0 
* (AB|AB) = (AB)
* (ABCD|(ABC|0)) = (ABCD|ABC)
* (ABCD&ABCD) = (ABCD)

#### Limitations:
In its initial development phase, DogSheep Beta has a few inherent limitations. This includes the hard coding of users - and the lack of registration option.

### Future Implementations:
In the future, we can see DogSheep Beta returning Boolean expressions in the same format as the user entered as input (ie. AND vs "&"). We would also like to add a registration feature.
