# SYDE 322 Assignment 1 - DogSheep Beta
## Authors: Daphne Walford (20603000) & Mikaela MacMahon(20601136)


### Description:
DogSheep Beta is an adaption of "WolfRam Alpha" currently designed to accept Boolean expression inputs, and simplify the equations according to a set of common rules. Input can either be received as test input, or entered using the provided button interface. Once entered, the expression is validated and reformatted for processing. Equations are processed according to the order-of-operations, where the most internal parentheses group is processed first, before working its way outward. Several simplification rules can then be iteratively applied to these subsections, to produce a simplified expression. Once simplified, the modified expressed is then displayed to the user for review. 

### How to Use:
A total of 6 simplification rules have been implemented:
* A&1 = A
* A|0 = A
* A&0 = 0
* A|1 = 1
* A&A = A
* A|A = A

These rules can be applied to expressions with and without brackets. Some example use cases, with the corresponding output is provided below:

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

#### Limitations
In its initial development phase, DogSheep Beta has a few inherent limitations. Currently expression parsing is uni-directional. For example it will simplify (A+1) but not (1+A). The code is also limited to a single operand at time. For example A|A|A would be processed as A|A, and then A|A. Additionally, the contents of each bracket is only simplified once. 

### Future Implementations
In the future, we can see DogSheep Beta returning Boolean expressions in the same format as the user entered as input (ie. AND vs "&"). We would also like to implement bi-directional parsing, and extract the processing step to a backend subsystem. Within this environment, we could extend the simplification process to include more rules, and improve the program's accuracy.


