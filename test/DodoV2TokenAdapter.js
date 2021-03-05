const TokenAdapter = artifacts.require('DodoV2TokenAdapter');

contract('DodoV2TokenAdapter', () => {
  const dvmAddress = '0xEbF6442870FcB5CE60717E712682138DF7aF441a';

  let accounts;
  let tokenAdapter;
  const DVM = [
    dvmAddress,
    'DODO EGGS/DODO Pool',
    'DLP',
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
    await tokenAdapter.methods['getComponents(address)'](dvmAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](dvmAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, DVM);
      });
  });
});
