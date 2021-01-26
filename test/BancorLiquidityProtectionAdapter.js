const ProtocolAdapter = artifacts.require('BancorLiquidityProtectionAdapter');

contract('BancorLiquidityProtectionAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const bntAddress = '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let protocolAdapterContract;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ProtocolAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterContract = result.contract;
      });
  });

  it('should return correct balances for bnt', async () => {
    await protocolAdapterContract.methods['getBalance(address,address)'](bntAddress, testAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });

  it('should return correct balances for eth', async () => {
    await protocolAdapterContract.methods['getBalance(address,address)'](ethAddress, testAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });
});
