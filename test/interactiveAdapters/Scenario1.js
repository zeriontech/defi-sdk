import convertToShare from '../helpers/convertToShare';

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
const UniswapV1LiquidityAdapter = artifacts.require('./UniswapV1LiquidityInteractiveAdapter');
const UniswapV1ExchangeAdapter = artifacts.require('./UniswapV1ExchangeInteractiveAdapter');
const UniswapV1TokenAdapter = artifacts.require('./UniswapV1TokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const Logic = artifacts.require('./Logic');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('Scenario DAI -> MKR Pool', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const mkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
  const mkrUniAddress = '0x2C4Bd064b998838076fa341A83d007FC2FA50957';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  let accounts;
  let logic;
  let tokenSpender;
  let adapterRegistry;
  let uniswapLiquidityAdapterAddress;
  let uniswapV1ExchangeAdapterAddress;
  let uniswapV1TokenAdapterAddress;
  let erc20TokenAdapterAddress;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await UniswapV1LiquidityAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapLiquidityAdapterAddress = result.address;
      });
    await UniswapV1ExchangeAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapV1ExchangeAdapterAddress = result.address;
      });
    await UniswapV1TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapV1TokenAdapterAddress = result.address;
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
      [
        [
          'Mock Protocol Name',
          'Mock protocol description',
          'Mock website',
          'Mock icon',
          '0',
        ],
      ],
      [
        [
          uniswapLiquidityAdapterAddress, ZERO, uniswapV1ExchangeAdapterAddress,
        ],
      ],
      [
        [[], [], []],
      ],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20'), web3.utils.toHex('Uniswap V1 Pool Token')],
      [erc20TokenAdapterAddress, uniswapV1TokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await Logic.new(
      adapterRegistry.options.address,
      { from: accounts[0] },
    )
      .then((result) => {
        logic = result.contract;
      });
    await Router.new(
      logic.options.address,
      { from: accounts[0] },
    )
      .then((result) => {
        tokenSpender = result.contract;
      });
  });

  it('main test', async () => {
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
    let DAI;
    let MKR;
    let MKRUNI;
    let daiAmount;
    await ERC20.at(daiAddress)
      .then((result) => {
        DAI = result.contract;
      });
    await ERC20.at(mkrAddress)
      .then((result) => {
        MKR = result.contract;
      });
    await ERC20.at(mkrUniAddress)
      .then((result) => {
        MKRUNI = result.contract;
      });
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount before is    ${web3.utils.fromWei(result, 'ether')}`);
        daiAmount = result;
      });
    await MKR.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`mkr amount before is    ${web3.utils.fromWei(result, 'ether')}`);
      });
    await MKRUNI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`mkruni amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await DAI.methods.approve(tokenSpender.options.address, daiAmount.toString())
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    await tokenSpender.methods.startExecution(
      [
        // exchange 50,2% to MKR tokens
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Uniswap V1'),
          ADAPTER_EXCHANGE,
          [daiAddress],
          [convertToShare(0.502)],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', mkrAddress),
        ],
        // exchange remaining to ETH
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Uniswap V1'),
          ADAPTER_EXCHANGE,
          [daiAddress],
          [convertToShare(1)],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', ethAddress),
        ],
        // deposit to Uniswap
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Uniswap V1'),
          ADAPTER_ASSET,
          [ethAddress, mkrAddress],
          [convertToShare(1), convertToShare(1)],
          [AMOUNT_RELATIVE, AMOUNT_RELATIVE],
          EMPTY_BYTES,
        ],
      ],
      [
        [daiAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
      ],
      [
      ],
    )
      .send({
        from: accounts[0],
        gas: 10000000,
      })
      .then((receipt) => {
        console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
      });
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount after is    ${web3.utils.fromWei(result, 'ether')}`);
      });
    await MKR.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`mkr amount after is    ${web3.utils.fromWei(result, 'ether')}`);
      });
    await MKRUNI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`mkruni amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await DAI.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await MKR.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await MKRUNI.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
  });

  it('reverse test', async () => {
    let DAI;
    let MKR;
    let MKRUNI;
    let mkrUniAmount;
    await ERC20.at(daiAddress)
      .then((result) => {
        DAI = result.contract;
      });
    await ERC20.at(mkrAddress)
      .then((result) => {
        MKR = result.contract;
      });
    await ERC20.at(mkrUniAddress)
      .then((result) => {
        MKRUNI = result.contract;
      });
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount before is    ${web3.utils.fromWei(result, 'ether')}`);
      });
    await MKR.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`mkr amount before is    ${web3.utils.fromWei(result, 'ether')}`);
      });
    await MKRUNI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`mkruni amount before is ${web3.utils.fromWei(result, 'ether')}`);
        mkrUniAmount = result;
      });
    await MKRUNI.methods.approve(tokenSpender.options.address, mkrUniAmount.toString())
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    await tokenSpender.methods.startExecution(
      [
        // withdraw MKRUNI tokens
        [
          ACTION_WITHDRAW,
          web3.utils.toHex('Uniswap V1'),
          ADAPTER_ASSET,
          [mkrUniAddress],
          [convertToShare(1)],
          [AMOUNT_RELATIVE],
          EMPTY_BYTES,
        ],
        // exchange remaining ETH to DAI
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Uniswap V1'),
          ADAPTER_EXCHANGE,
          [ethAddress],
          [convertToShare(1)],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', daiAddress),
        ],
        // exchange remaining MKR to DAI
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Uniswap V1'),
          ADAPTER_EXCHANGE,
          [mkrAddress],
          [convertToShare(1)],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', daiAddress),
        ],
      ],
      [
        [mkrUniAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
      ],
      [],
    )
      .send({
        from: accounts[0],
        gas: 10000000,
      })
      .then((receipt) => {
        console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
      });
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount after is     ${web3.utils.fromWei(result, 'ether')}`);
      });
    await MKR.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`mkr amount after is     ${web3.utils.fromWei(result, 'ether')}`);
      });
    await MKRUNI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`mkruni amount after is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await DAI.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await MKR.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await MKRUNI.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
  });
});
