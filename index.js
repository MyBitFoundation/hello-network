const Network = require('@mybit/network.js');
const Chain = require('@mybit/chain');
const Web3 = require('web3');
const Helper = require('./helper');

(async function() {

  const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  const decimals = 10**18;
  const accounts  = await web3.eth.getAccounts();
  const [ platformOwner, operatorAddress ] = accounts;
  var api = await Network.api();



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
  var operatorID = await Helper.setOperator("Mac the operator", operatorAddress);

  //Start the crowdsale for 20 cad (0.07 eth), funding length 1 day (86400 seconds)
  var response = await Helper.startCrowdsale(
    "CoffeeRun", 
    70000000000000000, 
    86400, 
    operatorID, 
    operatorAddress, 
    0, 
    ''
  );

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

await fundCoffee();

})();
