const TokenAdapter = artifacts.require('MstableTokenAdapter');

contract('MstableTokenAdapter', () => {
  const musdAddress = '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5';
  const mbtcAddress = '0x945Facb997494CC2570096c74b5F66A3507330a1';
  const busdFeederPoolAddress = '0xfE842e95f8911dcc21c943a1dAA4bd641a1381c6';

  let accounts;
  let tokenAdapter;
  const musd = [
    musdAddress,
    'mStable USD',
    'mUSD',
    '18',
  ];
  const mbtc = [
    mbtcAddress,
    'mStable BTC',
    'mBTC',
    '18',
  ];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    await TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapter = result.contract;
      });
  });

  it('should return correct components for musd', async () => {
    await tokenAdapter.methods['getComponents(address)'](musdAddress)
      .call()
      .then((result) => {
        console.log(result);
      });
  });

  it('should return correct components for mbtc', async () => {
    await tokenAdapter.methods['getComponents(address)'](mbtcAddress)
      .call()
      .then((result) => {
        console.log(result);
      });
  });

  it('should return correct components for busd feeder pool', async () => {
    await tokenAdapter.methods['getComponents(address)'](busdFeederPoolAddress)
      .call()
      .then((result) => {
        console.log(result);
      });
  });

  it('should return correct metadata for musd', async () => {
    await tokenAdapter.methods['getMetadata(address)'](musdAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, musd);
      });
  });

  it('should return correct metadata for mbtc', async () => {
    await tokenAdapter.methods['getMetadata(address)'](mbtcAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, mbtc);
      });
  });
});
