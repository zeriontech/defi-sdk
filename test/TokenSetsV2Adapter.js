import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('TokenSetsV2Adapter');
const TokenAdapter = artifacts.require('TokenSetsV2TokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('TokenSetsV2Adapter', () => {
  const dpiAddress = '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b';

  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;

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
      ['TokenSetsV2'],
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
        dpiAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20', 'SetToken V2'],
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
        displayToken(result[0].adapterBalances[0].balances[0].base);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[2]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[3]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[4]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[5]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[6]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[7]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[8]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[9]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[10]);
      });
  });
});
