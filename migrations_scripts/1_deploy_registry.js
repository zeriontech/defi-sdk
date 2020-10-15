const ProtocolAdapterRegistry = artifacts.require('ProtocolAdapterRegistry');

module.exports = (deployer, network, accounts) => {
  deployer.deploy(ProtocolAdapterRegistry, { from: accounts[0] });
};
