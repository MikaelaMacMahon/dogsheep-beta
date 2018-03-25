# SYDE 322 Assignment 1 - DogSheep Beta
## Authors: Daphne Walford (20603000) & Mikaela MacMahon(20601136)


### Description:
DogSheep Beta is an adaption of "Wolfram Alpha" currently designed to accept Boolean expression inputs, and simplify the equations according to a set of common rules. Input can either be received as test input, or entered using the provided button interface. Once entered, the expression is validated and reformatted for processing. To account for the computational requirements of the processing stage, the simplification logic is located on a backend server based on Nodejs. This server interacts with a JSON file for the storage and retrieval of simplified expressions. If an expression has been simplified before, the algorithm will skip the transformation step, before the result is outputed to the user interface.

Equations are processed according to the order of operations, where the most internal parentheses group is processed first, before working outwards. Several simplification rules are then iteratively applied to these subsections, to produce a simplified expression. Once simplified, the modified expressed is then displayed to the user for review. 

### How to Use:
1. Open page.html in a web browser
2. Deploy the server
```
nodejs simplify-server.js
```
or with
```
node simplify-server.js
```

3. Enter expression and retrieve simplified result (and intermediate steps)

## Implementation

### Simplification Rules
A total of 6 simplification rules have been implemented:
* A&1 = A
* A|0 = A
* A&0 = 0
* A|1 = 1
* A&A = A
* A|A = A

These rules can be applied to expressions with and without brackets. Some example use cases, with the corresponding output is provided below:

### Rest API
A rest API it utilized to interface between the frontend and backend. This includes the use of three methods and three endpoints:
#### POST Expression
 - /localhost:8080/api/boolean/simplify
#### Get Steps 
Return simplification steps*
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
In its initial development phase, DogSheep Beta has a few inherent limitations. Currently expression parsing is uni-directional. For example it will simplify (A+1) but not (1+A). The code is also limited to a single operand at time. For example A|A|A would be processed as A|A, and then A|A. Additionally, the contents of each bracket is only simplified once. 

### Future Implementations:
In the future, we can see DogSheep Beta returning Boolean expressions in the same format as the user entered as input (ie. AND vs "&"). We would also like to migrate the expression storage to a database. Within this environment, we could store the results and steps of the simplification process for simple retrieval.


