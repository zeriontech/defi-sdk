import displayToken from '../helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./PoolTogetherAdapter');
const TokenAdapter = artifacts.require('./PoolTogetherTokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');

contract.skip('PoolTogetherAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

  const saiPoolAddress = '0xb7896fce748396EcFC240F5a0d3Cc92ca42D7d84';
  const daiPoolAddress = '0x29fe7D60DdF151E5b52e5FAB4f1325da6b2bD958';
  const usdcPoolAddress = '0x0034Ea9808E620A0EF79261c51AF20614B742B24';

  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let erc20TokenAdapterAddress;
  let tokenAdapterAddress;
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
  const daiPool = [
    daiPoolAddress,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('PoolTogether Pool')),
    [
      'DAI Pool',
      'PLT',
      '18',
    ],
  ];
  const usdcPool = [
    usdcPoolAddress,
    web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('PoolTogether Pool')),
    [
      'USDC Pool',
      'PLT',
      '6',
    ],
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
    await TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapterAddress = result.address;
      });
    await AdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        adapterRegistry = result.contract;
      });
    await adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('PoolTogether')],
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
        saiPoolAddress,
        daiPoolAddress,
        usdcPoolAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gasLimit: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20'), web3.utils.toHex('PoolTogether Pool')],
      [erc20TokenAdapterAddress, tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
  });

  it('should return correct balances', async () => {
    await adapterRegistry.methods.getBalances(testAddress)
      .call()
      .then(async (result) => {
        await displayToken(adapterRegistry, result[0].adapterBalances[0].balances[0]);
        await displayToken(adapterRegistry, result[0].adapterBalances[0].balances[1]);
      });
    await adapterRegistry.methods.getFinalFullTokenBalances(
      [
        daiPoolAddress,
        usdcPoolAddress,
      ],
      [
        web3.utils.toHex('PoolTogether Pool'),
        web3.utils.toHex('PoolTogether Pool'),
      ],
    )
      .call()
      .then((result) => {
        assert.deepEqual(result[0].base.metadata, daiPool);
        assert.deepEqual(result[0].underlying[0].metadata, dai);
        assert.deepEqual(result[1].base.metadata, usdcPool);
        assert.deepEqual(result[1].underlying[0].metadata, usdc);
      });
  });
});
