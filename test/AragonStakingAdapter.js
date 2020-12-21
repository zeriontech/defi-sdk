import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('AragonStakingAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('AragonStakingAdapter', () => {
  const antAddress = '0x960b236A07cf122663c4303350609A66A7B288C0';
  const uniAntWethAddress = '0xfa19de406e8F5b9100E4dD5CaD8a503a6d686Efe';
  // Random address with positive balance
  const testAddress = '0xbeC73ba0817403cd11C11bE891D671EA30443562';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let erc20TokenAdapterAddress;
  const ant = [
    antAddress,
    'Aragon Network Token',
    'ANT',
    '18',
  ];
  const uniAntWeth = [
    uniAntWethAddress,
    'Uniswap V2',
    'UNI-V2',
    '18',
  ];

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
      ['Aragon'],
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
        antAddress,
        uniAntWethAddress,
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
        displayToken(result[0].adapterBalances[0].balances[1].base);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, ant);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].base.metadata, uniAntWeth);
      });
  });
});
