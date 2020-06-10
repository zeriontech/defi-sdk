import displayToken from '../helpers/displayToken';
// import expectRevert from '../helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';

// const { BN } = web3.utils;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';
const ADAPTER_ASSET = 0;
// const ADAPTER_DEBT = 1;
const ADAPTER_EXCHANGE = 2;

const ZERO = '0x0000000000000000000000000000000000000000';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const UniswapV1Adapter = artifacts.require('./UniswapV1LiquidityInteractiveAdapter');
const UniswapV1ExchangeAdapter = artifacts.require('./UniswapV1ExchangeInteractiveAdapter');
const UniswapV1TokenAdapter = artifacts.require('./UniswapV1TokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('UniswapV1LiquidityAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const daiUniAddress = '0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  let accounts;
  let core;
  let tokenSpender;
  let adapterRegistry;
  let erc20TokenAdapterAddress;
  let protocolAdapterAddress;
  let uniswapAdapterAddress;
  let tokenAdapterAddress;
  let DAI;
  let DAIUNI;
  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await UniswapV1Adapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterAddress = result.address;
      });
    await UniswapV1ExchangeAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapAdapterAddress = result.address;
      });
    await UniswapV1TokenAdapter.new({ from: accounts[0] })
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
      [web3.utils.toHex('Uniswap V1')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        protocolAdapterAddress, ZERO, uniswapAdapterAddress,
      ]],
      [[
        [daiUniAddress], [], [],
      ]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20'), web3.utils.toHex('Uniswap V1 Pool Token')],
      [erc20TokenAdapterAddress, tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await Core.new(
      adapterRegistry.options.address,
      { from: accounts[0] },
    )
      .then((result) => {
        core = result.contract;
      });
    await Router.new(
      core.options.address,
      { from: accounts[0] },
    )
      .then((result) => {
        tokenSpender = result.contract;
      });
    await ERC20.at(daiAddress)
      .then((result) => {
        DAI = result.contract;
      });
    await ERC20.at(daiUniAddress)
      .then((result) => {
        DAIUNI = result.contract;
      });
  });

  it('should be correct addLiquidity call transfer with 0.1 ETH / 20 DAI', async () => {
    await tokenSpender.methods.startExecution(
      // actions
      [
        // exchange 1 ETH to DAI like we had dai initially
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Uniswap V1'),
          ADAPTER_EXCHANGE,
          [ethAddress],
          ['1000000000000000000'],
          [AMOUNT_ABSOLUTE],
          web3.eth.abi.encodeParameter('address', daiAddress),
        ],
      ],
      // inputs
      [],
      // outputs
      [],
    )
      .send({
        from: accounts[0],
        gas: 10000000,
        value: web3.utils.toWei('1', 'ether'),
      });
    let daiAmount;
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount before is    ${web3.utils.fromWei(result, 'ether')}`);
        daiAmount = result;
      });
    await DAI.methods.approve(tokenSpender.options.address, daiAmount.toString())
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    await DAIUNI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`daiuni amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await tokenSpender.methods.startExecution(
      [
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Uniswap V1'),
          ADAPTER_ASSET,
          [ethAddress, daiAddress],
          [web3.utils.toWei('0.1', 'ether'), convertToShare(1)],
          [AMOUNT_ABSOLUTE, AMOUNT_RELATIVE],
          EMPTY_BYTES,
        ],
      ],
      [
        [daiAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
      ],
      [],
    )
      .send({
        from: accounts[0],
        value: web3.utils.toWei('0.1', 'ether'),
        gas: 1000000,
      })
      .then((receipt) => {
        console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
      });
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount after is    ${web3.utils.fromWei(result, 'ether')}`);
      });
    await DAIUNI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`daiuni amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
  });

  it('should be correct removeLiquidity call transfer with 100% DAIUNI', async () => {
    let daiUniAmount;
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await adapterRegistry.methods['getBalances(address)'](accounts[0])
      .call()
      .then(async (result) => {
        await displayToken(adapterRegistry, result[0].adapterBalances[0].balances[0]);
        daiUniAmount = result[0].adapterBalances[0].balances[0].amount;
      });
    await DAIUNI.methods.approve(tokenSpender.options.address, daiUniAmount.toString())
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    console.log('calling core with action...');
    await tokenSpender.methods.startExecution(
      [
        [
          ACTION_WITHDRAW,
          web3.utils.toHex('Uniswap V1'),
          ADAPTER_ASSET,
          [daiUniAddress],
          [convertToShare(1)],
          [AMOUNT_RELATIVE],
          EMPTY_BYTES,
        ],
      ],
      [
        [daiUniAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
      ],
      [],
    )
      .send({
        from: accounts[0],
        gas: 1000000,
      })
      .then((receipt) => {
        console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
      });
    await adapterRegistry.methods.getBalances(accounts[0])
      .call()
      .then(async (result) => {
        assert.equal(result.length, 0);
      });
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await DAIUNI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai uni amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
  });
});
