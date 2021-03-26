const AdapterRegistry = artifacts.require('DodoV2AssetInteractiveAdapter');

module.exports = (deployer, network, accounts) => {
  deployer.deploy(AdapterRegistry, { from: accounts[0] });
};
