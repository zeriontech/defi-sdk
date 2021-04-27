const TokenAdapter = artifacts.require('BalancerV2TokenAdapter');

contract('BalancerV2TokenAdapter', () => {
  const b50Wbtc50WethAddress = '0x0297e37f1873D2DAb4487Aa67cD56B58E2F27875';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const wbtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

  let accounts;
  let tokenAdapter;
  const b50Wbtc50Weth = [
    b50Wbtc50WethAddress,
    'Balancer 50 WBTC 50 WETH',
    'B-50WBTC-50WETH',
    '18',
  ];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    await TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapter = result.contract;
      });
  });

  it('should return correct components', async () => {
    await tokenAdapter.methods['getComponents(address)'](b50Wbtc50WethAddress)
      .call()
      .then((result) => {
        assert.equal(result[0][0], wbtcAddress);
        assert.equal(result[1][0], wethAddress);
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](b50Wbtc50WethAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, b50Wbtc50Weth);
      });
  });
});
