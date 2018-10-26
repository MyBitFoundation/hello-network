module.exports = {
  setOperator: async function setOperator(_uri, _address){
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
}
