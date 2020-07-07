import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('MstableAssetAdapter');
const TokenAdapter = artifacts.require('MstableTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('MstableAssetAdapter', () => {
  const mUsdAddress = '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const tusdAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
  const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const dai = [
    daiAddress,
    'Dai Stablecoin',
    'DAI',
    '18',
  ];
  const usdc = [
    usdcAddress,
    'USD//C',
    'USDC',
    '6',
  ];
  const tusd = [
    tusdAddress,
    'TrueUSD',
    'TUSD',
    '18',
  ];
  const usdt = [
    usdtAddress,
    'Tether USD',
    'USDT',
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
      ['Mstable'],
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
        mUsdAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20', 'Masset'],
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
        displayToken(result[0].adapterBalances[0].balances[0].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[2]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[3]);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, dai);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[1].metadata, usdc);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[2].metadata, tusd);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[3].metadata, usdt);
      });
  });
});
