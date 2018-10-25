var Network = require('@mybit/network.js');
var Web3 = require('web3');

(async function() {

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const decimals = 10**18;
const accounts  = await web3.eth.getAccounts();
const [ platformOwner, operatorAddress ] = accounts;
var api = await Network.api();

async function setOperator(_uri, _address){
  //Check if operator is already set
  var id = await api.generateOperatorID(_uri);
  var currentAddress = await api.getOperatorAddress(id);
  if(currentAddress == '0x0000000000000000000000000000000000000000'){
    //If not set
    id = await Network.addOperator(
      _address,
      _uri,
      platformOwner
    );

    await Network.acceptEther(id, _address);
  } else {
    console.log('Operator already set')
  }
  console.log('Operator ID: ', id);

  return id;
}

async function startCrowdsale(_uri, _goal, _timeInSeconds, _operatorID, _managerAddress, _percent, _fundingToken){
  var id = await api.generateAssetID(_managerAddress, _goal, _operatorID, _uri);
  var tokenAddress = await api.getAssetAddress(id);

  if(tokenAddress == '0x0000000000000000000000000000000000000000'){
    await Network.approveBurn(_managerAddress);

    var parameters = {
      assetURI: _uri,
      operatorID: _operatorID,
      fundingLength: _timeInSeconds,
      amountToRaise: _goal,
      brokerPercent: _percent,
      broker: _managerAddress
    }
    if(_fundingToken != '' && _fundingToken != '0x0000000000000000000000000000000000000000'){
      parameters.fundingToken = _fundingToken;
    }
    var response = await Network.createAsset({parameters});
  } else {
    var response = {};
    response._assetID = id;
    response._tokenAddress = tokenAddress;
    console.log('Crowdsale already started');
  }

  return response;
}

async function contribute(_assetID, _amount, _account){
  crowdsaleFinalized = await api.crowdsaleFinalized(_assetID);
  if(!crowdsaleFinalized){
    await Network.approveBurn(_account);
    await Network.fundAsset({
        assetID: _assetID,
        amount: _amount,
        address: _account
    });
    console.log('Contributed ', _amount);
  } else {
    console.log('Crowdsale already finished!');
  }
}

//Pass arrays to _addresses and _amounts
async function generateAsset(_uri, _addresses, _amounts, _tradeable) {
  var instance = await Network.assetGenerator();
  var tx;
  if(tradeable){
    tx = await instance.createTradeableAsset(_uri, _addresses, _amounts);
  } else {
    tx = await instance.createAsset(_uri, _addresses, _amounts);
  }
  return tx.logs[0].args
}

async function sellAsset() {

}

async function buyAsset() {

}

async function createDividendToken(_uri, _account, _initialMinting, _fundingToken){
  var parameters = {
    uri: _uri,
    owner: _account
  }
  if(_fundingToken != '' && _fundingToken != '0x0000000000000000000000000000000000000000'){
    parameters.fundingToken = _fundingToken;
  }
  var tokenInstance = await Network.createDividendToken({parameters});
  if(_initialMinting > 0){
    await tokenInstance.mint(_owner, _initialMinting, {from: _owner});
  }
  return tokenInstance;
}

async function createERC20(_uri, _amount, _account){
  var tokenInstance = await Network.createERC20Token({
    uri: _uri,
    total: _amount,
    owner: _account
  });
  return tokenInstance;
}

async function getAssetParticipants(_assetID){
  var results = {};
  results.operator = await Network.getAssetOperator(_assetID);
  results.manager = await Network.getAssetManager(_assetID);
  results.investors = await Network.getAssetInvestors(_assetID);
  return results;
}

async function displayCrowdsaleProgress(_assetID){
  var fundingGoal = await Network.getFundingGoal(_assetID);
  var fundingProgress = await Network.getFundingProgress(_assetID);
  var timeleft = await Network.getFundingTimeLeft(_assetID);
  var message = fundingProgress/decimals + " / " + fundingGoal/decimals + " funded, with " + timeleft + " seconds left to go.";
  console.log(message);
}

async function fundCoffee(){
  //Setup operator (who will also be the broker)
  var operatorID = await setOperator("Mac the operator", operatorAddress);

  //Start the crowdsale
  var response = await startCrowdsale("CoffeeRun", 70000000000000000, 86400, operatorID, operatorAddress, 0, '');

  var assetID = response._assetID;
  console.log('Asset ID: ', assetID);

  var tokenAddress = response._tokenAddress;
  console.log('Token Address: ', tokenAddress);

  token = await Network.dividendTokenETH(tokenAddress);

  await displayCrowdsaleProgress(assetID);

  var participants = await getAssetParticipants(assetID);
  console.log('Asset Participants: ', participants);

  var crowdsales = await Network.getOpenCrowdsales();
  console.log('Open crowdsales: ', crowdsales);

/*
  var operatorAssets = await Network.getAssetsByOperator(operatorAddress);
  console.log('Assets by operator: ', operatorAssets);

  var investorAssets = await Network.getAssetsByInvestor(accounts[3]);
  console.log('Assets by investor: ', investorAssets);

  var managerAssets = await Network.getAssetsByManager(operatorAddress);
  console.log('Assets by manager: ', managerAssets);
*/

  //Check operator's funds before
  console.log('Operator ether before: ', await web3.eth.getBalance(operatorAddress));
  //Two users contribute
  await contribute(assetID, 30000000000000000, accounts[2]);

  var fundingProgress = await Network.getFundingProgress(assetID);
  console.log('Funding progress: ', fundingProgress);

  await contribute(assetID, 40000000000000000, accounts[3]);

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
