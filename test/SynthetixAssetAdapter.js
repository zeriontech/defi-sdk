import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('SynthetixAssetAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('SynthetixAssetAdapter', () => {
  const snxAddress = '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F';
  const sethUniAddress = '0xe9Cf7887b93150D4F2Da7dFc6D502B216438F244';
  const curveSnxAddress = '0xC25a3A3b969415c80451098fa907EC722572917F';
  const iETHAddress = '0xA9859874e1743A32409f75bB11549892138BBA1E';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let erc20TokenAdapterAddress;
  const snx = [
    snxAddress,
    'Synthetix Network Token',
    'SNX',
    '18',
  ];
  // const sethUni = [
  //   sethUniAddress,
  //   'sETH pool',
  //   'UNI-V1',
  //   '18',
  // ];
  const sethUni = [
    sethUniAddress,
    'Not available',
    'N/A',
    '0',
  ];
  // const ieth = [
  //   iETHAddress,
  //   'Synth iETH',
  //   'iETH',
  //   '18',
  // ];
  const curveSusd = [
    curveSnxAddress,
    'Curve.fi DAI/USDC/USDT/sUSD',
    'crvPlain3andSUSD',
    '18',
  ];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ProtocolAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterAddress = result.address;
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
      ['Synthetix'],
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
        snxAddress,
        sethUniAddress,
        curveSnxAddress,
        iETHAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20'],
      [erc20TokenAdapterAddress],
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
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, snx);
        assert.equal(result[0].adapterBalances[0].balances[0].underlying.length, 0);
        displayToken(result[0].adapterBalances[0].balances[1].base);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].base.metadata, sethUni);
        assert.equal(result[0].adapterBalances[0].balances[1].underlying.length, 0);
        displayToken(result[0].adapterBalances[0].balances[2].base);
        assert.deepEqual(result[0].adapterBalances[0].balances[2].base.metadata, curveSusd);
        assert.equal(result[0].adapterBalances[0].balances[2].underlying.length, 0);
        // displayToken(result[0].adapterBalances[0].balances[3].base);
        // assert.deepEqual(result[0].adapterBalances[0].balances[3].base.metadata, ieth);
        // assert.equal(result[0].adapterBalances[0].balances[3].underlying.length, 0);
      });
  });
});
