import displayToken from '../helpers/displayToken';

const ASSET_ADAPTER = '01';

const ProtocolAdapterRegistry = artifacts.require('ProtocolAdapterRegistry');
const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');
const ProtocolAdapter = artifacts.require('ERC20ProtocolAdapter');
const TokenAdapter = artifacts.require('YearnTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('IearnAdapter', () => {
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
    await ProtocolAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        adapterRegistry = result.contract;
      });
    await TokenAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapterRegistry = result.contract;
      });
    await adapterRegistry.methods.addProtocolAdapters(
      [
        `${web3.eth.abi.encodeParameter(
          'bytes32',
          web3.utils.toHex('iearn.finance'),
        )
          .slice(0, -2)}${ASSET_ADAPTER}`,
      ],
      [
        protocolAdapterAddress,
      ],
      [[
        yDAIAddress,
        yUSDCAddress,
        yUSDTAddress,
        ySUSDAddress,
        yTUSDAddress,
        yWBTCAddress,
      ]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20'), web3.utils.toHex('YToken')],
      [erc20TokenAdapterAddress, tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
  });

  it('should return correct balances', async () => {
    await adapterRegistry.methods.getBalances(testAddress)
      .call()
      .then(async (result) => {
        await displayToken(adapterRegistry, result[0].tokenBalances[0]);
      });
    await adapterRegistry.methods.getFullTokenBalances(
      [
        web3.utils.toHex('YToken'),
      ],
      [
        yDAIAddress,
      ],
    )
      .call()
      .then((result) => {
        assert.deepEqual(result[0].underlying[0].erc20metadata, dai);
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
      `${web3.eth.abi.encodeParameter(
        'bytes32',
        web3.utils.toHex('iearn.finance'),
      )
        .slice(0, -2)}${ASSET_ADAPTER}`,
      [yDAIAddress],
      testAddress,
    )
      .call()
      .then((result) => {
        assert.equal(result.tokenBalances.length, 1);
      });
  });
});
