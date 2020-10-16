import displayToken from '../helpers/displayToken';

const ASSET_ADAPTER = '01';

const ProtocolAdapterRegistry = artifacts.require('ProtocolAdapterRegistry');
const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');
const ProtocolAdapter = artifacts.require('ERC20ProtocolAdapter');
const TokenAdapter = artifacts.require('TokenSetsTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('TokenSetsAdapter', () => {
  const ETH12DayEMACrossoverSet = '0x2c5a9980B41861D91D30d0E0271d1c093452DcA5';
  const BTCRangeBoundMinVolatilitySet = '0x81c55017F7Ce6E72451cEd49FF7bAB1e3DF64d0C';

  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const eth12 = [
    'ETH 12 EMA Crossover Set',
    'ETH12EMACO',
    '18',
  ];
  const btc = [
    'BTC Min Volatility Set',
    'BTCMINVOL',
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
    await ProtocolAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        adapterRegistry = result.contract;
      });
    await TokenAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapterRegistry = result.contract;
      });
    await adapterRegistry.methods.addProtocolAdapters(
      [
        `${web3.eth.abi.encodeParameter(
          'bytes32',
          web3.utils.toHex('TokenSets'),
        )
          .slice(0, -2)}${ASSET_ADAPTER}`,
      ],
      [
        protocolAdapterAddress,
      ],
      [[
        ETH12DayEMACrossoverSet,
        BTCRangeBoundMinVolatilitySet,
      ]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20'), web3.utils.toHex('SetToken')],
      [erc20TokenAdapterAddress, tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
  });

  it('should return correct balances', async () => {
    await adapterRegistry.methods.getBalances(testAddress)
      .call()
      .then(async (result) => {
        await displayToken(adapterRegistry, result[0].tokenBalances[0]);
        await displayToken(adapterRegistry, result[0].tokenBalances[1]);
      });
    await adapterRegistry.methods.getFullTokenBalances(
      [
        web3.utils.toHex('SetToken'),
        web3.utils.toHex('SetToken'),
      ],
      [
        ETH12DayEMACrossoverSet,
        BTCRangeBoundMinVolatilitySet,
      ],
    )
      .call()
      .then((result) => {
        assert.deepEqual(result[0].base.erc20metadata, eth12);
        assert.deepEqual(result[1].base.erc20metadata, btc);
      });
  });
});
