import convertToBytes32 from '../helpers/convertToBytes32';
import displayToken from '../helpers/displayToken';

const AMUN_LENDING_ADAPTER = convertToBytes32('Amun Lending Adapter');
const EMPTY_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('ProtocolAdapterRegistry');
const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');
const ProtocolAdapter = artifacts.require('ERC20ProtocolAdapter');
const TokenAdapter = artifacts.require('AmunLendingAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('AmunLendingAdapter', () => {
  const DROPAddress = '0x78f9c12e15ec36C2AB1bE0b2e5f79B71A9ECdFC8';

  let accounts;
  let protocolAdapterRegistry;
  let tokenAdapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;

  const composition = [['USD Coin', 'USDC', '6']];

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
        [AMUN_LENDING_ADAPTER],
        [protocolAdapterAddress],
        [[DROPAddress]],
      )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods
      .addTokenAdapters(
        [EMPTY_BYTES32, convertToBytes32('Amun Lending Token')],
        [erc20TokenAdapterAddress, tokenAdapterAddress],
      )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods
      .addTokenAdapterNamesByHashes(
        [DROPAddress],
        [convertToBytes32('Amun Lending Token')],
      )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
  });

  it('should return correct underlying tokens for amunLending', async () => {
    const result = await tokenAdapterRegistry.methods
      .getFullTokenBalances([DROPAddress])
      .call();
    result[0].underlying.forEach(({ erc20metadata }, index) => {
      assert.deepEqual(erc20metadata, composition[index]);
    });
  });
});
