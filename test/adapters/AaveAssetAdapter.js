import displayToken from '../helpers/displayToken';

const ASSET_ADAPTER = '01';

// const ProtocolAdapterRegistry = artifacts.require('ProtocolAdapterRegistry');
// const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');
const ProtocolAdapter = artifacts.require('AaveAssetAdapter');
const TokenAdapter = artifacts.require('AaveTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('AaveAssetAdapter', () => {
  const aDAIAddress = '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d';
  const aKNCAddress = '0x9D91BE44C06d373a8a226E1f3b146956083803eB';
  const aBATAddress = '0xE1BA0FB44CCb0D11b80F92f4f8Ed94CA3fF51D00';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const dai = [
    'Dai Stablecoin',
    'DAI',
    '18',
  ];
  const knc = [
    'Kyber Network Crystal',
    'KNC',
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
          web3.utils.toHex('Aave'),
        )
          .slice(0, -2)}${ASSET_ADAPTER}`,
      ],
      [
        protocolAdapterAddress,
      ],
      [
        [
          aDAIAddress,
          aKNCAddress,
          aBATAddress,
        ],
      ],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20'), web3.utils.toHex('AToken')],
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
      });
    await adapterRegistry.methods.getFullTokenBalances(
      [
        web3.utils.toHex('AToken'),
        web3.utils.toHex('AToken'),
        web3.utils.toHex('AToken'),
      ],
      [
        aDAIAddress,
        aKNCAddress,
        aBATAddress,
      ],
    )
      .call()
      .then((result) => {
        assert.deepEqual(result[0].underlying[0].erc20metadata, dai);
        assert.deepEqual(result[1].underlying[0].erc20metadata, knc);
        assert.deepEqual(result[2].underlying[0].erc20metadata, bat);
      });
  });
});
