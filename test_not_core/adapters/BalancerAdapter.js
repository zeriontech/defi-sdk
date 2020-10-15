import displayToken from '../helpers/displayToken';

const ASSET_ADAPTER = '01';

const ProtocolAdapterRegistry = artifacts.require('ProtocolAdapterRegistry');
const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');
const ProtocolAdapter = artifacts.require('ERC20ProtocolAdapter');
const TokenAdapter = artifacts.require('BalancerTokenAdapter');
const CompoundTokenAdapter = artifacts.require('CompoundTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('BalancerAdapter', () => {
  const wethDai3070PoolAddress = '0x53b89CE35928dda346c574D9105A5479CB87231c';
  const wethMkr2575PoolAddress = '0x987D7Cc04652710b74Fff380403f5c02f82e290a';
  const cusdcCdai5050PoolAddress = '0x622A71fdae6428D015052CF991816F70BB6A4a01';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let cTokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const wethDai3070Pool = [
    '30% WETH + 70% DAI Pool',
    'BPT',
    '18',
  ];
  const wethMkr2575Pool = [
    '75% MKR + 25% WETH Pool',
    'BPT',
    '18',
  ];
  const cusdcCdai5050Pool = [
    '50% cUSDC + 50% cDAI Pool',
    'BPT',
    '18',
  ];
  const mkr = [
    'Maker',
    'MKR',
    '18',
  ];
  const dai = [
    'Dai Stablecoin',
    'DAI',
    '18',
  ];
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
    await CompoundTokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        cTokenAdapterAddress = result.address;
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
          web3.utils.toHex('Balancer'),
        )
          .slice(0, -2)}${ASSET_ADAPTER}`,
      ],
      [
        protocolAdapterAddress,
      ],
      [[
        wethDai3070PoolAddress,
        wethMkr2575PoolAddress,
        cusdcCdai5050PoolAddress,
      ]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods.addTokenAdapters(
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
        await displayToken(adapterRegistry, result[0].tokenBalances[0]);
        await displayToken(adapterRegistry, result[0].tokenBalances[1]);
        await displayToken(adapterRegistry, result[0].tokenBalances[2]);
      });
    await adapterRegistry.methods.getFullTokenBalances(
      [
        web3.utils.toHex('Balancer Pool Token'),
        web3.utils.toHex('Balancer Pool Token'),
        web3.utils.toHex('Balancer Pool Token'),
      ],
      [
        wethDai3070PoolAddress,
        wethMkr2575PoolAddress,
        cusdcCdai5050PoolAddress,
      ],
    )
      .call()
      .then((result) => {
        assert.deepEqual(result[0].base.erc20metadata, wethDai3070Pool);
        assert.deepEqual(result[0].underlying[0].erc20metadata, weth);
        assert.deepEqual(result[0].underlying[1].erc20metadata, dai);
        assert.deepEqual(result[1].base.erc20metadata, wethMkr2575Pool);
        assert.deepEqual(result[1].underlying[0].erc20metadata, mkr);
        assert.deepEqual(result[1].underlying[1].erc20metadata, weth);
        assert.deepEqual(result[2].base.erc20metadata, cusdcCdai5050Pool);
        assert.deepEqual(result[2].underlying[0].erc20metadata, cusdc);
        assert.deepEqual(result[2].underlying[1].erc20metadata, cdai);
      });
  });
});
