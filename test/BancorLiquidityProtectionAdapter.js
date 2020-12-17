const ProtocolAdapter = artifacts.require('BancorLiquidityProtectionAdapter');

contract('BancorLiquidityProtectionAdapter', () => {
  const bntBethPoolAddress = '0xb1CD6e4153B2a390Cf00A6556b0fC1458C4A5533';
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

  it('should return correct balances', async () => {
    await protocolAdapterContract.methods['getBalance(address,address)'](bntBethPoolAddress, testAddress)
      .call()
      .then((result) => {
        console.log(result);
      });
  });
});
