const TokenAdapter = artifacts.require('AlphaHomoraTokenAdapter');

contract('AlphaHomoraTokenAdapter', () => {
  const ibETHAddress = '0x67B66C99D3Eb37Fa76Aa3Ed1ff33E8e39F0b9c7A';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  let accounts;
  let tokenAdapter;
  const ibETH = [
    ibETHAddress,
    'Interest Bearing ETH',
    'ibETH',
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
    await tokenAdapter.methods['getComponents(address)'](ibETHAddress)
      .call()
      .then((result) => {
        assert.equal(result[0][0], ethAddress);
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](ibETHAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, ibETH);
      });
  });
});
