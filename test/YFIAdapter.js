import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('YFIAdapter');
const TokenAdapter = artifacts.require('TokenSetsTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');


contract('YFIAdapter', () => {
  const yfi = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e';
  const yCrvAddress = '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8';
  const balancerDai98Yfi2Address = '0x60626db611a9957C1ae4Ac5b7eDE69e24A3B76c5';
  const balancerYfi2yCrv98Address = '0x95C4B6C7CfF608c0CA048df8b81a484aA377172B';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const yfi = [
    yfiAddress,
    'yearn.finance',
    'YFI',
    '18',
  ];
  const curve_Y = [
    curve_Y,
    'Not available',
    'N/A',
    '0',
  ];
  const balancer_DAI_YFI_98_2 = [
    balancer_DAI_YFI_98_2,
    'Not available',
    'N/A',
    '0',
  ];
  const balancer_YFI_CURVE_Y_2_98 = [
    balancer_YFI_CURVE_Y_2_98,
    'Not available',
    'N/A',
    '0',
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
        yfi,
        yCrv,
        balancerDai98Yfi2,
        balancerYfi2yCrv98,
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
        displayToken(result[0].adapterBalances[0].balances[1].base);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].base.metadata, yCrv);
        assert.equal(result[0].adapterBalances[0].balances[1].underlying.length, 0);
        displayToken(result[0].adapterBalances[0].balances[2].base);
        assert.deepEqual(result[0].adapterBalances[0].balances[2].base.metadata, balancerDai98Yfi2);
        assert.equal(result[0].adapterBalances[0].balances[2].underlying.length, 0);
        displayToken(result[0].adapterBalances[0].balances[3].base);
        assert.deepEqual(result[0].adapterBalances[0].balances[3].base.metadata, balancerYfi2yCrv98);
        assert.equal(result[0].adapterBalances[0].balances[3].underlying.length, 0);
      });
  });
});
