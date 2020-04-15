import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./MCDAssetAdapter');
const DebtProtocolAdapter = artifacts.require('./MCDDebtAdapter');
const TokenAdapter = artifacts.require('./ERC20TokenAdapter');

contract('MCDAssetAdapter', () => {
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const batAddress = '0x0D8775F648430679A709E98d2b0Cb6250d2887EF';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // for debt
  // DSProxy of '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990'
  const testAddress = '0x29604c784102D453B476fB099b8DCfc83b508F55';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let debtProtocolAdapterAddress;
  let tokenAdapterAddress;
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
    await DebtProtocolAdapter.new({ from: accounts[0] })
      .then((result) => {
        debtProtocolAdapterAddress = result.address;
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
      [web3.utils.toHex('MCD')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        debtProtocolAdapterAddress,
        protocolAdapterAddress,
      ]],
      [[
        [
          daiAddress,
        ],
        [
          wethAddress,
          batAddress,
        ],
      ]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [tokenAdapterAddress],
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
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, weth);
        assert.equal(result[0].adapterBalances[0].balances[0].underlying.length, 0);
      });
  });
});
