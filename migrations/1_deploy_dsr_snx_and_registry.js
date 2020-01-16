const DSRWatcher = artifacts.require('DSRWatcher');
const SynthetixWatcher = artifacts.require('SynthetixWatcher');
const WatcherRegistry = artifacts.require('WatcherRegistry');

module.exports = (deployer, network, accounts) => {
  const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
  const snxAddress = '0xc011a72400e58ecd99ee497cf89e3775d4bd732f';

  deployer.deploy(DSRWatcher, { from: accounts[0] })
    .then(() => deployer.deploy(SynthetixWatcher, { from: accounts[0] })
      .then(() => deployer.deploy(
        WatcherRegistry,
        [DSRWatcher.address, SynthetixWatcher.address],
        [[daiAddress], [snxAddress]],
        { from: accounts[0] },
      )));
};
