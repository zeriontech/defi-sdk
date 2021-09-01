const TokenAdapter = artifacts.require('UnagiiVaultTokenAdapter');

contract('UnagiiVaultTokenAdapter', () => {
  const uUSDCAddress = '0xBc5991cCd8cAcEba01edC44C2BB9832712c29cAB';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

  let accounts;
  let tokenAdapter;
  const uUSDC = [
    uUSDCAddress,
    'unagii_USD Coin',
    'uUSDC',
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
    await tokenAdapter.methods['getComponents(address)'](uUSDCAddress)
      .call()
      .then((result) => {
        assert.equal(result[0][0], usdcAddress);
        assert.equal(result[0][1], 'ERC20');
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](uUSDCAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, uUSDC);
      });
  });
});
