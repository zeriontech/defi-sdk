import displayToken from '../helpers/displayToken';

const ASSET_ADAPTER = '01';

const ProtocolAdapterRegistry = artifacts.require('ProtocolAdapterRegistry');
const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');
const ProtocolAdapter = artifacts.require('ERC20ProtocolAdapter');
const TokenAdapter = artifacts.require('UniswapV1TokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('UniswapV1AssetAdapter', () => {
  const batUniAddress = '0x2E642b8D59B45a1D8c5aEf716A84FF44ea665914';
  const mkrUniAddress = '0x2C4Bd064b998838076fa341A83d007FC2FA50957';
  const usdcUniAddress = '0x97deC872013f6B5fB443861090ad931542878126';
  const snxUniAddress = '0x3958B4eC427F8fa24eB60F42821760e88d485f7F';
  const saiUniAddress = '0x09cabEC1eAd1c0Ba254B09efb3EE13841712bE14';
  const cSaiUniAddress = '0x45A2FDfED7F7a2c791fb1bdF6075b83faD821ddE';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const batUni = [
    'BAT Pool',
    'UNI-V1',
    '18',
  ];
  const mkrUni = [
    'MKR Pool',
    'UNI-V1',
    '18',
  ];
  const usdcUni = [
    'USDC Pool',
    'UNI-V1',
    '18',
  ];
  const snxUni = [
    'SNX Pool',
    'UNI-V1',
    '18',
  ];
  const saiUni = [
    'SAI Pool',
    'UNI-V1',
    '18',
  ];
  const cSaiUni = [
    'cSAI Pool',
    'UNI-V1',
    '18',
  ];
  const mkr = [
    'Maker',
    'MKR',
    '18',
  ];
  const usdc = [
    'USD//C',
    'USDC',
    '6',
  ];
  const csai = [
    'Compound Sai',
    'cSAI',
    '8',
  ];
  const snx = [
    'Synthetix Network Token',
    'SNX',
    '18',
  ];
  const sai = [
    'Sai Stablecoin v1.0',
    'SAI',
    '18',
  ];
  const eth = [
    'Ether',
    'ETH',
    '18',
  ];
  const bat = [
    'Basic Attention Token',
    'BAT',
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
          web3.utils.toHex('Uniswap V1'),
        )
          .slice(0, -2)}${ASSET_ADAPTER}`,
      ],
      [
        protocolAdapterAddress,
      ],
      [[
        batUniAddress,
        mkrUniAddress,
        usdcUniAddress,
        snxUniAddress,
        saiUniAddress,
        cSaiUniAddress,
      ]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods.addTokenAdapters(
      [
        web3.utils.toHex('ERC20'),
        web3.utils.toHex('Uniswap V1 Pool Token'),
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
        await displayToken(adapterRegistry, result[0].tokenBalances[3]);
        await displayToken(adapterRegistry, result[0].tokenBalances[4]);
        await displayToken(adapterRegistry, result[0].tokenBalances[5]);
      });
    await adapterRegistry.methods.getFullTokenBalances(
      [
        web3.utils.toHex('Uniswap V1 Pool Token'),
        web3.utils.toHex('Uniswap V1 Pool Token'),
        web3.utils.toHex('Uniswap V1 Pool Token'),
        web3.utils.toHex('Uniswap V1 Pool Token'),
        web3.utils.toHex('Uniswap V1 Pool Token'),
        web3.utils.toHex('Uniswap V1 Pool Token'),
      ],
      [
        batUniAddress,
        mkrUniAddress,
        usdcUniAddress,
        snxUniAddress,
        saiUniAddress,
        cSaiUniAddress,
      ],
    )
      .call()
      .then((result) => {
        assert.deepEqual(result[0].base.erc20metadata, batUni);
        assert.deepEqual(result[1].base.erc20metadata, mkrUni);
        assert.deepEqual(result[2].base.erc20metadata, usdcUni);
        assert.deepEqual(result[3].base.erc20metadata, snxUni);
        assert.deepEqual(result[4].base.erc20metadata, saiUni);
        assert.deepEqual(result[5].base.erc20metadata, cSaiUni);
        assert.deepEqual(result[0].underlying[0].erc20metadata, eth);
        assert.deepEqual(result[1].underlying[0].erc20metadata, eth);
        assert.deepEqual(result[2].underlying[0].erc20metadata, eth);
        assert.deepEqual(result[3].underlying[0].erc20metadata, eth);
        assert.deepEqual(result[4].underlying[0].erc20metadata, eth);
        assert.deepEqual(result[5].underlying[0].erc20metadata, eth);
        assert.deepEqual(result[0].underlying[1].erc20metadata, bat);
        assert.deepEqual(result[1].underlying[1].erc20metadata, mkr);
        assert.deepEqual(result[2].underlying[1].erc20metadata, usdc);
        assert.deepEqual(result[3].underlying[1].erc20metadata, snx);
        assert.deepEqual(result[4].underlying[1].erc20metadata, sai);
        assert.deepEqual(result[5].underlying[1].erc20metadata, csai);
      });
  });
});
