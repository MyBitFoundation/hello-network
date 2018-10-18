# Set operator

In this simple "hello world" example we are setting the operator to be the same entity as the broker. In reality, these roles can be played by different entities. See roles in the MyBit network SDK. 

### Get list of accounts 



```javascript
const accounts = await web3.eth.getAccounts()
```

### Assign an account to an operator

```javascript
const [platformOwner, operatorAddress] = accounts
```

### Create operator ID variable 

```javascript
  var operatorID
```

### Set the operator

At this stage, we set an asynchronous `function setOperator()`. It will check whether an operator is already set or not in the platform. First, check the operator is already set: 

```javascript
  //Check if operator is already set
    var operatorURI = 'Mac the Operator';
    var id = await api.generateOperatorID(operatorURI);
    var currentAddress = await api.getOperatorAddress(id);
    if (currentAddress == '0x0000000000000000000000000000000000000000')
```

If all set then:

```javascript
console.log('Operator already set')
```

If the operator is not set, it will add a new operator to the platform, with an associated ID value, by parsing `operatorAddress`, `operatorURI` and `platformOwner`.

```javascript
      //If not set
      id = await Network.addOperator(
        operatorAddress,
        operatorURI,
        platformOwner
      );
```

The application will also make sure the operator accepts to receive payments ether.

```javascript
    await Network.acceptEther(id, operatorAddress);
```

Only the application  returns the set ID value for the operator in the platform. 

```javascript
    return id;
```

Under the hood, setting up the operator involves interacting with `network.js` and the APIs to interact with MyBit SDK contracts.  





Need to explain

* web3
* network.api - node.js library to interact with SDK - var ContractArtifacts.API
* 
