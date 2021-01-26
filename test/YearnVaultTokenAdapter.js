const TokenAdapter = artifacts.require('YearnVaultTokenAdapter');

contract('YearnVaultTokenAdapter', () => {
  const yvUSDCAddress = '0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

  let accounts;
  let tokenAdapter;
  const yvUSDC = [
    yvUSDCAddress,
    'USDC yVault',
    'yvUSDC',
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
    await tokenAdapter.methods['getComponents(address)'](yvUSDCAddress)
      .call()
      .then((result) => {
        assert.equal(result[0][0], usdcAddress);
        assert.equal(result[0][1], 'ERC20');
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](yvUSDCAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, yvUSDC);
      });
  });
});
