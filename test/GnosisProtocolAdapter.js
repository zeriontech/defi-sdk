import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('GnosisProtocolAdapter');
const TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('GnosisProtocolAdapter', () => {
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const testAddress = '0x9eabf70538331a6932e0d249d31a5257cee5dd22';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  const weth = [
    wethAddress,
    'Wrapped Ether',
    'WETH',
    '18',
  ];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ProtocolAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterAddress = result.address;
      });
    await TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapterAddress = result.address;
      });
    await AdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        adapterRegistry = result.contract;
      });
    await adapterRegistry.methods.addProtocols(
      ['Gnosis Protocol'],
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
        wethAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20'],
      [tokenAdapterAddress],
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
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, weth);
        assert.equal(result[0].adapterBalances[0].balances[0].underlying.length, 0);
      });
  });
});
