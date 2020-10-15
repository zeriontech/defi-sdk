import displayToken from '../helpers/displayToken';

const ASSET_ADAPTER = '01';

const ProtocolAdapterRegistry = artifacts.require('ProtocolAdapterRegistry');
const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');
const ProtocolAdapter = artifacts.require('ERC20ProtocolAdapter');
const TokenAdapter = artifacts.require('CurveTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('CurveAssetAdapter', () => {
  const cPoolToken = '0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2';
  const tPoolToken = '0x9fC689CCaDa600B6DF723D9E47D84d76664a1F23';
  const yPoolToken = '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8';
  const bPoolToken = '0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B';
  const sPoolToken = '0xC25a3A3b969415c80451098fa907EC722572917F';
  const pPoolToken = '0xD905e2eaeBe188fc92179b6350807D8bd91Db0D8';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const cdai = [
    'Compound Dai',
    'cDAI',
    '8',
  ];
  const cusdc = [
    'Compound USD Coin',
    'cUSDC',
    '8',
  ];
  const usdt = [
    'Tether USD',
    'USDT',
    '6',
  ];
  const ydai = [
    'iearn DAI',
    'yDAI',
    '18',
  ];
  const yusdc = [
    'iearn USDC',
    'yUSDC',
    '6',
  ];
  const ytusd = [
    'iearn TUSD',
    'yTUSD',
    '18',
  ];
  const yusdt = [
    'iearn USDT',
    'yUSDT',
    '6',
  ];
  const ybusd = [
    'iearn BUSD',
    'yBUSD',
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
          web3.utils.toHex('Curve'),
        )
          .slice(0, -2)}${ASSET_ADAPTER}`,
      ],
      [
        protocolAdapterAddress,
      ],
      [[
        cPoolToken,
        tPoolToken,
        yPoolToken,
        bPoolToken,
        sPoolToken,
        pPoolToken,
      ]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods.addTokenAdapters(
      [
        web3.utils.toHex('ERC20'),
        web3.utils.toHex('Curve Pool Token'),
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
        await displayToken(adapterRegistry, result[0].tokenBalances[1]);
        await displayToken(adapterRegistry, result[0].tokenBalances[2]);
      });
    await adapterRegistry.methods.getFullTokenBalances(
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
        assert.deepEqual(result[0].underlying[0].erc20metadata, cdai);
        assert.deepEqual(result[0].underlying[1].erc20metadata, cusdc);
        assert.deepEqual(result[1].underlying[0].erc20metadata, cdai);
        assert.deepEqual(result[1].underlying[1].erc20metadata, cusdc);
        assert.deepEqual(result[1].underlying[2].erc20metadata, usdt);
        assert.deepEqual(result[2].underlying[0].erc20metadata, ydai);
        assert.deepEqual(result[2].underlying[1].erc20metadata, yusdc);
        assert.deepEqual(result[2].underlying[2].erc20metadata, yusdt);
        assert.deepEqual(result[2].underlying[3].erc20metadata, ytusd);
        assert.deepEqual(result[3].underlying[0].erc20metadata, ydai);
        assert.deepEqual(result[3].underlying[1].erc20metadata, yusdc);
        assert.deepEqual(result[3].underlying[2].erc20metadata, yusdt);
        assert.deepEqual(result[3].underlying[3].erc20metadata, ybusd);
      });
  });
});
