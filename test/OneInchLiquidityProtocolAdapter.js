import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('OneInchLiquidityProtocolAdapter');
const TokenAdapter = artifacts.require('OneInchLiquidityProtocolTokenAdapter');
const CompoundTokenAdapter = artifacts.require('CompoundTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('OneInchLiquidityProtocolAdapter', () => {
  const usdcEthAddress = '0xbbcaf4dc53befcb85deb56edd9ff37efaeb00e74';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const testAddress = '0xCC6c1D21e8474b3578E69eB036C712AB08fFdfBb';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let tokenAdapter;
  let cTokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const usdcEthMooni = [
    usdcEthAddress,
    '1inch Liquidity Pool (ETH-USDC)',
    '1LP-ETH-USDC',
    '18',
  ];
  const usdc = [
    usdcAddress,
    'USD//C',
    'USDC',
    '6',
  ];
  const eth = [
    ethAddress,
    'Ether',
    'ETH',
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
        console.dir(result, { depth: null })
      });
  });
});
