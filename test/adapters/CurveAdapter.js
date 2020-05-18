import displayToken from '../helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./CurveLiquidityAdapter');
const TokenAdapter = artifacts.require('./CurveTokenAdapter');
const CTokenAdapter = artifacts.require('./CompoundTokenAdapter');
const YTokenAdapter = artifacts.require('./IearnTokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');

contract.skip('CurveLiquidityAdapter', () => {
  const cPoolToken = '0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2';
  const tPoolToken = '0x9fC689CCaDa600B6DF723D9E47D84d76664a1F23';
  const yPoolToken = '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8';
  const bPoolToken = '0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B';
  const sPoolToken = '0xC25a3A3b969415c80451098fa907EC722572917F';
  const pPoolToken = '0xD905e2eaeBe188fc92179b6350807D8bd91Db0D8';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const tusdAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
  const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const busdAddress = '0x4Fabb145d64652a948d72533023f6E7A623C7C53';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  let cTokenAdapterAddress;
  let yTokenAdapterAddress;
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
  const tusd = [
    tusdAddress,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('ERC20')),
    [
      'TrueUSD',
      'TUSD',
      '18',
    ],
  ];
  const usdt = [
    usdtAddress,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('ERC20')),
    [
      'Tether USD',
      'USDT',
      '6',
    ],
  ];
  const busd = [
    busdAddress,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('ERC20')),
    [
      'Binance USD',
      'BUSD',
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
    await CTokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        cTokenAdapterAddress = result.address;
      });
    await YTokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        yTokenAdapterAddress = result.address;
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
      [web3.utils.toHex('Curve')],
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
        cPoolToken,
        tPoolToken,
        yPoolToken,
        bPoolToken,
        sPoolToken,
        pPoolToken,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [
        web3.utils.toHex('ERC20'),
        web3.utils.toHex('Curve Pool Token'),
        web3.utils.toHex('CToken'),
        web3.utils.toHex('YToken'),
      ],
      [erc20TokenAdapterAddress, tokenAdapterAddress, cTokenAdapterAddress, yTokenAdapterAddress],
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
        web3.utils.toHex('Curve Pool Token'),
        web3.utils.toHex('Curve Pool Token'),
        web3.utils.toHex('Curve Pool Token'),
        web3.utils.toHex('Curve Pool Token'),
        web3.utils.toHex('Curve Pool Token'),
        web3.utils.toHex('Curve Pool Token'),
      ],
      [
        cPoolToken,
        tPoolToken,
        yPoolToken,
        bPoolToken,
        sPoolToken,
        pPoolToken,
      ],
    )
      .call()
      .then((result) => {
        assert.deepEqual(result[0].underlying[0].metadata, dai);
        assert.deepEqual(result[0].underlying[1].metadata, usdc);
        assert.deepEqual(result[1].underlying[0].metadata, dai);
        assert.deepEqual(result[1].underlying[1].metadata, usdc);
        assert.deepEqual(result[1].underlying[2].metadata, usdt);
        assert.deepEqual(result[2].underlying[0].metadata, dai);
        assert.deepEqual(result[2].underlying[1].metadata, usdc);
        assert.deepEqual(result[2].underlying[2].metadata, usdt);
        assert.deepEqual(result[2].underlying[3].metadata, tusd);
        assert.deepEqual(result[3].underlying[0].metadata, dai);
        assert.deepEqual(result[3].underlying[1].metadata, usdc);
        assert.deepEqual(result[3].underlying[2].metadata, usdt);
        assert.deepEqual(result[3].underlying[3].metadata, busd);
      });
  });
});
