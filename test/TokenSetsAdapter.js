import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./TokenSetsAdapter');
const TokenAdapter = artifacts.require('./TokenSetsTokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');

contract('TokenSetsAdapter', () => {
  const ETH12DayEMACrossoverSet = '0x2c5a9980B41861D91D30d0E0271d1c093452DcA5';
  const BTCRangeBoundMinVolatilitySet = '0x81c55017F7Ce6E72451cEd49FF7bAB1e3DF64d0C';

  const wbtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
  const saiAddress = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const eth12 = [
    ETH12DayEMACrossoverSet,
    'ETH 12 EMA Crossover Set',
    'ETH12EMACO',
    '18',
  ];
  const btc = [
    BTCRangeBoundMinVolatilitySet,
    'BTC Min Volatility Set',
    'BTCMINVOL',
    '18',
  ];
  const sai = [
    saiAddress,
    'Sai Stablecoin v1.0',
    'SAI',
    '18',
  ];
  const wbtc = [
    wbtcAddress,
    'Wrapped BTC',
    'WBTC',
    '8',
  ];
  const usdc = [
    usdcAddress,
    'USD//C',
    'USDC',
    '6',
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
      ['TokenSets'],
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
        ETH12DayEMACrossoverSet,
        BTCRangeBoundMinVolatilitySet,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20', 'SetToken'],
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
        displayToken(result[0].adapterBalances[0].balances[0].base);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[1].base);
        displayToken(result[0].adapterBalances[0].balances[1].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[1].underlying[1]);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, eth12);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, usdc);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].base.metadata, btc);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].underlying[0].metadata, sai);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].underlying[1].metadata, wbtc);
      });
  });
});
