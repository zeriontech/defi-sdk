import convertToShare from '../helpers/convertToShare';

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
// const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';
const ADAPTER_ASSET = 0;
// const ADAPTER_DEBT = 1;
const ADAPTER_EXCHANGE = 2;

const ZERO = '0x0000000000000000000000000000000000000000';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const TokenSetsAdapter = artifacts.require('./TokenSetsInteractiveAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const WethInteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const UniswapV1ExchangeAdapter = artifacts.require('./UniswapV1ExchangeInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract.only('Scenario ETH -> WETH/LINK set', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const linkAddress = '0x514910771AF9Ca656af840dff83E8264EcF986CA';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const setAddress = '0xc166f976ce9926a3205b145af104eb0e4b38b5c0';

  let accounts;
  let core;
  let adapterRegistry;
  let tokenSpender;
  let tokenSetsAdapterAddress;
  let wethAdapterAddress;
  let uniswapAdapterAddress;
  let erc20TokenAdapterAddress;

  let LINK;
  let WETH;
  let SET;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await TokenSetsAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenSetsAdapterAddress = result.address;
      });
    await WethInteractiveAdapter.new({ from: accounts[0] })
      .then((result) => {
        wethAdapterAddress = result.address;
      });
    await UniswapV1ExchangeAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapAdapterAddress = result.address;
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
      [
        web3.utils.toHex('TokenSets'),
        web3.utils.toHex('Weth'),
        web3.utils.toHex('Uniswap V1'),
      ],
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
          tokenSetsAdapterAddress,
        ],
        [
          ZERO, ZERO, wethAdapterAddress,
        ],
        [
          ZERO, ZERO, uniswapAdapterAddress,
        ],
      ],
      [
        [[]],
        [[], [], []],
        [[], [], []],
      ],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [erc20TokenAdapterAddress],
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
    await ERC20.at(linkAddress)
      .then((result) => {
        LINK = result.contract;
      });
    await ERC20.at(wethAddress)
      .then((result) => {
        WETH = result.contract;
      });
    await ERC20.at(setAddress)
      .then((result) => {
        SET = result.contract;
      });
  });

  it('main test', async () => {
    await web3.eth.getBalance(accounts[0])
      .then((result) => {
        console.log(`eth amount before is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WETH.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`weth amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await LINK.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`link amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await SET.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`set amount before is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    const actions = [
      // exchange ETH to LINK
      [
        ACTION_DEPOSIT,
        web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('Uniswap V1')),
        ADAPTER_EXCHANGE,
        [ethAddress],
        [convertToShare(0.5)],
        [AMOUNT_RELATIVE],
        web3.eth.abi.encodeParameter('address', linkAddress),
      ],
      // exchange ETH to WETH
      [
        ACTION_DEPOSIT,
        web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('Weth')),
        ADAPTER_EXCHANGE,
        [ethAddress],
        [convertToShare(1)], // 100% of the remaining
        [AMOUNT_RELATIVE],
        EMPTY_BYTES,
      ],
      [
        ACTION_DEPOSIT,
        web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('TokenSets')),
        ADAPTER_ASSET,
        [
          wethAddress,
          linkAddress,
        ],
        [
          convertToShare(1),
          convertToShare(1),
        ],
        [
          AMOUNT_RELATIVE,
          AMOUNT_RELATIVE,
        ],
        web3.eth.abi.encodeParameter(
          'address',
          setAddress,
        ),
      ],
    ];
    // console.log(actions);
    await tokenSpender.methods.startExecution(
      actions,
      [],
      [],
    )
      .send({
        from: accounts[0],
        gas: 5000000,
        value: web3.utils.toWei('1', 'ether'),
      })
      .then((receipt) => {
        console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
      });
    // console.log(tokenSpender.methods.startExecution(
    //   actions,
    //   [],
    // ).encodeABI());
    await web3.eth.getBalance(accounts[0])
      .then((result) => {
        console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WETH.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`weth amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await LINK.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`link amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await SET.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`set amount after is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WETH.methods['balanceOf(address)'](core.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await LINK.methods['balanceOf(address)'](core.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await SET.methods['balanceOf(address)'](core.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await web3.eth.getBalance(core.options.address)
      .then((result) => {
        assert.equal(result, 0);
      });
  });

  it('reverse test', async () => {
    let setAmount;
    await web3.eth.getBalance(accounts[0])
      .then((result) => {
        console.log(`eth amount before is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WETH.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`weth amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await LINK.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`link amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await SET.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`set amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        setAmount = result;
      });
    await SET.methods.approve(tokenSpender.options.address, setAmount)
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    const actions = [
      // withdraw to all sets
      [
        ACTION_WITHDRAW,
        web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('TokenSets')),
        ADAPTER_ASSET,
        [
          setAddress,
        ],
        [
          convertToShare(1),
        ],
        [
          AMOUNT_RELATIVE,
        ],
        EMPTY_BYTES,
      ],
      // swap change (in LINK) back to ETH
      [
        ACTION_DEPOSIT,
        web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('Uniswap V1')),
        ADAPTER_EXCHANGE,
        [linkAddress],
        [convertToShare(1)],
        [AMOUNT_RELATIVE],
        web3.eth.abi.encodeParameter('address', ethAddress),
      ],
      // swap change (in WETH) back to ETH
      [
        ACTION_WITHDRAW,
        web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('Weth')),
        ADAPTER_EXCHANGE,
        [wethAddress],
        [convertToShare(1)],
        [AMOUNT_RELATIVE],
        EMPTY_BYTES,
      ],
    ];
    // console.log(actions);
    await tokenSpender.methods.startExecution(
      actions,
      [
        [setAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
      ],
      [],
    )
      .send({
        from: accounts[0],
        gas: 5000000,
      })
      .then((receipt) => {
        console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
      });
    // console.log(tokenSpender.methods.startExecution(
    //   actions,
    //   [],
    // ).encodeABI());
    await web3.eth.getBalance(accounts[0])
      .then((result) => {
        console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WETH.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`weth amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await LINK.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`link amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await SET.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`set amount after is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WETH.methods['balanceOf(address)'](core.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await LINK.methods['balanceOf(address)'](core.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await SET.methods['balanceOf(address)'](core.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await web3.eth.getBalance(core.options.address)
      .then((result) => {
        assert.equal(result, 0);
      });
  });
});
