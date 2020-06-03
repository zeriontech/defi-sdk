import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('AaveUniswapAssetAdapter');
const TokenAdapter = artifacts.require('AaveTokenAdapter');
const AUniswapTokenAdapter = artifacts.require('AaveUniswapTokenAdapter');
const UniswapV1TokenAdapter = artifacts.require('UniswapV1TokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('AaveUniswapAssetAdapter', () => {
  const aUniDAIAddress = '0xBbBb7F2aC04484F7F04A2C2C16f20479791BbB44';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let aUniswapTokenAdapterAddress;
  let uniswapV1TokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const dai = [
    daiAddress,
    'Dai Stablecoin',
    'DAI',
    '18',
  ];
  const eth = [
    ethAddress,
    'Ether',
    'ETH',
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
    await AUniswapTokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        aUniswapTokenAdapterAddress = result.address;
      });
    await UniswapV1TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapV1TokenAdapterAddress = result.address;
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
      ['Aave • Uniswap Market'],
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
        aUniDAIAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [
        'ERC20',
        'AToken',
        'Uniswap V1 pool token',
        'AToken Uniswap Market',
      ],
      [
        erc20TokenAdapterAddress,
        tokenAdapterAddress,
        uniswapV1TokenAdapterAddress,
        aUniswapTokenAdapterAddress,
      ],
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
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, eth);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[1].metadata, dai);
      });
  });
});
