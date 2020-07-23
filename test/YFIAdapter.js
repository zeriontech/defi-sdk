import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('YFIAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');


contract.only('YFIAdapter', () => {
  const yfiAddress = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e';
  const testAddress = '0xd45404b8E15ECFaCB7C63d6A60559E460f3Ded51';
  const yearnRewardsStakingCurvePool = '0x0001FB050Fe7312791bF6475b96569D83F695C9f';
  const yearnRewardsStakingBalancerPool = '0x033E52f513F9B98e129381c6708F9faA2DEE5db5'
  const yearnRewardsStakingGovernancePool = '0x3A22dF48d84957F907e67F4313E3D43179040d6E'

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  const yfi = [
    yfiAddress,
    'yearn.finance',
    'YFI',
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
        tokenAdapterAddress = result.address;
      });
    await AdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        adapterRegistry = result.contract;
      });
    await adapterRegistry.methods.addProtocols(
      ['YFI'],
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
        yfiAddress,
        yearnRewardsStakingCurvePool,
        yearnRewardsStakingBalancerPool,
        yearnRewardsStakingGovernancePool
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
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, yfi);
        assert.equal(result[0].adapterBalances[0].balances[0].underlying.length, 0);

      });
  });
});
