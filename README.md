# SYDE 322 Assignment 1 - DogSheep Beta
## Authors: Daphne Walford (20603000) & Mikaela MacMahon(20601136)


### Description:
DogSheep Beta is an adaption of "WolfRam Alpha" currently designed to accept boolean expression inputs, and simplfy the equations according to a set of common rules. Input can either be recieved as test input, or entered using the provided button interface. Once entered, the expression is validated and reformatted for processing. Equations are processed according to the order-of-operations, where the most internal paraenthese group is processed first, before working its way outward. Several simplification rules can then be iteratively applied to these subsections, to produce a simplified expression. Once simplifed, the modified expressed is then displayed to the user for review. 
### How to Use:
A total of 6 simplifcation rules have been implemented:
* A&1 = A
* A|0 = A
* A&0 = 0
* A|1 = 1
* A&A = A
* A|A = A
These rules can be applied to expression both with an without brackets. Some example use cases, with corresponding output from the program is provided below.

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

Implemented simplifcation rules
Example usage 



#### Limitations



Will only attempt to simplify contents contained in brackets once
Limited to one operand (ie A+A+A might not be processed correctly)

### Future Implementations
Provide user with same expression structure as they provided
