import displayToken from '../helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./BalancerAdapter');
const TokenAdapter = artifacts.require('./BalancerTokenAdapter');
const CompoundTokenAdapter = artifacts.require('./CompoundTokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');

contract.skip('BalancerAdapter', () => {
  const wethDai3070PoolAddress = '0x53b89CE35928dda346c574D9105A5479CB87231c';
  const wethMkr2575PoolAddress = '0x987D7Cc04652710b74Fff380403f5c02f82e290a';
  const cusdcCdai5050PoolAddress = '0x622A71fdae6428D015052CF991816F70BB6A4a01';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const mkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let cTokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const wethDai3070Pool = [
    wethDai3070PoolAddress,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('Balancer Pool Token')),
    [
      '30% WETH + 70% DAI Pool',
      'BPT',
      '18',
    ],
  ];
  const wethMkr2575Pool = [
    wethMkr2575PoolAddress,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('Balancer Pool Token')),
    [
      '75% MKR + 25% WETH Pool',
      'BPT',
      '18',
    ],
  ];
  const cusdcCdai5050Pool = [
    cusdcCdai5050PoolAddress,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('Balancer Pool Token')),
    [
      '50% cUSDC + 50% cDAI Pool',
      'BPT',
      '18',
    ],
  ];
  const mkr = [
    mkrAddress,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('ERC20')),
    [
      'Maker',
      'MKR',
      '18',
    ],
  ];
  const dai = [
    daiAddress,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('ERC20')),
    [
      'Dai Stablecoin',
      'DAI',
      '18',
    ],
  ];
  const usdc = [
    usdcAddress,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('ERC20')),
    [
      'USD//C',
      'USDC',
      '6',
    ],
  ];
  const weth = [
    wethAddress,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('ERC20')),
    [
      'Wrapped Ether',
      'WETH',
      '18',
    ],
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
      [web3.utils.toHex('Balancer')],
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
        wethDai3070PoolAddress,
        wethMkr2575PoolAddress,
        cusdcCdai5050PoolAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20'), web3.utils.toHex('Balancer Pool Token'), web3.utils.toHex('CToken')],
      [erc20TokenAdapterAddress, tokenAdapterAddress, cTokenAdapterAddress],
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
        await displayToken(adapterRegistry, result[0].adapterBalances[0].balances[0]);
        await displayToken(adapterRegistry, result[0].adapterBalances[0].balances[1]);
        await displayToken(adapterRegistry, result[0].adapterBalances[0].balances[2]);
      });
    await adapterRegistry.methods.getFinalFullTokenBalances(
      [
        wethDai3070PoolAddress,
        wethMkr2575PoolAddress,
        cusdcCdai5050PoolAddress,
      ],
      [
        web3.utils.toHex('Balancer Pool Token'),
        web3.utils.toHex('Balancer Pool Token'),
        web3.utils.toHex('Balancer Pool Token'),
      ],
    )
      .call()
      .then((result) => {
        assert.deepEqual(result[0].base.metadata, wethDai3070Pool);
        assert.deepEqual(result[0].underlying[0].metadata, weth);
        assert.deepEqual(result[0].underlying[1].metadata, dai);
        assert.deepEqual(result[1].base.metadata, wethMkr2575Pool);
        assert.deepEqual(result[1].underlying[0].metadata, mkr);
        assert.deepEqual(result[1].underlying[1].metadata, weth);
        assert.deepEqual(result[2].base.metadata, cusdcCdai5050Pool);
        assert.deepEqual(result[2].underlying[0].metadata, usdc);
        assert.deepEqual(result[2].underlying[1].metadata, dai);
      });
  });
});
