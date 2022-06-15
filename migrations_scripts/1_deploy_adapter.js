const Adapter = artifacts.require('AngleTokenAdapter');

module.exports = (deployer, network, accounts) => {
  deployer.deploy(Adapter, { from: accounts[0] });
};
