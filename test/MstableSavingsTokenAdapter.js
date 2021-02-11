const TokenAdapter = artifacts.require('MstableSavingsTokenAdapter');

contract('MstableSavingsTokenAdapter', () => {
  const imUsdAddress = '0x30647a72Dc82d7Fbb1123EA74716aB8A317Eac19';
  const mUsdAddress = '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5';

  let accounts;
  let tokenAdapter;
  const imUSD = [
    imUsdAddress,
    'Interest bearing mUSD',
    'imUSD',
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
    await tokenAdapter.methods['getComponents(address)'](imUsdAddress)
      .call()
      .then((result) => {
        assert.equal(result[0][0], mUsdAddress);
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](imUsdAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, imUSD);
      });
  });
});
