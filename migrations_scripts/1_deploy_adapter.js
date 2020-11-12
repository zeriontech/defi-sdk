const ProtocolAdapter = artifacts.require('ProtocolAdapter');

module.exports = (deployer, network, accounts) => {
  deployer.deploy(ProtocolAdapter, { from: accounts[0] });
};
