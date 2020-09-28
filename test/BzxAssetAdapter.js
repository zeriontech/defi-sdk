import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('BzxAssetAdapter');
const TokenAdapter = artifacts.require('BzxTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('BzxAssetAdapter', () => {
  const iDaiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const iEthAddress = '0xb983e01458529665007ff7e0cddecdb74b967eb6';
  const iUSDCAddress = '0x32e4c68b3a4a813b710595aeba7f6b7604ab9c15';
  const iWBTCAddress = '0x2ffa85f655752fb2acb210287c60b9ef335f5b6e';
  const iLENDAddress = '0xab45bf58c6482b87da85d6688c4d9640e093be98';
  const iKNCAddress = '0x687642347a9282be8fd809d8309910a3f984ac5a';
  const iMKRAddress = '0x9189c499727f88f8ecc7dc4eea22c828e6aac015';
  const iLINKAddress = '0x463538705e7d22aa7f03ebf8ab09b067e1001b54';
  const iYFIAddress = '0x7f3fe9d492a9a60aebb06d82cba23c6f32cad10b';
  const iUSDTAddress = '0x7e9997a38a439b2be7ed9c9c4628391d3e055d48';

  // const bzxDaiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
  // const bzxEthAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
  const bzxUSDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  // const bzxWBTCAddress = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
  // const bzxLENDAddress = '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03';
  // const bzxKNCAddress = '0xdd974d5c2e2928dea5f71b9825b8b646686bd200';
  // const bzxMKRAddress = '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2';
  const bzxLINKAddress = '0x514910771AF9Ca656af840dff83E8264EcF986CA';
  // const bzxYFIAddress = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e';
  const bzxUSDTAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

  const testAddress = '0x52ad87832400485de7e7dc965d8ad890f4e82699';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  // const dai = [
  //   bzxDaiAddress,
  //   'Dai Stablecoin',
  //   'DAI',
  //   '18',
  // ];

  const usdc = [
    bzxUSDCAddress,
    'USD Coin',
    'USDC',
    '6',
  ];

  const link = [
    bzxLINKAddress,
    'ChainLink Token',
    'LINK',
    '18',
  ];

  const usdt = [
    bzxUSDTAddress,
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
      ['bZx'],
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
        iDaiAddress,
        iEthAddress,
        iUSDCAddress,
        iWBTCAddress,
        iLENDAddress,
        iKNCAddress,
        iMKRAddress,
        iLINKAddress,
        iYFIAddress,
        iUSDTAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20', 'iToken'],
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
        displayToken(result[0].adapterBalances[0].balances[1].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[2].underlying[0]);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, usdc);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].underlying[0].metadata, link);
        assert.deepEqual(result[0].adapterBalances[0].balances[2].underlying[0].metadata, usdt);
      });
  });
});
