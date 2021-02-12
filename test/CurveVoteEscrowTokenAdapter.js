const TokenAdapter = artifacts.require('CurveVoteEscrowTokenAdapter');

contract.only('CurveVoteEscrowTokenAdapter', () => {
  const CRV_ADDRESS = '0xD533a949740bb3306d119CC777fa900bA034cd52';
  const VE_CRV_ADDRESS = '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2';
  
  let accounts;
  let tokenAdapter;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    await TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapter = result.contract
      });
  });

  it('returns the correct metadata', async () => {
    const expectedMetadata = [
      VE_CRV_ADDRESS,
      "veCRV",
      "veCRV",
      '18'
    ];
    await tokenAdapter.methods['getMetadata(address)'](VE_CRV_ADDRESS)
      .call()
      .then((result) => {
        assert.deepEqual(result, expectedMetadata, 'the metadata should match');
      });
  });

  it('returns the correct underlying components', async () => {
    await tokenAdapter.methods['getComponents(address)'](VE_CRV_ADDRESS)
      .call()
      .then((result) => {
        assert.equal(result[0][0], CRV_ADDRESS);
      });
  });
});