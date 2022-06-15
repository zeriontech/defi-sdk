const TokenAdapter = artifacts.require('AngleTokenAdapter');

contract('AngleTokenAdapter', () => {
  const sanUSDC = '0x9C215206Da4bf108aE5aEEf9dA7caD3352A36Dad';

  let accounts;
  let tokenAdapter;
  const sanusdc = [
    sanUSDC,
    'sanUSDC_EUR',
    'sanUSDC_EUR',
    '6',
  ];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    await TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapter = result.contract;
      });
  });

  it('should return correct components', async () => {
    await tokenAdapter.methods['getComponents(address)'](sanUSDC)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](sanUSDC)
      .call()
      .then((result) => {
        assert.deepEqual(result, sanusdc);
      });
  });
});
