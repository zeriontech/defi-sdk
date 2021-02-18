const ProtocolAdapter = artifacts.require('ReflexerAssetAdapter');

contract('ReflexerAssetAdapter', () => {
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
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
    await protocolAdapterContract.methods['getBalance(address,address)'](wethAddress, testAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });
});
