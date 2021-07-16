const ProtocolAdapter = artifacts.require('LinkswapAdapter');
const TokenAdapter = artifacts.require('UniswapV2TokenAdapter');

contract.only('LinkswapAdapter', () => {
  const lslpYflLink = '0x189A730921550314934019d184EC05726881D481';
  const testAddress = '0x35FC734948B36370c15387342F048aC87210bC22';

  let accounts;
  let protocolAdapterContract;
  let tokenAdapterContract;
  const yflLink = [
    lslpYflLink,
    'YFL/LINK Pool',
    'LSLP',
    '18',
  ];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ProtocolAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterContract = result.contract;
      });
    await TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapterContract = result.contract;
      });
  });

  it('should return correct balances', async () => {
    await protocolAdapterContract.methods['getBalance(address,address)'](lslpYflLink, testAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });

  it('should return correct components', async () => {
    await tokenAdapterContract.methods['getComponents(address)'](lslpYflLink)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapterContract.methods['getMetadata(address)'](lslpYflLink)
      .call()
      .then((result) => {
        assert.deepEqual(result, yflLink);
      });
  });
});
