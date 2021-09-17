const TokenAdapter = artifacts.require('UnagiiVaultTokenAdapter');

contract('UnagiiVaultTokenAdapter', () => {
  const uDAIV2Address = '0x9ce3018375d305CE3C3303A26eF62D3d2EB8561A';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

  let accounts;
  let tokenAdapter;
  const uDAIV2 = [
    uDAIV2Address,
    'unagii_Dai Stablecoin_v2',
    'uDAIv2',
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
    await tokenAdapter.methods['getComponents(address)'](uDAIV2Address)
      .call()
      .then((result) => {
        assert.equal(result[0][0], daiAddress);
        assert.equal(result[0][1], 'ERC20');
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](uDAIV2Address)
      .call()
      .then((result) => {
        assert.deepEqual(result, uDAIV2);
      });
  });
});
