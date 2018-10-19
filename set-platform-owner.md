# Set platform owner

## Who is the platform owner and does he do?

The platform owner is the entity responsible for running the distributed wealth application using MyBit protocol. In reality, the platform owner is responsible for adding operators to the platform and setting high level upgrades and changes to the platform. 

In our "hello world" example, we basically set the address of the platform owner and use it to [add an operator](https://developer.mybit.io/hello-network/untitled#set-the-operator) to the platform. 

For more information on platform owners, see [roles in the MyBit network SDK](https://developer.mybit.io/network/#roles).

## Setting the platform owner

### Get list of accounts  {#get-list-of-accounts}

Set a `const` to get a list of accounts controlled by the node. It uses the Web3 API to return an array of ethereum addresses.

```javascript
const accounts = await web3.eth.getAccounts()
```

### Assign an account to a platform owner {#assign-an-account-to-an-operator}

Assign the first address in the array to be the platformOwner address. 

```javascript
const [platformOwner, operatorAddress] = accounts
```



###  {#set-the-operator}



