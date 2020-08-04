import displayToken from '../helpers/displayToken';

const ASSET_ADAPTER = '01';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('PieDAOPieAdapter');
const TokenAdapter = artifacts.require('PieDAOPieTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('PieDAOPieAdapter', () => {
  const BTCPPAddress = '0x0327112423F3A68efdF1fcF402F6c5CB9f7C33fd';
  const USDPPAddress = '0x9A48BD0EC040ea4f1D3147C025cd4076A2e71e3e';
  const wbtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
  const pbtcAddress = '0x5228a22e72ccC52d415EcFd199F99D0665E7733b';
  const imbtcAddress = '0x3212b29E33587A00FB1C83346f5dBFA69A458923';
  const sbtcAddress = '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6';
  // Balancer BTC++ / USD++ Pool
  const testAddress = '0x7d2F4bcB767eB190Aed0f10713fe4D9c07079ee8';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;

  const wbtc = [
    'Wrapped BTC',
    'WBTC',
    '8',
  ];
  const pbtc = [
    'pTokens BTC',
    'pBTC',
    '18',
  ];
  const imbtc = [
    'The Tokenized Bitcoin',
    'imBTC',
    '8',
  ];
  const sbtc = [
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
        USDPPAddress,
      ]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20'), web3.utils.toHex('PieDAO Pie Token')],
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
        await displayToken(adapterRegistry, result[0].tokenBalances[1]);
      });
    await adapterRegistry.methods.getFullTokenBalances(
      [
        web3.utils.toHex('PieDAO Pie Token'),
      ],
      [
        BTCPPAddress,
      ],
    )
      .call()
      .then((result) => {
        assert.deepEqual(result[0].underlying[0].erc20metadata, wbtc);
        assert.deepEqual(result[0].underlying[1].erc20metadata, pbtc);
        assert.deepEqual(result[0].underlying[2].erc20metadata, imbtc);
        assert.deepEqual(result[0].underlying[3].erc20metadata, sbtc);
      });
  });
});
