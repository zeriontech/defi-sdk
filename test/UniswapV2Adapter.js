import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('UniswapV2Adapter');
const TokenAdapter = artifacts.require('UniswapV2TokenAdapter');
const CompoundTokenAdapter = artifacts.require('CompoundTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('UniswapV2Adapter', () => {
  const wethDaiUniAddress = '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11';
  // const wethCdaiUniAddress = '';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const testAddress = '0xAC6cFBFb9eE02E270f695c6DeE900DB112Bc0D6b';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let cTokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const wethDaiUni = [
    wethDaiUniAddress,
    'DAI/WETH Pool',
    'UNI-V2',
    '18',
  ];
  // const wethCdaiUni = [
  //   wethCdaiUniAddress,
  //   'WETH/cDAI Uniswap Pool',
  //   'UNI-V2',
  //   '18',
  // ];
  const dai = [
    daiAddress,
    'Dai Stablecoin',
    'DAI',
    '18',
  ];
  const weth = [
    wethAddress,
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
    await CompoundTokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        cTokenAdapterAddress = result.address;
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
      ['Uniswap V2'],
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
        wethDaiUniAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20', 'Uniswap V2 pool token', 'CToken'],
      [erc20TokenAdapterAddress, tokenAdapterAddress, cTokenAdapterAddress],
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
        displayToken(result[0].adapterBalances[0].balances[0].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[1]);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, wethDaiUni);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, dai);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[1].metadata, weth);
      });
  });
});
