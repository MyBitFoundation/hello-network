# Untitled

  
p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica}  
p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica; min-height: 14.0px}  


    operatorID = await setOperator\(\);

    console.log\('Operator ID: ', operatorID\);

    //Start the crowdsale

    var response = await startCrowdsale\(\);

    assetID = response.\_assetID;

    console.log\('Asset ID: ', assetID\);

    var tokenAddress = response.\_tokenAddress;

    console.log\('Token Address: ', tokenAddress\);

    token = await Network.dividendTokenETH\(tokenAddress\);

    var timeleft = await Network.getFundingTimeLeft\(assetID\);

    console.log\('Time left: ', timeleft\);

    var fundingGoal = await Network.getFundingGoal\(assetID\);

    console.log\('Funding goal: ', fundingGoal\);

    var fundingProgress = await Network.getFundingProgress\(assetID\);

    console.log\('Funding progress: ', fundingProgress\);

    var operator = await Network.getAssetOperator\(assetID\);

    console.log\('Asset operator: ', operator\);

    var manager = await Network.getAssetManager\(assetID\);

    console.log\('Asset manager: ', manager\);

    var investors = await Network.getAssetInvestors\(assetID\);

    console.log\('Asset investors: ', investors\);

    //await Network.issueDividends\(assetID, operatorAddress, 1000000000000000\);

    var crowdsales = await Network.getOpenCrowdsales\(\);

    console.log\('Open crowdsales: ', crowdsales\);

    var operatorAssets = await Network.getAssetsByOperator\(operatorAddress\);

    console.log\('Assets by operator: ', operatorAssets\);

    var investorAssets = await Network.getAssetsByInvestor\(accounts\[3\]\);

    console.log\('Assets by investor: ', investorAssets\);

    var managerAssets = await Network.getAssetsByManager\(operatorAddress\);

    console.log\('Assets by manager: ', managerAssets\);

    //Check operator's funds before

    console.log\('Operator ether before: ', await web3.eth.getBalance\(

      operatorAddress\)\);

    //Two users contribute

    await contribute\(accounts\[3\], 30000000000000000\);

    var fundingProgress = await Network.getFundingProgress\(assetID\);

    console.log\('Funding progress: ', fundingProgress\);

    await contribute\(accounts\[4\], 40000000000000000\);

    var fundingProgress = await Network.getFundingProgress\(assetID\);

    console.log\('Funding progress: ', fundingProgress\);

    var crowdsales = await Network.getOpenCrowdsales\(\);

    console.log\('Open crowdsales: ', crowdsales\);

    //Check operator's funds after

    console.log\('Operator ether after: ', await web3.eth.getBalance\(

      operatorAddress\)\);

    console.log\('Operator assets: ', Number\(await token.balanceOf\(

      operatorAddress\)\)\);

    console.log\('Investor 1 assets: ', Number\(await token.balanceOf\(accounts\[

      3\]\)\)\);

    console.log\('Investor 2 assets: ', Number\(await token.balanceOf\(accounts\[

      4\]\)\)\);

    console.log\('Issuing dividends: 0.01 ETH...'\);

    console.log\('Investor 1 ether before: ', await web3.eth.getBalance\(

      accounts\[3\]\)\);

    console.log\('Investor 2 ether before: ', await web3.eth.getBalance\(

      accounts\[4\]\)\);

    await Network.issueDividends\(assetID, operatorAddress, 10000000000000000\);

    console.log\('Dividends Issued...'\);

    await token.withdraw\({

      from: accounts\[3\]

    }\);

    await token.withdraw\({

      from: accounts\[4\]

    }\);

    console.log\('Investor 1 ether after: ', await web3.eth.getBalance\(

      accounts\[3\]\)\);

    console.log\('Investor 2 ether after: ', await web3.eth.getBalance\(

      accounts\[4\]\)\);

```text
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
console.log('Operator ether before: ', await web3.eth.getBalance(
  operatorAddress));
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
console.log('Operator ether after: ', await web3.eth.getBalance(
  operatorAddress));
console.log('Operator assets: ', Number(await token.balanceOf(
  operatorAddress)));
console.log('Investor 1 assets: ', Number(await token.balanceOf(accounts[
  3])));
console.log('Investor 2 assets: ', Number(await token.balanceOf(accounts[
  4])));

console.log('Issuing dividends: 0.01 ETH...');
console.log('Investor 1 ether before: ', await web3.eth.getBalance(
  accounts[3]));
console.log('Investor 2 ether before: ', await web3.eth.getBalance(
  accounts[4]));

await Network.issueDividends(assetID, operatorAddress, 10000000000000000);

console.log('Dividends Issued...');
await token.withdraw({
  from: accounts[3]
});
await token.withdraw({
  from: accounts[4]
});
console.log('Investor 1 ether after: ', await web3.eth.getBalance(
  accounts[3]));
console.log('Investor 2 ether after: ', await web3.eth.getBalance(
  accounts[4]));
```





Need to explain

* web3
* network.api - node.js library to interact with SDK - var ContractArtifacts.API
* 
