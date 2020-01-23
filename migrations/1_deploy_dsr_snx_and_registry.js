const DSRAdapter = artifacts.require('DSRAdapter');
const SynthetixAdapter = artifacts.require('SynthetixAdapter');
const AdapterRegistry = artifacts.require('AdapterRegistry');

module.exports = (deployer, network, accounts) => {
  const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
  const snxAddress = '0xc011a72400e58ecd99ee497cf89e3775d4bd732f';

  deployer.deploy(DSRAdapter, { from: accounts[0] })
    .then(() => deployer.deploy(SynthetixAdapter, { from: accounts[0] })
      .then(() => deployer.deploy(
        AdapterRegistry,
        [DSRAdapter.address, SynthetixAdapter.address],
        [[daiAddress], [snxAddress]],
        { from: accounts[0] },
      )));
};
