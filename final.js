var Network = require('@mybit/network.js');
var Chain = require('@mybit/chain');
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
    var response = await Network.createAsset(parameters);
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
    var parameters = {
        assetID: _assetID,
        amount: _amount,
        address: _account
    }
    var fundingToken = await api.getAssetFundingToken(_assetID);
    if(fundingToken != '0x0000000000000000000000000000000000000000'){
      var token = await Network.erc20(fundingToken);
      token.approve(Chain.CrowdsaleERC20(), _amount, {from: _account});
      parameters.fundingToken = fundingToken;
    }
    await Network.approveBurn(_account);
    await Network.fundAsset(parameters);
    console.log('Contributed ', _amount/decimals);
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
  console.log('');
  console.log('Funding a coffee run with Ether...');
  //Setup operator (who will also be the broker)
  var operatorID = await setOperator("Mac the operator", operatorAddress);

  //Start the crowdsale for 20 cad (0.07 eth), funding length 1 day (86400 seconds)
  var response = await startCrowdsale("CoffeeRun", 70000000000000000, 86400, operatorID, operatorAddress, 0, '');

  var assetID = response._assetID;
  console.log('Asset ID: ', assetID);

  var tokenAddress = response._tokenAddress;
  console.log('Token Address: ', tokenAddress);

  var token = await Network.dividendTokenETH(tokenAddress);

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
  var operatorEtherBefore = await web3.eth.getBalance(operatorAddress);
  //Two users contribute
  await contribute(assetID, 30000000000000000, accounts[2]);

  var fundingProgress = await Network.getFundingProgress(assetID);
  console.log('Funding progress: ', fundingProgress/decimals);

  await contribute(assetID, 40000000000000000, accounts[3]);

  var fundingProgress = await Network.getFundingProgress(assetID);
  console.log('Funding progress: ', fundingProgress/decimals);

  var crowdsales = await Network.getOpenCrowdsales();
  console.log('Open crowdsales: ', crowdsales);

  //Check operator's funds after
  var operatorEtherAfter = await web3.eth.getBalance(operatorAddress);
  var operatorDiff = Number(operatorEtherAfter - operatorEtherBefore);
  console.log('Operator Ether received: ', operatorDiff/decimals);

  console.log('Operator assets: ', Number(await token.balanceOf(operatorAddress)));
  console.log('Investor 1 assets: ', Number(await token.balanceOf(accounts[2]))/decimals);
  console.log('Investor 2 assets: ', Number(await token.balanceOf(accounts[3]))/decimals);

  console.log('Issuing dividends: 0.01 ETH...');
  var investor1EtherBefore = await web3.eth.getBalance(accounts[2]);
  var investor2EtherBefore = await web3.eth.getBalance(accounts[3]);

  await Network.issueDividends(assetID, operatorAddress, 10000000000000000);

  await token.withdraw({from: accounts[2]});
  await token.withdraw({from: accounts[3]});

  var investor1EtherAfter = await web3.eth.getBalance(accounts[2]);
  var investor2EtherAfter = await web3.eth.getBalance(accounts[3]);
  var investor1Diff = Number(investor1EtherAfter - investor1EtherBefore);
  var investor2Diff = Number(investor2EtherAfter - investor2EtherBefore);
  console.log('Investor 1 Ether received: ', investor1Diff/decimals);
  console.log('Investor 2 Ether received: ', investor2Diff/decimals);

}

