import displayToken from '../helpers/displayToken';
import convertToShare from '../helpers/convertToShare';
// import expectRevert from '../helpers/expectRevert';

const { BN } = web3.utils;

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
const UniswapV2Adapter = artifacts.require('./UniswapV2LiquidityInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const WethAdapter = artifacts.require('./WethInteractiveAdapter');
const UniswapV2TokenAdapter = artifacts.require('./UniswapV2TokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const Logic = artifacts.require('./Logic');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('UniswapV2LiquidityAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const wethDaiAddress = '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

  let accounts;
  let logic;
  let tokenSpender;
  let adapterRegistry;
  let erc20TokenAdapterAddress;
  let protocolAdapterAddress;
  let uniswapAdapterAddress;
  let wethAdapterAddress;
  let tokenAdapterAddress;
  let DAI;
  let WETH;
  let WETHDAI;
  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await UniswapV2Adapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterAddress = result.address;
      });
    await UniswapV2ExchangeAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapAdapterAddress = result.address;
      });
    await WethAdapter.new({ from: accounts[0] })
      .then((result) => {
        wethAdapterAddress = result.address;
      });
    await UniswapV2TokenAdapter.new({ from: accounts[0] })
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
      [web3.utils.toHex('Uniswap V2'), web3.utils.toHex('Weth')],
      [
        [
          'Mock Protocol Name',
          'Mock protocol description',
          'Mock website',
          'Mock icon',
          '0',
        ],
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
          protocolAdapterAddress, ZERO, uniswapAdapterAddress,
        ],
        [
          wethAdapterAddress,
        ],
      ],
      [
        [
          [wethDaiAddress], [], [],
        ],
        [
          [],
        ],
      ],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20'), web3.utils.toHex('Uniswap V2 Pool Token')],
      [erc20TokenAdapterAddress, tokenAdapterAddress],
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
    await ERC20.at(daiAddress)
      .then((result) => {
        DAI = result.contract;
      });
    await ERC20.at(wethAddress)
      .then((result) => {
        WETH = result.contract;
      });
    await ERC20.at(wethDaiAddress)
      .then((result) => {
        WETHDAI = result.contract;
      });
  });

  it('should buy 1 UNI-V2 with existing dai and weth', async () => {
    // exchange 1 ETH to WETH like we had WETH initially
    await tokenSpender.methods.startExecution(
      // actions
      [
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Weth'),
          ADAPTER_ASSET,
          [ethAddress],
          [web3.utils.toWei('1', 'ether')],
          [AMOUNT_ABSOLUTE],
          EMPTY_BYTES,
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
    await WETH.methods.approve(tokenSpender.options.address, web3.utils.toWei('0.3', 'ether'))
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    await tokenSpender.methods.startExecution(
      // actions
      [
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Uniswap V2'),
          ADAPTER_EXCHANGE,
          [],
          [web3.utils.toWei('0.3', 'ether')],
          [AMOUNT_ABSOLUTE],
          web3.eth.abi.encodeParameter('address[]', [wethAddress, daiAddress]),
        ],
      ],
      // inputs
      [
        [wethAddress, web3.utils.toWei('0.3', 'ether'), AMOUNT_ABSOLUTE, 0, ZERO],
      ],
      // outputs
      [],
    )
      .send({
        gas: 10000000,
        from: accounts[0],
      });
    let daiAmount;
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount before is     ${web3.utils.fromWei(result, 'ether')}`);
        daiAmount = result;
      });
    await DAI.methods.approve(tokenSpender.options.address, daiAmount.toString())
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    let wethAmount;
    await WETH.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`weth amount before is    ${web3.utils.fromWei(result, 'ether')}`);
        wethAmount = result;
      });
    await WETH.methods.approve(tokenSpender.options.address, wethAmount.toString())
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    await WETHDAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`wethdai amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    const wethDaiAmount = web3.utils.toWei('1', 'ether');
    await adapterRegistry.methods.getFullTokenBalances(
      [web3.utils.toHex('Uniswap V2 Pool Token')],
      [wethDaiAddress],
    )
      .call()
      .then((result) => {
        let wethFirst = result[0].underlying[0].metadata.tokenAddress === wethAddress;
        wethAmount = new BN(result[0].underlying[wethFirst ? 0 : 1].amount)
          .mul(new BN(wethDaiAmount))
          .div(new BN('10').pow(new BN('18')));
        daiAmount = new BN(result[0].underlying[wethFirst ? 1 : 0].amount)
          .mul(new BN(wethDaiAmount))
          .div(new BN('10').pow(new BN('18')));
      });
    await tokenSpender.methods.startExecution(
      [
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Uniswap V2'),
          ADAPTER_ASSET,
          [],
          [],
          [],
          web3.eth.abi.encodeParameters(
            ['address', 'uint256'],
            [wethDaiAddress, wethDaiAmount],
          ),
        ],
      ],
      [
        [daiAddress, daiAmount.mul(new BN('101')).div(new BN('100')).toString(), AMOUNT_ABSOLUTE, 0, ZERO],
        [wethAddress, wethAmount.mul(new BN('101')).div(new BN('100')).toString(), AMOUNT_ABSOLUTE, 0, ZERO],
      ],
      [
        [wethDaiAddress, wethDaiAmount],
      ],
    )
      .send({
        from: accounts[0],
        gas: 1000000,
      })
      .then((receipt) => {
        console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
      });
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount after is     ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WETH.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`weth amount after is    ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WETHDAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`wethdai amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await DAI.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await WETH.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await WETHDAI.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
  });

  it('should sell 100% DAIUNI', async () => {
    let wethDaiAmount;
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WETH.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`weth amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await adapterRegistry.methods['getBalances(address)'](accounts[0])
      .call()
      .then(async (result) => {
        await displayToken(adapterRegistry, result[0].adapterBalances[0].balances[0]);
        wethDaiAmount = result[0].adapterBalances[0].balances[0].amount;
      });
    await WETHDAI.methods.approve(tokenSpender.options.address, wethDaiAmount.toString())
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    await tokenSpender.methods.startExecution(
      [
        [
          ACTION_WITHDRAW,
          web3.utils.toHex('Uniswap V2'),
          ADAPTER_ASSET,
          [wethDaiAddress],
          [convertToShare(1)],
          [AMOUNT_RELATIVE],
          EMPTY_BYTES,
        ],
      ],
      [
        [wethDaiAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
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
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount after is     ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WETH.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`weth amount after is    ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WETHDAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`wethdai amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await DAI.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await WETH.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await WETHDAI.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
  });
});
