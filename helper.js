const Network = require('@mybit/network.js');

class Helper {
  constructor() {
    this.startAPI();
  }
  async startAPI() {
    this.api = await Network.api()
  }

  async setOperator(_uri, _address, platformOwner){
    //Check if operator is already set
    var id = await this.api.generateOperatorID(_uri);
    var currentAddress = await this.api.getOperatorAddress(id);
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

   async startCrowdsale(_uri, _goal, _timeInSeconds, _operatorID, _managerAddress, _percent, _fundingToken){
  var id = await this.api.generateAssetID(_managerAddress, _goal, _operatorID, _uri);
  var tokenAddress = await this.api.getAssetAddress(id);
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

}

module.exports = new Helper();
