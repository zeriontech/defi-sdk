import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('MelonAdapter');
const TokenAdapter = artifacts.require('MelonTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('MelonProtocolAdapter', () => {
  const MLNAddress = '0xec67005c4e498ec7f55e092bd1d35cbc47c91892';
  const versionAddress = '0x5f9AE054C7F0489888B1ea46824b4B9618f8A711';
  const testAddress = '0xcFC24B3d0fF80D0c3709a634623cC44D340F6Fe1';
  const testFund = '0xFa237DDB98d3250179411DF9D5b08bB09B6d8F0b';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const mkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const kyberAddress = '0xdd974d5c2e2928dea5f71b9825b8b646686bd200';
  const renAddress = '0x408e41876cccdc0f92210600ef50372656052a38';
  const wrappedBTC = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
  const zrxAddress = '0xe41d2489571d322189246dafa5ebde1f4699f498';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const MLN = [
    MLNAddress,
    'Melon Token',
    'MLN',
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
  const usdc = [
    usdcAddress,
    'USD//C',
    'USDC',
    '6',
  ];
  const weth = [
    wethAddress,
    'Wrapped Ether',
    'WETH',
    '18',
  ];
  const zrx = [
    zrxAddress,
    'Token ZRX',
    'ZRX',
    '18',
  ];
  const wbtc = [
    wrappedBTC,
    'Wrapped BTC',
    'WBTC',
    '8'
  ];
  const ren = [
    renAddress,
    'Ren',
    'REN',
    '18'
  ];
  const knc = [
    kyberAddress,
    'Kyber',
    'knc',
    '18'
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
      ['Melon'],
      [[
        'Melon Protocol',
        'Melon Protocol: A Blockchain protocol for digital asset management draft',
        'https://melonport.com/',
        'https://etherscan.io/token/images/melon_28_2.png',
        '0',
      ]],
      [[
        protocolAdapterAddress,
      ]],
      [[[
        MLNaddress,
        MLNAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
        ['ERC20', 'MelonToken'],
      [erc20TokenAdapterAddress, tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
  });

  it('should return correct balances', async () => {
    await adapterRegistry.methods['getBalances(address)'](testFund)
      .call()
      .then((result) => {
        displayToken(result[0].adapterBalances[0].balances[0].base);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[1]);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, wbtc);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[1].metadata, weth);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[3].metadata, mkr);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[3].metadata, zrx);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[3].metadata, ren);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[3].metadata, knc);
      });
  });
});
