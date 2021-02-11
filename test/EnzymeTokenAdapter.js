const TokenAdapter = artifacts.require('EnzymeTokenAdapter');

contract('EnzymeTokenAdapter', () => {
  const enzfAddress = '0x9D4Ed905084bbC489a514c75420429C3a246e76d';

  let accounts;
  let tokenAdapter;
  const ENZF = [
    enzfAddress,
    'Cantaloupe',
    'ENZF',
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
    await tokenAdapter.methods['getComponents(address)'](enzfAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](enzfAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, ENZF);
      });
  });
});
