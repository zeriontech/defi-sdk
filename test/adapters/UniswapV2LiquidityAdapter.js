import displayToken from '../helpers/displayToken';

const ASSET_ADAPTER = '01';

const ProtocolAdapterRegistry = artifacts.require('ProtocolAdapterRegistry');
const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');
const ProtocolAdapter = artifacts.require('ERC20ProtocolAdapter');
const TokenAdapter = artifacts.require('UniswapV2TokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('UniswapV2AssetAdapter', () => {
  const daiWethUniAddress = '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const daiWethUni = [
    'DAI/WETH Pool',
    'UNI-V2',
    '18',
  ];
  const dai = [
    'Dai Stablecoin',
    'DAI',
    '18',
  ];
  const weth = [
    'Wrapped Ether',
    'WETH',
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
          web3.utils.toHex('Uniswap V2'),
        )
          .slice(0, -2)}${ASSET_ADAPTER}`,
      ],
      [
        protocolAdapterAddress,
      ],
      [[
        daiWethUniAddress,
      ]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods.addTokenAdapters(
      [
        web3.utils.toHex('ERC20'),
        web3.utils.toHex('Uniswap V2 Pool Token'),
      ],
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
      });
    await adapterRegistry.methods.getFullTokenBalances(
      [
        web3.utils.toHex('Uniswap V2 Pool Token'),
      ],
      [
        daiWethUniAddress,
      ],
    )
      .call()
      .then((result) => {
        assert.deepEqual(result[0].base.erc20metadata, daiWethUni);
        assert.deepEqual(result[0].underlying[0].erc20metadata, dai);
        assert.deepEqual(result[0].underlying[1].erc20metadata, weth);
      });
  });
});
