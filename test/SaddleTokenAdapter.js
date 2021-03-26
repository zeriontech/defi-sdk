const TokenAdapter = artifacts.require('SaddleTokenAdapter');

contract('SaddleTokenAdapter', () => {
  const twrensbtcAddress = '0xC28DF698475dEC994BE00C9C9D8658A548e6304F';
  const tbtcAddress = '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa';
  const wbtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
  const renbtcAddress = '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D';
  const sbtcAddress = '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6';

  let accounts;
  let tokenAdapter;
  const twrensbtc = [
    twrensbtcAddress,
    'Saddle tBTC/WBTC/renBTC/sBTC Pool',
    'saddleTWRenSBTC',
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
    await tokenAdapter.methods['getComponents(address)'](twrensbtcAddress)
      .call()
      .then((result) => {
        assert.equal(result[0][0], tbtcAddress);
        assert.equal(result[1][0], wbtcAddress);
        assert.equal(result[2][0], renbtcAddress);
        assert.equal(result[3][0], sbtcAddress);
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](twrensbtcAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, twrensbtc);
      });
  });
});
