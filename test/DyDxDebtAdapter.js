import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./DyDxDebtAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');

contract('DyDxDebtAdapter', () => {
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const saiAddress = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const batAddress = '0x0D8775F648430679A709E98d2b0Cb6250d2887EF';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let erc20TokenAdapterAddress;
  const weth = [
    wethAddress,
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
    await ERC20TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        erc20TokenAdapterAddress = result.address;
      });
    await AdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        adapterRegistry = result.contract;
      });
    await adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('DyDx')],
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
        wethAddress,
        saiAddress,
        usdcAddress,
        daiAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gasLimit: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [erc20TokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
  });

  it('should return correct balances', async () => {
    await adapterRegistry.methods['getBalances(address)'](testAddress)
      .call()
      .then((result) => {
        displayToken(result[0].adapterBalances[0].balances[0].base);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, weth);
      });
  });

  it('should not return 0 value for wrong asset', async () => {
    await adapterRegistry.methods.getAdapterBalance(
      testAddress,
      protocolAdapterAddress,
      [batAddress],
    )
      .call()
      .then((result) => {
        assert.equal(result.balances.length, 0);
      });
  });
});
