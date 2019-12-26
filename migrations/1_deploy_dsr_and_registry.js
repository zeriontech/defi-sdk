const DSRWrapper = artifacts.require('DSRWrapper');
const WrapperRegistry = artifacts.require('WrapperRegistry');

module.exports = (deployer, network, accounts) => {
  const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
  const potAddress = '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7';
  deployer.deploy(DSRWrapper, [daiAddress], potAddress, { from: accounts[0] })
    .then(() => deployer.deploy(WrapperRegistry, [DSRWrapper.address], { from: accounts[0] }));
};
