const convertToBytes32 = (name) => web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex(name));

export default convertToBytes32;
