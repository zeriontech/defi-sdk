import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./ChaiInteractiveAdapter');
const TokenAdapter = artifacts.require('./ChaiTokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');

contract('ChaiAdapter', () => {
  const chaiAddress = '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const chai = [
    chaiAddress,
    'Chai',
    'CHAI',
    '18',
  ];
  const dai = [
    daiAddress,
    'Dai Stablecoin',
    'DAI',
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
      ['Chai'],
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
      [[[chaiAddress]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20', 'Chai token'],
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
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, chai);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, dai);
      });
  });

  it('should return correct full unit', async () => {
    await adapterRegistry.methods['getFinalFullTokenBalance(string,address)'](
      'Chai token',
      chaiAddress,
    )
      .call()
      .then((result) => {
        assert.deepEqual(result.underlying[0].metadata, dai);
      });
  });
});
