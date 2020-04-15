import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./AaveDebtAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');

contract('AaveDebtAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const tusdAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const susdAddress = '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51';
  const lendAddress = '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03';
  const batAddress = '0x0D8775F648430679A709E98d2b0Cb6250d2887EF';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const linkAddress = '0x514910771AF9Ca656af840dff83E8264EcF986CA';
  const kncAddress = '0xdd974D5C2e2928deA5F71b9825b8b646686BD200';
  const repAddress = '0x1985365e9f78359a9B6AD760e32412f4a445E862';
  const mkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
  const manaAddress = '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942';
  const zrxAddress = '0xE41d2489571d322189246DaFA5ebDe1F4699F498';
  const snxAddress = '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F';
  const wbtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
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
  const mkr = [
    mkrAddress,
    'Maker',
    'MKR',
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
      [web3.utils.toHex('Aave')],
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
        kncAddress,
        batAddress,
        tusdAddress,
        usdcAddress,
        usdtAddress,
        susdAddress,
        lendAddress,
        ethAddress,
        linkAddress,
        repAddress,
        mkrAddress,
        manaAddress,
        zrxAddress,
        snxAddress,
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
        gas: '1000000',
      });
  });

  it('should return correct balances', async () => {
    await adapterRegistry.methods['getBalances(address)'](testAddress)
      .call()
      .then((result) => {
        displayToken(result[0].adapterBalances[0].balances[0].base);
        displayToken(result[0].adapterBalances[0].balances[1].base);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, knc);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].base.metadata, mkr);
      });
  });
});
