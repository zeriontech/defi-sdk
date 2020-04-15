import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./AaveAssetAdapter');
const TokenAdapter = artifacts.require('./AaveTokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');

contract('AaveAssetAdapter', () => {
  const aDAIAddress = '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d';
  const aKNCAddress = '0x9D91BE44C06d373a8a226E1f3b146956083803eB';
  const aBATAddress = '0xE1BA0FB44CCb0D11b80F92f4f8Ed94CA3fF51D00';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const batAddress = '0x0D8775F648430679A709E98d2b0Cb6250d2887EF';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const dai = [
    daiAddress,
    'Dai Stablecoin',
    'DAI',
    '18',
  ];
  const bat = [
    batAddress,
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
    await AdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        adapterRegistry = result.contract;
      });
    await adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Aave')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        protocolAdapterAddress,
        ZERO,
      ]],
      [[
        [
          aDAIAddress,
          aKNCAddress,
          aBATAddress,
        ],
        [],
      ]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20'), web3.utils.toHex('AToken')],
      [erc20TokenAdapterAddress, tokenAdapterAddress],
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
        displayToken(result[0].adapterBalances[0].balances[1].underlying[0]);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, dai);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].underlying[0].metadata, bat);
      });
  });
});
