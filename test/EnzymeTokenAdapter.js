const TokenAdapter = artifacts.require('EnzymeTokenAdapter');

contract.only('PoolTogetherV3TokenAdapter', () => {
  const enzfAddress = '0x9D4Ed905084bbC489a514c75420429C3a246e76d';
  const uniAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const uniDaiWethAddress = '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11';
  const wbtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
  const mlnAddress = '0xec67005c4E498Ec7f55E092bd1d35cbC47C91892';

  let accounts;
  let tokenAdapter;
  const ENZF = [
    enzfAddress,
    'Cantaloupe',
    'ENZF',
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
    await tokenAdapter.methods['getComponents(address)'](enzfAddress)
      .call()
      .then((result) => {
        console.log(result)
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](enzfAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, ENZF)
      });
  });
});
