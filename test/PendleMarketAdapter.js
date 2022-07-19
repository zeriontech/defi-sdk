import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('PendleMarketAdapter');
const TokenAdapter = artifacts.require('PendleMarketTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('PendleMarketTokenAdapter', () => {
  const ytUSDCMarket = '0x8315BcBC2c5C1Ef09B71731ab3827b0808A2D6bD';
  const ytUSDCAddress = '0xcDb5b940E95C8632dEcDc806B90dD3fC44E699fE';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  // Random address with positive balances
  const testAddress = '0x76A16d9325E9519Ef1819A4e7d16B168956f325F';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const PENDLE_LPT = [
    ytUSDCMarket,
    'YT-aUSDC-29DEC2022/USDC Market',
    'PENDLE-LPT',
    '18',
  ];
  const YT = [
    ytUSDCAddress,
    'YT Aave interest bearing USDC 29DEC2022',
    'YT-aUSDC-29DEC2022',
    '6',
  ];
  const USDC = [
    usdcAddress,
    'USD Coin',
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
      ['Pendle Market'],
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
        ytUSDCMarket,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20', 'PendleMarket LP token'],
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
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, PENDLE_LPT);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, YT);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[1].metadata, USDC);
      });
  });
});
