const ProtocolAdapter = artifacts.require('ReflexerDebtAdapter');

contract('ReflexerDebtAdapter', () => {
  const raiAddress = '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919';
  // DSProxy of '0xBd3f90047B14e4f392d6877276d52D0aC59F4CF8'
  const testAddress = '0x3B75d4C34dbf26BA53AeB2220bf8A96C40d6FdC9';

  let accounts;
  let protocolAdapterContract;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ProtocolAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterContract = result.contract;
      });
  });

  it('should return correct balances for weth', async () => {
    await protocolAdapterContract.methods['getBalance(address,address)'](raiAddress, testAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });
});
