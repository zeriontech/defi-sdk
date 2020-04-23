import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('PieDAOPieAdapter');
const TokenAdapter = artifacts.require('PieDAOPieTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('PieDAOPieAdapter', () => {
  const BTCPPAddress = '0x0327112423F3A68efdF1fcF402F6c5CB9f7C33fd';
  const wbtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
  const pbtcAddress = '0x5228a22e72ccC52d415EcFd199F99D0665E7733b';
  const imbtcAddress = '0x3212b29E33587A00FB1C83346f5dBFA69A458923';
  const sbtcAddress = '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6';

  const testAddress = '0xd4DBF96Db2FDf8ED40296d8d104b371aDF7dEE12';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;

  const btcpp = [
    BTCPPAddress,
    'PieDAO BTC++',
    'BTC++',
    '18',
  ];
  const wbtc = [
    wbtcAddress,
    'Wrapped BTC',
    'WBTC',
    '8',
  ];
  const pbtc = [
    pbtcAddress,
    'pTokens BTC',
    'pBTC',
    '18',
  ];
  const imbtc = [
    imbtcAddress,
    'The Tokenized Bitcoin',
    'imBTC',
    '8',
  ];
  const sbtc = [
    sbtcAddress,
    'Synth sBTC',
    'sBTC',
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
      ['PieDAOPie'],
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
        BTCPPAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20', 'PieDAO Pie Token'],
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
        displayToken(result[0].adapterBalances[0].balances[0].underlying[2]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[3]);
        displayToken(result[0].adapterBalances[0].balances[0].base);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, btcpp);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, wbtc);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[1].metadata, pbtc);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[2].metadata, imbtc);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[3].metadata, sbtc);
      });
  });
});
