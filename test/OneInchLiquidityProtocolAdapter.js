const ProtocolAdapter = artifacts.require('OneInchLiquidityProtocolAdapter');
const TokenAdapter = artifacts.require('OneInchLiquidityProtocolTokenAdapter');
const CompoundTokenAdapter = artifacts.require('CompoundTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('OneInchLiquidityProtocolAdapter', () => {
  const usdcEthAddress = '0xbbcaf4dc53befcb85deb56edd9ff37efaeb00e74';

  let accounts;
  let tokenAdapter;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ProtocolAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterAddress = result.address;
      });
    await TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapterAddress = result.address;
        tokenAdapter = result.contract;
      });
    await CompoundTokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        cTokenAdapterAddress = result.address;
      });
    await ERC20TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        erc20TokenAdapterAddress = result.address;
      });
  });

  it('should return correct balances', async () => {
    await tokenAdapter.methods['getComponents(address)'](usdcEthAddress)
      .call()
      .then((result) => {
        console.dir(result, { depth: null });
      });
  });
});
