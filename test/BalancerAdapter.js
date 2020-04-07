import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./BalancerAdapter');
const TokenAdapter = artifacts.require('./BalancerTokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');

contract('BalancerAdapter', () => {
  const wethDai3070PoolAddress = '0x53b89CE35928dda346c574D9105A5479CB87231c';
  const wethMkr2575PoolAddress = '0x987D7Cc04652710b74Fff380403f5c02f82e290a';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const mkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const wethDai3070Pool = [
    wethDai3070PoolAddress,
    '30% WETH + 70% DAI pool',
    'BPT',
    '18',
  ];
  const wethMkr2575Pool = [
    wethMkr2575PoolAddress,
    '75% MKR + 25% WETH pool',
    'BPT',
    '18',
  ];
  const mkr = [
    mkrAddress,
    'Maker',
    'MKR',
    '18',
  ];
  const dai = [
    daiAddress,
    'Dai Stablecoin',
    'DAI',
    '18',
  ];
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
    await ERC20TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        erc20TokenAdapterAddress = result.address;
      });
    await AdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        adapterRegistry = result.contract;
      });
    await adapterRegistry.methods.addProtocols(
      ['Balancer'],
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
        wethDai3070PoolAddress,
        wethMkr2575PoolAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20', 'Balancer pool token'],
      [erc20TokenAdapterAddress, tokenAdapterAddress],
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
        displayToken(result[0].adapterBalances[0].balances[0].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[0].base);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, wethDai3070Pool);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, weth);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[1].metadata, dai);
        displayToken(result[0].adapterBalances[0].balances[1].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[1].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[1].base);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].base.metadata, wethMkr2575Pool);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].underlying[0].metadata, mkr);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].underlying[1].metadata, weth);
      });
  });
});
