import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('KyberAssetAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('KyberAssetAdapter', () => {
  const kncAddress = '0xdd974D5C2e2928deA5F71b9825b8b646686BD200';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let erc20TokenAdapterAddress;
  const knc = [
    kncAddress,
    'Kyber Network Crystal',
    'KNC',
    '18',
  ];
  // const eth = [
  //   ethAddress,
  //   'Ether',
  //   'ETH',
  //   '18',
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
      ['Kyber'],
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
        kncAddress,
        ethAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20'],
      [erc20TokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
  });

  it('should return correct balances', async () => {
    await adapterRegistry.methods['getBalances(address)'](testAddress)
      .call()
      .then((result) => {
        displayToken(result[0].adapterBalances[0].balances[0].base);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, knc);
        assert.equal(result[0].adapterBalances[0].balances[0].underlying.length, 0);
        // displayToken(result[0].adapterBalances[0].balances[1].base);
        // assert.deepEqual(result[0].adapterBalances[0].balances[1].base.metadata, eth);
        // assert.equal(result[0].adapterBalances[0].balances[1].underlying.length, 0);
      });
  });
});