async function fundMiningRig(){
  console.log('');
  console.log('Fund miner using Dai...');
  //Setup operator
  var operatorID = await setOperator("Bespin Cloud Mining", accounts[2]);
  //Asset crowdsale values
  var manager = accounts[3];
  var managerPercent = 2;
  var fundingGoal = 3000*decimals;
  var fundingLength = 2592000;
  var assetURI = "Worker1";

  //First, check if this crowdsale has been run before, if it has,
  //get the erc20 token address that the crowdsale uses. Otherwise,
  //deploy and distribute a new erc20 token.
  var dai;
  var assetID = await api.generateAssetID(manager, fundingGoal, operatorID, assetURI);
  var tokenAddress = await api.getAssetAddress(assetID);
  if(tokenAddress == '0x0000000000000000000000000000000000000000'){
    //No crowdsale has been started
    //Deploy a token that will represent Dai
    dai = await createERC20('Dai', 1000000*decimals, platformOwner);
    //Distribute Dai to all accounts
    for(var i=1; i<accounts.length; i++){
      dai.transfer(accounts[i], 10000*decimals, {from: platformOwner});
    }
  } else {
    var fundingToken = await api.getAssetFundingToken(assetID);
    dai = await Network.erc20(fundingToken);
  }

  //Fund a mining rig

  //Set operator to accept Dai
  var response = await Network.acceptERC20Token(operatorID, dai.address, accounts[2]);
  console.log(response);

  //Start the crowdsale, for 3000 usd (3000 dai), funding length 1 month (2592000 seconds), broker is accounts[3] with a 2% fee
  response = await startCrowdsale(assetURI, fundingGoal, fundingLength, operatorID, manager, managerPercent, dai.address);
  console.log(response);

  var assetID = response._assetID;
  console.log('Asset ID: ', assetID);

  var tokenAddress = response._tokenAddress;
  console.log('Token Address: ', tokenAddress);

  var token = await Network.dividendTokenERC20(tokenAddress);

  //Three users contribute
  await contribute(assetID, 1000*decimals, accounts[4]);
  console.log('Funding progress: ', Number(await Network.getFundingProgress(assetID))/decimals);
  await contribute(assetID, 1000*decimals, accounts[5]);
  console.log('Funding progress: ', Number(await Network.getFundingProgress(assetID))/decimals);
  await contribute(assetID, 1000*decimals, accounts[6]);
  console.log('Funding progress: ', Number(await Network.getFundingProgress(assetID))/decimals);
  console.log('Broker given dividends to cover their percentage');

  console.log('Broker assets: ', Number(await token.balanceOf(accounts[3]))/decimals);
  console.log('Investor 1: ', Number(await token.balanceOf(accounts[4]))/decimals);
  console.log('Investor 2: ', Number(await token.balanceOf(accounts[5]))/decimals);
  console.log('Investor 3: ', Number(await token.balanceOf(accounts[6]))/decimals);

  var brokerDaiBefore = await dai.balanceOf(accounts[3]);
  var investor1DaiBefore = await dai.balanceOf(accounts[4]);
  var investor2DaiBefore = await dai.balanceOf(accounts[5]);
  var investor3DaiBefore = await dai.balanceOf(accounts[6]);

  console.log('Issuing dividends: 1000 DAI...');
  await dai.approve(token.address, 1000*decimals, {from: accounts[2]});
  await Network.issueDividends(assetID, accounts[2], 1000*decimals);

  await token.withdraw({from: accounts[3], gas:120000});
  await token.withdraw({from: accounts[4], gas:120000});
  await token.withdraw({from: accounts[5], gas:120000});
  await token.withdraw({from: accounts[6], gas:120000});

  var brokerDaiAfter = await dai.balanceOf(accounts[3]);
  var investor1DaiAfter = await dai.balanceOf(accounts[4]);
  var investor2DaiAfter = await dai.balanceOf(accounts[5]);
  var investor3DaiAfter = await dai.balanceOf(accounts[6]);

  var brokerDiff = Number(brokerDaiAfter - brokerDaiBefore);
  var investor1Diff = Number(investor1DaiAfter - investor1DaiBefore);
  var investor2Diff = Number(investor2DaiAfter - investor2DaiBefore);
  var investor3Diff = Number(investor3DaiAfter - investor3DaiBefore);

  console.log('Broker Dai received: ', brokerDiff/decimals);
  console.log('Investor 1 Dai received: ', investor1Diff/decimals);
  console.log('Investor 2 Dai received: ', investor2Diff/decimals);
  console.log('Investor 3 Dai received: ', investor3Diff/decimals);

}

await fundMiningRig();

await fundCoffee();

})();
