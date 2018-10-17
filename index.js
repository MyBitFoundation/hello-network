var Network = require('@mybit/network.js');
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
  
  token = await Network.dividendTokenETH(tokenAddress);

  var timeleft = await Network.getFundingTimeLeft(assetID);
  console.log('Time left: ', timeleft);

  var fundingGoal = await Network.getFundingGoal(assetID);
  console.log('Funding goal: ', fundingGoal);

  var fundingProgress = await Network.getFundingProgress(assetID);
  console.log('Funding progress: ', fundingProgress);

  var operator = await Network.getAssetOperator(assetID);
  console.log('Asset operator: ', operator);

  var manager = await Network.getAssetManager(assetID);
  console.log('Asset manager: ', manager);

  var investors = await Network.getAssetInvestors(assetID);
  console.log('Asset investors: ', investors);

  //await Network.issueDividends(assetID, operatorAddress, 1000000000000000);

  var crowdsales = await Network.getOpenCrowdsales();
  console.log('Open crowdsales: ', crowdsales);

  var operatorAssets = await Network.getAssetsByOperator(operatorAddress);
  console.log('Assets by operator: ', operatorAssets);

  var investorAssets = await Network.getAssetsByInvestor(accounts[3]);
  console.log('Assets by investor: ', investorAssets);

  var managerAssets = await Network.getAssetsByManager(operatorAddress);
  console.log('Assets by manager: ', managerAssets);

  //Check operator's funds before
  console.log('Operator ether before: ', await web3.eth.getBalance(operatorAddress));
  //Two users contribute
  await contribute(accounts[3], 30000000000000000);

  var fundingProgress = await Network.getFundingProgress(assetID);
  console.log('Funding progress: ', fundingProgress);

  await contribute(accounts[4], 40000000000000000);

  var fundingProgress = await Network.getFundingProgress(assetID);
  console.log('Funding progress: ', fundingProgress);

  var crowdsales = await Network.getOpenCrowdsales();
  console.log('Open crowdsales: ', crowdsales);

  //Check operator's funds after
  console.log('Operator ether after: ', await web3.eth.getBalance(operatorAddress));
  console.log('Operator assets: ', Number(await token.balanceOf(operatorAddress)));
  console.log('Investor 1 assets: ', Number(await token.balanceOf(accounts[3])));
  console.log('Investor 2 assets: ', Number(await token.balanceOf(accounts[4])));

  console.log('Issuing dividends: 0.01 ETH...');
  console.log('Investor 1 ether before: ', await web3.eth.getBalance(accounts[3]));
  console.log('Investor 2 ether before: ', await web3.eth.getBalance(accounts[4]));

  await Network.issueDividends(assetID, operatorAddress, 10000000000000000);

  console.log('Dividends Issued...');
  await token.withdraw({from: accounts[3]});
  await token.withdraw({from: accounts[4]});
  console.log('Investor 1 ether after: ', await web3.eth.getBalance(accounts[3]));
  console.log('Investor 2 ether after: ', await web3.eth.getBalance(accounts[4]));

}

fundCoffee();

})();
