import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('BancorV2Adapter');
const TokenAdapter = artifacts.require('BancorV2TokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('BancorAdapter', () => {
  const linkBntPool1Address = '0x7b5b7c0534cd37fd7B637b46D9e9CdD3D7e3acD9';
  const linkAddress = '0x514910771AF9Ca656af840dff83E8264EcF986CA';
  // Random address with linkBntPool1 tokens
  const testAddress = '0xC10FA265ce69337EB0eCf7B02d652E8d28b61A17';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const linkBntPool1 = [
    linkBntPool1Address,
    'LINK / BNT Liquidity Pool1',
    'LINKBNT1',
    '18',
  ];
  const link = [
    linkAddress,
    'ChainLink Token',
    'LINK',
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
      ['Bancor V2'],
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
        linkBntPool1Address,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20', 'SmartToken V2'],
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
        assert.deepEqual(
          result[0].adapterBalances[0].balances[0].base.metadata,
          linkBntPool1,
        );
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, link);
      });
  });
});
