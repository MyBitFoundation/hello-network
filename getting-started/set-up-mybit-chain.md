# Set up MyBit Chain

## What is MyBit Chain?

MyBit Chain is a pre-deployed Ethereum blockchain which contains all the core contracts of MyBit Network.  It allows the local development of applications such as our "hello word" on top of MyBit protocol.

It includes the following features:

* **Accounts**: 20 accounts seeded with ~100 Eth each. For convenience, we've included a list of the accounts at [accounts.json](https://github.com/MyBitFoundation/MyBit-Chain.tech/blob/master/accounts.json). All MyBit Network contracts have accounts\[0\] as their platform owner.
* **Contracts**: All MyBit smart contracts pre-deployed in [@mybit/chain ](https://www.npmjs.com/package/@mybit/network-chain)package can be located in [addresses.json](https://github.com/MyBitFoundation/MyBit-Chain.tech/blob/master/addresses.json).

In our "hello world" example, we only need to install MyBit Chain on the terminal as our node.js file has already dependencies to @mybit/network.js ****which requires @mybit/network-chain to run. 

## Why would I use MyBit Chain instead of Ganache?

MyBit Chain runs [Ganache](https://github.com/trufflesuite/ganache-cli) under the hood. The key difference is that MyBit Chain comes with the MyBit smart contracts pre-deployed. So developers can interact with contracts easily without wasting time with chain configuration.

We strongly recommend using MyBit Chain when developing applications on MyBit protocol.

## How do I install MyBit Chain?

Your local MyBit Chain can be easily installed via yarn, using your terminal. To set up all dependencies within your node.js project run:  

First start yarn:

```text
yarn init
```

Point to your hello-network directory:

```text
cd hello-network
```

Then install all MyBit Chain dependencies:

```text
yarn blockchain
```

{% hint style="info" %}
In case you don't have yarn installed and need guidance on how to use it, follow instructions [here](https://www.npmjs.com/package/yarn).
{% endhint %}

### Output expected

You should see the following response. This means you now have a local blockchain running on **port 8545**.

```text
yarn run v1.10.1
$ mybit-network
err null
blockchain { vmErrorsOnRPCResponse: true,
  verbose: false,
  asyncRequestProcessing: false,
  logger: { log: [Function: log] },
  ws: true,
  network_id: 70,
  total_accounts: 20,
  db_path:
   '/Users/williamremor/hello-network/node_modules/@mybit/chain/chain',
  mnemonic:
   'myth like bonus scare over problem client lizard pioneer submit female collect',
  seed: '2MTQ7PAYNl',
  gasPrice: '0x77359400',
  default_balance_ether: 100,
  unlocked_accounts: [],
  hdPath: 'm/44\'/60\'/0\'/0/',
  gasLimit: '0x6691b7',
  defaultTransactionGasLimit: '0x15f90',
  time: null,
  debug: false,
  allowUnlimitedContractSize: false }
```

## **On what port does MyBit Chain run?**

By default, MyBit Chain runs on port 8545.

## **What platforms does MyBit Chain support**

You can use MyBit Chain with any environment \(i.e., macOS, Linux, Windows\).

## Further information

For more information on MyBit Chain, follow [here](https://developer.mybit.io/chain/).
