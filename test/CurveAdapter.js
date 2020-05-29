import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('CurveAdapter');
const TokenAdapter = artifacts.require('CurveTokenAdapter');
const CTokenAdapter = artifacts.require('CompoundTokenAdapter');
const YTokenAdapter = artifacts.require('IearnTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('CurveAdapter', () => {
  const cCrvAddress = '0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2';
  const tCrvAddress = '0x9fC689CCaDa600B6DF723D9E47D84d76664a1F23';
  const yCrvAddress = '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8';
  const bCrvAddress = '0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B';
  const sCrvAddress = '0xC25a3A3b969415c80451098fa907EC722572917F';
  const pCrvAddress = '0xD905e2eaeBe188fc92179b6350807D8bd91Db0D8';
  const tbtcCrvAddress = '0x1f2a662FB513441f06b8dB91ebD9a1466462b275';
  const renCrvAddress = '0x49849C98ae39Fff122806C06791Fa73784FB3675';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const cDAIAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
  const cUSDCAddress = '0x39AA39c021dfbaE8faC545936693aC917d5E7563';
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
    'Dai Stablecoin',
    'DAI',
    '18',
  ];
  const usdc = [
    usdcAddress,
    'USD//C',
    'USDC',
    '6',
  ];
  const cdai = [
    cDAIAddress,
    'Compound Dai',
    'cDAI',
    '8',
  ];
  const cusdc = [
    cUSDCAddress,
    'Compound USD Coin',
    'cUSDC',
    '8',
  ];
  const tusd = [
    tusdAddress,
    'TrueUSD',
    'TUSD',
    '18',
  ];
  const usdt = [
    usdtAddress,
    'Tether USD',
    'USDT',
    '6',
  ];
  const busd = [
    busdAddress,
    'Binance USD',
    'BUSD',
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
      ['Curve'],
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
        cCrvAddress,
        tCrvAddress,
        yCrvAddress,
        bCrvAddress,
        sCrvAddress,
        pCrvAddress,
        tbtcCrvAddress,
        renCrvAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20', 'Curve pool token', 'CToken', 'YToken'],
      [erc20TokenAdapterAddress, tokenAdapterAddress, cTokenAdapterAddress, yTokenAdapterAddress],
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
        displayToken(result[0].adapterBalances[0].balances[1].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[1].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[1].underlying[2]);
        displayToken(result[0].adapterBalances[0].balances[2].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[2].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[2].underlying[2]);
        displayToken(result[0].adapterBalances[0].balances[2].underlying[3]);
        displayToken(result[0].adapterBalances[0].balances[3].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[3].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[3].underlying[2]);
        displayToken(result[0].adapterBalances[0].balances[3].underlying[3]);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, dai);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[1].metadata, usdc);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].underlying[0].metadata, dai);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].underlying[1].metadata, usdc);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].underlying[2].metadata, usdt);
        assert.deepEqual(result[0].adapterBalances[0].balances[2].underlying[0].metadata, dai);
        assert.deepEqual(result[0].adapterBalances[0].balances[2].underlying[1].metadata, usdc);
        assert.deepEqual(result[0].adapterBalances[0].balances[2].underlying[2].metadata, usdt);
        assert.deepEqual(result[0].adapterBalances[0].balances[2].underlying[3].metadata, tusd);
        assert.deepEqual(result[0].adapterBalances[0].balances[3].underlying[0].metadata, dai);
        assert.deepEqual(result[0].adapterBalances[0].balances[3].underlying[1].metadata, usdc);
        assert.deepEqual(result[0].adapterBalances[0].balances[3].underlying[2].metadata, usdt);
        assert.deepEqual(result[0].adapterBalances[0].balances[3].underlying[3].metadata, busd);
      });
  });

  it('should return correct full unit', async () => {
    await adapterRegistry.methods['getFullTokenBalance(string,address)'](
      'Curve pool token',
      cCrvAddress,
    )
      .call()
      .then((result) => {
        assert.deepEqual(result.underlying[0].metadata, cdai);
        assert.deepEqual(result.underlying[1].metadata, cusdc);
      });
  });

  it('should return correct final full unit', async () => {
    await adapterRegistry.methods['getFinalFullTokenBalance(string,address)'](
      'Curve pool token',
      cCrvAddress,
    )
      .call()
      .then((result) => {
        assert.deepEqual(result.underlying[0].metadata, dai);
        assert.deepEqual(result.underlying[1].metadata, usdc);
      });
  });
});
