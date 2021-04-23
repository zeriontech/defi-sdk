const TokenAdapter = artifacts.require('CurveMetapoolTokenAdapter');

contract('CurveMetapoolTokenAdapter', () => {
  const alUSD3CrvAddress = '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c';
  const alUSDAddress = '0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9';

  let accounts;
  let tokenAdapter;
  const alUSD3Crv = [
    alUSD3CrvAddress,
    'Curve.fi Factory USD Metapool: Alchemix USD',
    'alUSD3CRV-f',
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
    await tokenAdapter.methods['getComponents(address)'](alUSD3CrvAddress)
      .call()
      .then((result) => {
        assert.equal(result[0][0], alUSDAddress);
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](alUSD3CrvAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, alUSD3Crv);
      });
  });
});
