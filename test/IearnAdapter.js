import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./IearnAdapter');
const TokenAdapter = artifacts.require('./IearnTokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');

contract('IearnAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const yDAIAddress = '0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01';
  const yUSDCAddress = '0xd6aD7a6750A7593E092a9B218d66C0A814a3436e';
  const yUSDTAddress = '0x83f798e925BcD4017Eb265844FDDAbb448f1707D';
  const ySUSDAddress = '0xF61718057901F84C4eEC4339EF8f0D86D2B45600';
  const yTUSDAddress = '0x73a052500105205d34Daf004eAb301916DA8190f';
  const yWBTCAddress = '0x04Aa51bbcB46541455cCF1B8bef2ebc5d3787EC9';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const dai = [
    daiAddress,
    'Dai Stablecoin',
    'DAI',
    '18',
  ];
  const yDAIna = [
    yDAIAddress,
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
      [web3.utils.toHex('Iearn')],
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
        yDAIAddress,
        yUSDCAddress,
        yUSDTAddress,
        ySUSDAddress,
        yTUSDAddress,
        yWBTCAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20'), web3.utils.toHex('YToken')],
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
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, dai);
      });
  });

  it('should not fail if token adapter is missing', async () => {
    await adapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('YToken')],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.getAdapterBalance(
      testAddress,
      protocolAdapterAddress,
      [yDAIAddress],
    )
      .call()
      .then((result) => {
        assert.deepEqual(result.balances[0].base.metadata, yDAIna);
        assert.equal(result.balances[0].underlying.length, 0);
      });
  });
});
