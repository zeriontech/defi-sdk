const TokenAdapter = artifacts.require('OusdTokenAdapter');

contract('OusdTokenAdapter', () => {
  const tokenAddress = '0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86';

  let accounts;
  let tokenAdapter;
  const OUSD = [
    'Origin Dollar',
    'OUSD',
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
    await tokenAdapter.methods['getComponents(address)'](tokenAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](tokenAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, OUSD);
      });
  });
});
