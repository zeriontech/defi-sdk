import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('KimchiStakingAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('KimchiStakingAdapter', () => {
  const kimchiAddress = '0x1E18821E69B9FAA8e6e75DFFe54E7E25754beDa0';
  const uniYfiWethAddress = '0x2fDbAdf3C4D5A8666Bc06645B8358ab803996E28';
  // Random address with positive balances
  const testAddress = '0x75c8e2dd57927eb0373e8e201ebf582406adcf45';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let erc20TokenAdapterAddress;

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
      ['KIMCHI'],
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
        kimchiAddress,
        uniYfiWethAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20'],
      [erc20TokenAdapterAddress],
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
        displayToken(result[0].adapterBalances[0].balances[1].base);
      });
  });
});
