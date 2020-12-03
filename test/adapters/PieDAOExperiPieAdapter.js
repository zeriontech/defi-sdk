import convertToBytes32 from '../helpers/convertToBytes32';

const PIE_DAO_ASSET_ADAPTER = convertToBytes32('PeiDAO Pie Adapter');
const EMPTY_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('ProtocolAdapterRegistry');
const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');
const ProtocolAdapter = artifacts.require('ERC20ProtocolAdapter');
const TokenAdapter = artifacts.require('PieDAOExperiPieTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('PieDAOExperiPieAdapter', () => {
  const DXYAddress = '0x992e9f1d29e2fdb57a9e09a78e122fafe3720cc5';

  let accounts;
  let protocolAdapterRegistry;
  let tokenAdapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;

  const link = [
    'ChainLink Token',
    'LINK',
    '18',
  ];

  const yfi = [
    'yearn.finance',
    'YFI',
    '18',
  ];

  const aave = [
    'Aave Token',
    'AAVE',
    '18',
  ];

  const uni = [
    'Uniswap',
    'UNI',
    '18',
  ];

  const snx = [
    'Synthetix Network Token',
    'SNX',
    '18',
  ];

  const comp = [
    'Compound',
    'COMP',
    '18',
  ];

  const mkr = [
    'Maker',
    'MKR',
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
        protocolAdapterRegistry = result.contract;
      });
    await TokenAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapterRegistry = result.contract;
      });
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [
        PIE_DAO_ASSET_ADAPTER,
      ],
      [
        protocolAdapterAddress,
      ],
      [[
        DXYAddress,
      ]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods.addTokenAdapters(
      [EMPTY_BYTES32, convertToBytes32('PieDAO Pie Token')],
      [erc20TokenAdapterAddress, tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods.addTokenAdapterNamesByHashes(
      [DXYAddress],
      [convertToBytes32('PieDAO Pie Token')],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
  });

  it('should return correct underlying tokens for experiPie', async () => {
    const result = await tokenAdapterRegistry.methods.getFullTokenBalances([DXYAddress]).call();
    assert.deepEqual(result[0].underlying[0].erc20metadata, link);
    assert.deepEqual(result[0].underlying[1].erc20metadata, yfi);
    assert.deepEqual(result[0].underlying[2].erc20metadata, aave);
    assert.deepEqual(result[0].underlying[3].erc20metadata, uni);
    assert.deepEqual(result[0].underlying[4].erc20metadata, snx);
    assert.deepEqual(result[0].underlying[5].erc20metadata, comp);
    assert.deepEqual(result[0].underlying[6].erc20metadata, mkr);
  });
});
