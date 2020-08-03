import displayToken from '../helpers/displayToken';

const ASSET_ADAPTER = '01';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('PieDAOPieAdapter');
const TokenAdapter = artifacts.require('PieDAOPieTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract.only('PieDAOPieAdapter', () => {
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
    await adapterRegistry.methods.addProtocolAdapters(
      [
        `${web3.eth.abi.encodeParameter(
          'bytes32',
          web3.utils.toHex('PieDAO'),
        )
          .slice(0, -2)}${ASSET_ADAPTER}`,
      ],
      [
        protocolAdapterAddress,
      ],
      [[
        BTCPPAddress,
      ]],
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
      .then(async (result) => {
        await displayToken(adapterRegistry, result[0].tokenBalances[0]);
      });
  });
});
