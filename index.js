var Network = require('@mybit/network.js');
var Chain = require('@mybit/network-chain');
var Web3 = require('web3');

(async function() {
//Get a web3 instance which we will make calls to
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

//Ethereum can't handle decimals. So we have to multiply all of our
//token values by the number of decimal places they support. In this case, 18
const decimals = 10**18;

//Our web3 instance provides accounts with Ether and MyB already loaded in wallets
const accounts  = await web3.eth.getAccounts();
//Define the platform owner (accounts[0]) and our first operator (accounts[1])
const [ platformOwner, operatorAddress ] = accounts;
//Get an instance of the API.sol contract. This contract queries the database for
//commonly used values
var api = await Network.api();

//The setOperator function, onboards a new operator from the platform owner account
//The returned operator ID is needed to create a crowdsale
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

//This function creates a crowdsale. If fundingToken is empty, the crowdsale will be
//paid using Ether, otherwise an ERC20 compatible address must be passed.
//In order to avoid revert errors, this function first checks whether a crowdsale
//has be created using the same parameters. If there is already a crowdsale created,
//the function returns the asset ID and token address.
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

//The contribute function allows users to invest in a crowdsale. You must pass
//the asset ID, amount to invest, and the account from which you'll be investing.
//Before any payment is made, this function checks whether the crowdsale is still open.
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

//The generateAsset function allows an owner to generate an asset token that pays
//out dividends to the accounts that passed in the parameters. This is a way to
//create an asset without going through the crowdsale process.
//The generated asset tokens can be made transferable by passing 'true' to the
//_tradeable boolean
//The _addresses and _amounts values take arrays. The arrays must be equal length
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

//Allows an account to create a ERC20 token that pays dividends to the token holders
//The owner of the token has the ability to mint as many tokens as they like to
//any account. By passing an integer value to _initialMinting, they set how many
//tokens they'd like to mint for themselves. The _fundingToken takes the address
//of an ERC20 token they would like to use to pay dividends with.
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

//The createERC20 function creates a standard ERC20 token. This token has no minting
//capabilities, so the value set in the _amount parameter will be the total supply
//of this token. All token are given to the owner to distribute as they see fit.
async function createERC20(_uri, _amount, _account){
  var tokenInstance = await Network.createERC20Token({
    uri: _uri,
    total: _amount,
    owner: _account
  });
  return tokenInstance;
}

//Get an object listing all participants in the asset passed to the function.
async function getAssetParticipants(_assetID){
  var results = {};
  results.operator = await Network.getAssetOperator(_assetID);
  results.manager = await Network.getAssetManager(_assetID);
  results.investors = await Network.getAssetInvestors(_assetID);
  return results;
}

//Get a message on the current progess of a particular crowdsale
async function displayCrowdsaleProgress(_assetID){
  var fundingGoal = await Network.getFundingGoal(_assetID);
  var fundingProgress = await Network.getFundingProgress(_assetID);
  var timeleft = await Network.getFundingTimeLeft(_assetID);
  var message = fundingProgress/decimals + " / " + fundingGoal/decimals + " funded, with " + timeleft + " seconds left to go.";
  console.log(message);
}

//The fundCoffee function shows the flow of how a operator is set, a crowdsale is
//started and funded, and payment is made to the operater. Furthermore, it shows
//how the operater pays back the investment by directly paying the asset token.
//Token holders can then withdraw their dividends using the token's withdraw function.
async function fundCoffee(){
  console.log('');
  console.log('Funding a coffee run with Ether...');
  //Setup operator (who will also be the broker)
  var operatorID = await setOperator("Mac the operator", operatorAddress);

  //Start the crowdsale for 20 cad (0.07 eth), funding length 1 day (86400 seconds)
  var response = await startCrowdsale("CoffeeRun", 70000000000000000, 86400, operatorID, operatorAddress, 0, '');

  //Get the asset ID returned by the startCrowdsale function
  var assetID = response._assetID;
  console.log('Asset ID: ', assetID);

  //Get the token address returned by the startCrowdsale function
  var tokenAddress = response._tokenAddress;
  console.log('Token Address: ', tokenAddress);

  //Instantiate the token using the token address set previously
  var token = await Network.dividendTokenETH(tokenAddress);

  //Display the current crowdsale progress (should show no contributions)
  await displayCrowdsaleProgress(assetID);

  //Get all participants
  //(should only show operater and manager, who are the same person in this case)
  var participants = await getAssetParticipants(assetID);
  console.log('Asset Participants: ', participants);

  //Show current open crowdsales as a list of asset IDs.
  //This crowdsale should be in the list
  var crowdsales = await Network.getOpenCrowdsales();
  console.log('Open crowdsales: ', crowdsales);

  //Check operator's funds before
  var operatorEtherBefore = await web3.eth.getBalance(operatorAddress);

  //accounts[2] contributes 0.03 eth.
  await contribute(assetID, 30000000000000000, accounts[2]);

  //Check funding progess
  var fundingProgress = await Network.getFundingProgress(assetID);
  console.log('Funding progress: ', fundingProgress/decimals);

  //accounts[3] contributes 0.04 eth. (this should complete the crowdsale)
  await contribute(assetID, 40000000000000000, accounts[3]);

  //Check funding progress
  var fundingProgress = await Network.getFundingProgress(assetID);
  console.log('Funding progress: ', fundingProgress/decimals);

  //Check open crowdsales (this crowdsale should no longer be listed)
  var crowdsales = await Network.getOpenCrowdsales();
  console.log('Open crowdsales: ', crowdsales);

  //Check operator's funds after
  var operatorEtherAfter = await web3.eth.getBalance(operatorAddress);
  var operatorDiff = Number(operatorEtherAfter - operatorEtherBefore);
  console.log('Operator Ether received: ', operatorDiff/decimals);

  //Display asset tokens owned by each participant
  console.log('Operator assets: ', Number(await token.balanceOf(operatorAddress)));
  console.log('Investor 1 assets: ', Number(await token.balanceOf(accounts[2]))/decimals);
  console.log('Investor 2 assets: ', Number(await token.balanceOf(accounts[3]))/decimals);

  //Get the ether balances of the investors before any dividends are issued
  var investor1EtherBefore = await web3.eth.getBalance(accounts[2]);
  var investor2EtherBefore = await web3.eth.getBalance(accounts[3]);

  //Issue dividends to the asset token contract
  console.log('Issuing dividends: 0.01 ETH...');
  await Network.issueDividends(assetID, operatorAddress, 10000000000000000);

  //Investors withdraw there dividends
  await token.withdraw({from: accounts[2]});
  await token.withdraw({from: accounts[3]});

  //Check ether after dividends are issued and calculate the difference from before
  var investor1EtherAfter = await web3.eth.getBalance(accounts[2]);
  var investor2EtherAfter = await web3.eth.getBalance(accounts[3]);
  var investor1Diff = Number(investor1EtherAfter - investor1EtherBefore);
  var investor2Diff = Number(investor2EtherAfter - investor2EtherBefore);
  console.log('Investor 1 Ether received: ', investor1Diff/decimals);
  console.log('Investor 2 Ether received: ', investor2Diff/decimals);
}

//This function shows the process by which an asset manager creates a crowdsale
//for an ethereum mining operation. The crowdsale is funded using an ERC20 token
//that represent Dai (the ethereum based stable coin). The asset manager takes a
//small percentage which is paid out using the asset token created during the
//crowdsale.
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

  //Get the asset ID returned by the startCrowdsale function
  var assetID = response._assetID;
  console.log('Asset ID: ', assetID);

  //Get the token address returned by the startCrowdsale function
  var tokenAddress = response._tokenAddress;
  console.log('Token Address: ', tokenAddress);

  //Instantiate the token using the token address set previously
  var token = await Network.dividendTokenERC20(tokenAddress);

  //Three users contribute
  await contribute(assetID, 1000*decimals, accounts[4]);
  console.log('Funding progress: ', Number(await Network.getFundingProgress(assetID))/decimals);
  await contribute(assetID, 1000*decimals, accounts[5]);
  console.log('Funding progress: ', Number(await Network.getFundingProgress(assetID))/decimals);
  await contribute(assetID, 1000*decimals, accounts[6]);
  console.log('Funding progress: ', Number(await Network.getFundingProgress(assetID))/decimals);
  console.log('Manager given dividends to cover their percentage');

  //Display asset tokens owned by participants
  console.log('Manager assets: ', Number(await token.balanceOf(accounts[3]))/decimals);
  console.log('Investor 1: ', Number(await token.balanceOf(accounts[4]))/decimals);
  console.log('Investor 2: ', Number(await token.balanceOf(accounts[5]))/decimals);
  console.log('Investor 3: ', Number(await token.balanceOf(accounts[6]))/decimals);

  //Get dai held by each participant before dividends are issued
  var managerDaiBefore = await dai.balanceOf(accounts[3]);
  var investor1DaiBefore = await dai.balanceOf(accounts[4]);
  var investor2DaiBefore = await dai.balanceOf(accounts[5]);
  var investor3DaiBefore = await dai.balanceOf(accounts[6]);

  //Issue dividends in Dai
  console.log('Issuing dividends: 1000 DAI...');
  await dai.approve(token.address, 1000*decimals, {from: accounts[2]});
  await Network.issueDividends(assetID, accounts[2], 1000*decimals);

  //Withdraw dividends for each participant
  await token.withdraw({from: accounts[3], gas:120000});
  await token.withdraw({from: accounts[4], gas:120000});
  await token.withdraw({from: accounts[5], gas:120000});
  await token.withdraw({from: accounts[6], gas:120000});

  //Calculate and display the differene in Dai before and after dividends are issued
  var managerDaiAfter = await dai.balanceOf(accounts[3]);
  var investor1DaiAfter = await dai.balanceOf(accounts[4]);
  var investor2DaiAfter = await dai.balanceOf(accounts[5]);
  var investor3DaiAfter = await dai.balanceOf(accounts[6]);

  var managerDiff = Number(managerDaiAfter - managerDaiBefore);
  var investor1Diff = Number(investor1DaiAfter - investor1DaiBefore);
  var investor2Diff = Number(investor2DaiAfter - investor2DaiBefore);
  var investor3Diff = Number(investor3DaiAfter - investor3DaiBefore);

  console.log('Manager Dai received: ', managerDiff/decimals);
  console.log('Investor 1 Dai received: ', investor1Diff/decimals);
  console.log('Investor 2 Dai received: ', investor2Diff/decimals);
  console.log('Investor 3 Dai received: ', investor3Diff/decimals);

}

await fundMiningRig();

await fundCoffee();

})();
