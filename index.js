var Network = require('.');
var Web3 = require('web3');

(async function() {

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const accounts  = await web3.eth.getAccounts();
const [ platformOwner, operatorAddress ] = accounts;
var api = await Network.api();
var operatorID;
var assetID;

async function setOperator(){
  //Check if operator is already set
  var operatorURI = 'Mac the Operator';
  var id = await api.generateOperatorID(operatorURI);
  var currentAddress = await api.getOperatorAddress(id);
  if(currentAddress == '0x0000000000000000000000000000000000000000'){
    //If not set
    id = await Network.addOperator(
      operatorAddress,
      operatorURI,
      platformOwner
    );

    await Network.acceptEther(id, operatorAddress);
  } else {
    console.log('Operator already set')
  }

  return id;
}

async function startCrowdsale(){
  var id = await api.generateAssetID(operatorAddress, 70000000000000000, operatorID, "CoffeeRun");
  var tokenAddress = await api.getAssetAddress(id);

  if(tokenAddress == '0x0000000000000000000000000000000000000000'){
    await Network.approveBurn(operatorAddress);

    var response = await Network.createAsset({
        assetURI: "CoffeeRun",
        operatorID: operatorID,
        fundingLength: 1000,
        amountToRaise: 70000000000000000, //about $20 CAD
        brokerPercent: 0,
        broker: operatorAddress //operator is also broker
    });
  } else {
    var response = {};
    response._assetID = id;
    response._tokenAddress = tokenAddress;
    console.log('Crowdsale already started');
  }

  return response;
}

async function contribute(account, amount){
  crowdsaleFinalized = await api.crowdsaleFinalized(assetID);
  if(!crowdsaleFinalized){
    await Network.approveBurn(account);
    await Network.fundAsset({
        assetID: assetID,
        amount: amount,
        address: account
    });
    console.log('Contributed ', amount);
  } else {
    console.log('Crowdsale already finished!');
  }

}

async function fundCoffee(){
  //Setup operator (who will also be the broker)
  operatorID = await setOperator();
  console.log('Operator ID: ', operatorID);
  //Start the crowdsale
  var response = await startCrowdsale();
  assetID = response._assetID;
  console.log('Asset ID: ', assetID);
  var tokenAddress = response._tokenAddress;
  console.log('Token Address: ', tokenAddress);
  //Check operator's funds before
  console.log('Operator ether before: ', await web3.eth.getBalance(operatorAddress));
  //Two users contribute
  await contribute(accounts[3], 30000000000000000);
  await contribute(accounts[4], 40000000000000000);
  //Check operator's funds after
  console.log('Operator ether after: ', await web3.eth.getBalance(operatorAddress));
  token = await Network.dividendTokenETH(tokenAddress);
  console.log('Operator assets: ', Number(await token.balanceOf(operatorAddress)));
  console.log('Investor 1 assets: ', Number(await token.balanceOf(accounts[3])));
  console.log('Investor 2 assets: ', Number(await token.balanceOf(accounts[4])));
}

fundCoffee();

})();
