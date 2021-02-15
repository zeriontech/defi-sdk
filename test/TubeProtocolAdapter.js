const ProtocolAdapter = artifacts.require('TubeProtocolAdapter');

contract('TubeProtocolAdapter', () => {
  const mustAddress = '0x9C78EE466D6Cb57A4d01Fd887D2b5dFb2D46288f';
  const testAddress = '0x2ed393Dd537Bf9d60D7bB98C67811be135a5f045';

  let accounts;
  let protocolAdapterContract;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ProtocolAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterContract = result.contract;
      });
  });

  it('should return correct balances for must', async () => {
    await protocolAdapterContract.methods['getBalance(address,address)'](mustAddress, testAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });
});
