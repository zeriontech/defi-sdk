const DSRAdapter = artifacts.require('DSRAdapter');
const SynthetixAdapter = artifacts.require('SynthetixAdapter');
const CurveAdapter = artifacts.require('CurveAdapter');
const AdapterRegistry = artifacts.require('AdapterRegistry');

module.exports = (deployer, network, accounts) => {
  const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
  const snxAddress = '0x7cB89c509001D25dA9938999ABFeA6740212E5f0';
  const susdAddress = '0x289e9a4674663decEE54f781AaDE5327304A32f8';
  const ssTokenAddress = '0x3740fb63ab7a09891d7c0d4299442A551D06F5fD';

  deployer.deploy(DSRAdapter, { from: accounts[0] })
    .then(() => deployer.deploy(SynthetixAdapter, { from: accounts[0] })
      .then(() => deployer.deploy(CurveAdapter, { from: accounts[0] })
        .then(() => deployer.deploy(
          AdapterRegistry,
          [DSRAdapter.address, SynthetixAdapter.address, CurveAdapter.address],
          [[daiAddress], [snxAddress, susdAddress], [ssTokenAddress]],
          { from: accounts[0] },
        ))));
};
