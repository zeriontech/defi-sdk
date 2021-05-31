import convertToBytes32 from '../helpers/convertToBytes32';

const AMUN_BASKET_ADAPTER = convertToBytes32('Amun Basket Adapter');
const EMPTY_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('ProtocolAdapterRegistry');
const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');
const ProtocolAdapter = artifacts.require('ERC20ProtocolAdapter');
const TokenAdapter = artifacts.require('AmunBasketAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('AmunBasketAdapter', () => {
  const DFIAddress = '0xA9536B9c75A9E0faE3B56a96AC8EdF76AbC91978';

  let accounts;
  let protocolAdapterRegistry;
  let tokenAdapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;

  const composition = [
    ['Uniswap', 'UNI', '18'],
    ['ChainLink Token', 'LINK', '18'],
    ['Aave Token', 'AAVE', '18'],
    ['Maker', 'MKR', '18'],
    ['Compound', 'COMP', '18'],
    ['Synthetix Network Token', 'SNX', '18'],
    ['SushiToken', 'SUSHI', '18'],
    ['yearn.finance', 'YFI', '18'],
  ];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ProtocolAdapter.new({ from: accounts[0] }).then((result) => {
      protocolAdapterAddress = result.address;
    });
    await TokenAdapter.new({ from: accounts[0] }).then((result) => {
      tokenAdapterAddress = result.address;
    });
    await ERC20TokenAdapter.new({ from: accounts[0] }).then((result) => {
      erc20TokenAdapterAddress = result.address;
    });
    await ProtocolAdapterRegistry.new({ from: accounts[0] }).then((result) => {
      protocolAdapterRegistry = result.contract;
    });
    await TokenAdapterRegistry.new({ from: accounts[0] }).then((result) => {
      tokenAdapterRegistry = result.contract;
    });
    await protocolAdapterRegistry.methods
      .addProtocolAdapters(
        [AMUN_BASKET_ADAPTER],
        [protocolAdapterAddress],
        [[DFIAddress]],
      )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods
      .addTokenAdapters(
        [EMPTY_BYTES32, convertToBytes32('Amun Basket Token')],
        [erc20TokenAdapterAddress, tokenAdapterAddress],
      )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods
      .addTokenAdapterNamesByHashes(
        [DFIAddress],
        [convertToBytes32('Amun Basket Token')],
      )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
  });

  it('should return correct underlying tokens for AmunBasket', async () => {
    const result = await tokenAdapterRegistry.methods
      .getFullTokenBalances([DFIAddress])
      .call();
    result[0].underlying.forEach(({ erc20metadata }, index) => {
      assert.deepEqual(erc20metadata, composition[index]);
    });
  });
});
