const ProtocolAdapterRegistry = artifacts.require('ProtocolAdapterRegistry');
const Core = artifacts.require('Core');
const Router = artifacts.require('Router');
const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');

module.exports = (deployer, network, accounts) => {
  deployer.deploy(ProtocolAdapterRegistry, { from: accounts[0] })
    .then(() => {
      deployer.deploy(Core, ProtocolAdapterRegistry.address, { from: accounts[0] })
        .then(() => {
          deployer.deploy(Router, Core.address, { from: accounts[0] });
        });
    });
  deployer.deploy(TokenAdapterRegistry, { from: accounts[0] });
};
