# Example

In this session 

```javascript
operatorID = await setOperator();
console.log('Operator ID: ', operatorID);
```

```javascript
//Start the crowdsale
var response = await startCrowdsale();
```

```javascript
assetID = response._assetID;
console.log('Asset ID: ', assetID);
```

```javascript
var tokenAddress = response._tokenAddress;
console.log('Token Address: ', tokenAddress);
```

```javascript
token = await Network.dividendTokenETH(tokenAddress);
```

### Get functions

```javascript
var timeleft = await Network.getFundingTimeLeft(assetID);
console.log('Time left: ', timeleft);
```

```javascript
var fundingGoal = await Network.getFundingGoal(assetID);
console.log('Funding goal: ', fundingGoal);
```

```javascript
var fundingProgress = await Network.getFundingProgress(assetID);
console.log('Funding progress: ', fundingProgress);
```

```javascript
var operator = await Network.getAssetOperator(assetID);
console.log('Asset operator: ', operator);
```

```javascript
var manager = await Network.getAssetManager(assetID);
console.log('Asset manager: ', manager);
```

```javascript
var investors = await Network.getAssetInvestors(assetID);
console.log('Asset investors: ', investors);
```

```javascript
var crowdsales = await Network.getOpenCrowdsales();
console.log('Open crowdsales: ', crowdsales);
```

```javascript
var operatorAssets = await Network.getAssetsByOperator(operatorAddress);
console.log('Assets by operator: ', operatorAssets);
```

```javascript
var investorAssets = await Network.getAssetsByInvestor(accounts[3]);
console.log('Assets by investor: ', investorAssets);
```

```javascript
var managerAssets = await Network.getAssetsByManager(operatorAddress);
console.log('Assets by manager: ', managerAssets);
```

```javascript
//Check operator's funds before
console.log('Operator ether before: ', await web3.eth.getBalance(
  operatorAddress));
```

```text
//Two users contribute
```

```javascript
await contribute(accounts[3], 30000000000000000);

var fundingProgress = await Network.getFundingProgress(assetID);
console.log('Funding progress: ', fundingProgress);

await contribute(accounts[4], 40000000000000000);

var fundingProgress = await Network.getFundingProgress(assetID);
console.log('Funding progress: ', fundingProgress);
```

```javascript
var crowdsales = await Network.getOpenCrowdsales();
console.log('Open crowdsales: ', crowdsales);
```

```javascript
//Check operator's funds after
console.log('Operator ether after: ', await web3.eth.getBalance(
  operatorAddress));
```

```javascript
console.log('Operator assets: ', Number(await token.balanceOf(
  operatorAddress)));
console.log('Investor 1 assets: ', Number(await token.balanceOf(accounts[
  3])));
console.log('Investor 2 assets: ', Number(await token.balanceOf(accounts[
  4])));
```

```javascript
console.log('Issuing dividends: 0.01 ETH...');
console.log('Investor 1 ether before: ', await web3.eth.getBalance(
  accounts[3]));
console.log('Investor 2 ether before: ', await web3.eth.getBalance(
  accounts[4]));
```

Dividends issuance

```javascript
await Network.issueDividends(assetID, operatorAddress, 10000000000000000);
console.log('Dividends Issued...');
```

```javascript
await token.withdraw({
  from: accounts[3]
});
await token.withdraw({
  from: accounts[4]
});
```

```javascript
console.log('Investor 1 ether after: ', await web3.eth.getBalance(
  accounts[3]));
console.log('Investor 2 ether after: ', await web3.eth.getBalance(
  accounts[4]));
```



