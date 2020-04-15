// import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./SynthetixAssetAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');

contract('ERC20TokenAdapter', () => {
  const badAddress = '0x101571584659dC31bF3E3E5E29F55D8BdfBAecEC';
  // const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let erc20TokenAdapterAddress;
  // const bad = [
  //   badAddress,
  //   'Not available',
  //   'N/A',
  //   '0',
  // ];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ProtocolAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterAddress = result.address;
      });
    await ERC20TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        erc20TokenAdapterAddress = result.address;
      });
    await AdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        adapterRegistry = result.contract;
      });
    await adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Mock')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        protocolAdapterAddress,
      ]],
      [[[
        badAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [erc20TokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
  });

  // MUST be non-zero address for test
  // it('should return n/a if symbol or name are not accessible', async () => {
  //   await adapterRegistry.methods.getAdapterBalance(
  //     testAddress,
  //     protocolAdapterAddress,
  //     [badAddress],
  //   )
  //     .call()
  //     .then((result) => {
  //       displayToken(result.balances[0].base);
  //       assert.deepEqual(result.balances[0].base.metadata, bad);
  //       assert.equal(result.balances[0].underlying.length, 0);
  //     });
  // });
});
