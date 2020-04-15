import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./CompoundDebtAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');

contract('CompoundDebtAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const batAddress = '0x0D8775F648430679A709E98d2b0Cb6250d2887EF';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const repAddress = '0x1985365e9f78359a9B6AD760e32412f4a445E862';
  const zrxAddress = '0xE41d2489571d322189246DaFA5ebDe1F4699F498';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const wbtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
  const saiAddress = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
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
      [web3.utils.toHex('Compound')],
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
        daiAddress,
        batAddress,
        ethAddress,
        repAddress,
        saiAddress,
        zrxAddress,
        usdcAddress,
        wbtcAddress,
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
        gas: '300000',
      });
  });

  it('should return correct balances', async () => {
    await adapterRegistry.methods['getBalances(address)'](testAddress)
      .call()
      .then((result) => {
        displayToken(result[0].adapterBalances[0].balances[0].base);
        displayToken(result[0].adapterBalances[0].balances[1].base);
        displayToken(result[0].adapterBalances[0].balances[3].base);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, dai);
        assert.deepEqual(result[0].adapterBalances[0].balances[3].base.metadata, usdc);
      });
  });
});
