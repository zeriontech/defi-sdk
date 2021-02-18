//  import displayToken from './helpers/displayToken';

//  const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('LinkswapStakingAdapter');
//  const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('LinkswapStakingAdapter', () => {
  const yflAddress = '0x28cb7e841ee97947a86B06fA4090C8451f64c0be';
  // Random address with positive balances
  const testAddress = '0x75D1aA733920b14fC74c9F6e6faB7ac1EcE8482E';

  let accounts;
  //  let adapterRegistry;
  let protocolAdapterContract;
  //  let erc20TokenAdapterAddress;
  //  const yfl = [
  //    yflAddress,
  //    'YFLink',
  //    'YFL',
  //    '18',
  //  ];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ProtocolAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterContract = result.contract;
      });
    //    await ERC20TokenAdapter.new({ from: accounts[0] })
    //      .then((result) => {
    //        erc20TokenAdapterAddress = result.address;
    //      });
    //    await AdapterRegistry.new({ from: accounts[0] })
    //      .then((result) => {
    //        adapterRegistry = result.contract;
    //      });
    //    await adapterRegistry.methods.addProtocols(
    //      ['LINKSWAP Staking'],
    //      [[
    //        'Mock Protocol Name',
    //        'Mock protocol description',
    //        'Mock website',
    //        'Mock icon',
    //        '0',
    //      ]],
    //      [[
    //        protocolAdapterContract,
    //      ]],
    //      [[[
    //        yflAddress,
    //      ]]],
    //    )
    //      .send({
    //        from: accounts[0],
    //        gas: '1000000',
    //      });
    //    await adapterRegistry.methods.addTokenAdapters(
    //      ['ERC20'],
    //      [erc20TokenAdapterAddress],
    //    )
    //      .send({
    //        from: accounts[0],
    //        gas: '1000000',
    //      });
  });

  it('should return correct balances', async () => {
    await protocolAdapterContract.methods['getBalance(address,address)'](yflAddress, testAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });

  //  it('should return correct balances', async () => {
  //    await adapterRegistry.methods['getBalances(address)'](testAddress)
  //      .call()
  //      .then((result) => {
  //        displayToken(result[0].adapterBalances[0].balances[0].base);
  //        displayToken(result[0].adapterBalances[0].balances[1].base);
  //        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, yfl);
  //      });
  //  });
});
