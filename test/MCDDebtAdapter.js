// import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./MCDDebtAdapter');
const TokenAdapter = artifacts.require('./ERC20TokenAdapter');

contract('MCDDebtAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // for debt
  // DSProxy of '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990'
  const testAddress = '0x29604c784102D453B476fB099b8DCfc83b508F55';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;

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
        protocolAdapterAddress,
      ]],
      [[[
        daiAddress,
      ]]],
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
        assert.equal(result.length, 0);
      });
  });
});
