const ProtocolAdapter = artifacts.require('CurveVoteEscrowAdapter');

contract('CurveVoteEscrowAdapter', () => {
  const crvAddress = '0xD533a949740bb3306d119CC777fa900bA034cd52';
  const testAddress = '0x91544E0d0ee6361152f06891b52E778B3614d253';

  let accounts;
  let protocolAdapterContract;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    await ProtocolAdapter.new({ from: accounts[0] }).then((result) => {
      protocolAdapterContract = result.contract;
    });
  });

  it('returns the correct balance', async () => {
    await protocolAdapterContract.methods['getBalance(address,address)'](
      crvAddress,
      testAddress,
    )
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });
});
