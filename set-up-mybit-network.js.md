# Set up MyBit network.js

## What is network.js?

A node.js library for interacting with the MyBit Network SDK. It mirrors our Javascript class/API used to interact with the SDK smart contracts \([@mybit/contracts](https://github.com/MyBitFoundation/MyBit-Network.tech)\). 

## Installing Network.js

In our "hello world", network.js is directly installed as a dependent component. To run other examples, install npm package first:  

```text
npm i @mybit/network.js
```

## Importing Network.js

Our "hello world" includes the importing of the network.js package.

If you want to run another example, in your node.js file include network.js using _require_ syntax as: 

```javascript
const Network = require('@mybit/network.js');
```

## Instantiating Network.js

To instantiate network.js MyBit require you to specify a web3 provider. Web3.js is a library with a series modules designed for the ethereum ecosytem. 

There are two ways to instantiate a web3 provider, directly or from the browser's window object. 

 In our "hello world" we are using a direct instantiation as we run network.js in local blockchain. 

**Instantiating the web3 provider directly**

You'll want to instantiate a web3 provider directly if you're:

* running network.js on a backend
* working with a local blockchain

In our local blockchain running "**hello world**" on port 8545, we specify the web3 provider as follows: 

```javascript
const web3 = new Web3(new Web3.providers.HttpProvider(
    "http://localhost:8545"));
```

We then use web3 `const` to get a list ethereum accounts for the operator and platform owner.

```javascript
const accounts = await web3.eth.getAccounts();
```

#### **Pulling the web3 provider off the browser's window object**

Alternatively**,** if the user was interacting with your application via a web3 wallet \(e.g., MetaMask, Coinbase Wallet, etc.\), you could have pulled the web3 provider from the browser's window object and pass that to the account `const`such as: 

```javascript
const web3 = window.web3.currentProvider;
const accounts = await web3.eth.getAccounts();
```

For more information on web3.js follow [here](https://web3js.readthedocs.io/en/1.0/index.html).

**Diving in**

\*\*\*\*

## **More information**

{% embed url="https://developer.mybit.io/web/" %}

## 



