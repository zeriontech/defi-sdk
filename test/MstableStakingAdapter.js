import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('MstableStakingAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('MstableStakingAdapter', () => {
  const mtaAddress = '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2';
  const balAddress = '0xba100000625a3754423978a60c9317c58a424e3D';
  const balancerMusd20Mta80Address = '0x003a70265a3662342010823bEA15Dc84C6f7eD54';
  const balancerUsdc50Musd50Address = '0x72Cd8f4504941Bf8c5a21d1Fd83A96499FD71d2C';
  const balancerMusd95Mta5Address = '0xa5DA8Cc7167070B62FdCB332EF097A55A68d8824';
  const balancerWeth50Musd50Address = '0xe036CCE08cf4E23D33bC6B18e53Caf532AFa8513';
  const uniswapMtaWethAddress = '0x0d0d65E7A7dB277d3E0F5E1676325E75f3340455';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

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
      ['mStable Staking'],
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
        mtaAddress,
        balAddress,
        balancerMusd20Mta80Address,
        balancerUsdc50Musd50Address,
        balancerMusd95Mta5Address,
        balancerWeth50Musd50Address,
        uniswapMtaWethAddress,
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
