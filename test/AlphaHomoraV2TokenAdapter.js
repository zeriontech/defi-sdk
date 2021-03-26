const TokenAdapter = artifacts.require('AlphaHomoraV2TokenAdapter');

contract('AlphaHomoraV2TokenAdapter', () => {
  const ibWethAddress = '0xeEa3311250FE4c3268F8E684f7C87A82fF183Ec1';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  let accounts;
  let tokenAdapter;
  const ibWeth = [
    ibWethAddress,
    'Interest Bearing Ether v2',
    'ibETHv2',
    '8',
  ];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    await TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapter = result.contract;
      });
  });

  it('should return correct components', async () => {
    await tokenAdapter.methods['getComponents(address)'](ibWethAddress)
      .call()
      .then((result) => {
        assert.equal(result[0][0], ethAddress);
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](ibWethAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, ibWeth);
      });
  });
});
