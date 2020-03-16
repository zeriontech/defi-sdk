const AdapterRegistry = artifacts.require('AdapterRegistry');

module.exports = (deployer, network, accounts) => {
  deployer.deploy(AdapterRegistry, { from: accounts[0] });
};
