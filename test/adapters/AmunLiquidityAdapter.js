/* eslint-disable no-unused-vars */
import displayToken from '../helpers/displayToken';
import convertToBytes32 from '../helpers/convertToBytes32';

const ASSET_ADAPTER = '01';

const ProtocolAdapterRegistry = artifacts.require('ProtocolAdapterRegistry');
const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');
const ProtocolAdapter = artifacts.require('ERC20ProtocolAdapter');
const TokenAdapter = artifacts.require('AmunLiquidityAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

const EMPTY_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

contract.only('AmunLiquidityAdapter', () => {
  const composition = [['USD Coin', 'USDC', '6']];
  const mineAddress = '0x9D895763488a9f60D1882296cBe23399f974E10d';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  let tokenAdapterRegistry;

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

    await tokenAdapterRegistry.methods
      .addTokenAdapters(
        [EMPTY_BYTES32, convertToBytes32('Amun Liquidity Token')],
        [erc20TokenAdapterAddress, tokenAdapterAddress],
      )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods
      .addTokenAdapterNamesByHashes(
        [mineAddress],
        [convertToBytes32('Amun Liquidity Token')],
      )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
  });

  it.only('should return correct underlying tokens for amunLending', async () => {
    const result = await tokenAdapterRegistry.methods
      .getFullTokenBalances([mineAddress])
      .call();
    result[0].underlying.forEach(({ erc20metadata }, index) => {
      assert.deepEqual(erc20metadata, composition[index]);
    });
  });
});
