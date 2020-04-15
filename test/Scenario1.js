const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
// const AMOUNT_ABSOLUTE = 2;
const RELATIVE_AMOUNT_BASE = '1000000000000000000';
const EMPTY_BYTES = '0x';
const ADAPTER_ASSET = 0;
// const ADAPTER_DEBT = 1;
const ADAPTER_EXCHANGE = 2;

const ZERO = '0x0000000000000000000000000000000000000000';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const UniswapV1Adapter = artifacts.require('./UniswapV1InteractiveAdapter');
const OneSplitAdapter = artifacts.require('./OneSplitInteractiveAdapter');
const UniswapV1TokenAdapter = artifacts.require('./UniswapV1TokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const Logic = artifacts.require('./Logic');
const ERC20 = artifacts.require('./ERC20');

contract.skip('Scenario DAI -> MKR pool', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const mkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
  const mkrUniAddress = '0x2C4Bd064b998838076fa341A83d007FC2FA50957';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  let accounts;
  let logic;
  let tokenSpender;
  let adapterRegistry;
  let uniswapAdapterAddress;
  let oneSplitAdapterAddress;
  let uniswapV1TokenAdapterAddress;
  let erc20TokenAdapterAddress;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await UniswapV1Adapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapAdapterAddress = result.address;
      });
    await OneSplitAdapter.new({ from: accounts[0] })
      .then((result) => {
        oneSplitAdapterAddress = result.address;
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
      [web3.utils.toHex('Uniswap V1'), web3.utils.toHex('OneSplit')],
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
          uniswapAdapterAddress,
        ],
        [
          ZERO, ZERO, oneSplitAdapterAddress,
        ],
      ],
      [
        [[]],
        [[], [], []],
      ],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20'), web3.utils.toHex('Uniswap V1 pool token')],
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
    await logic.methods.tokenSpender()
      .call({ gas: 1000000 })
      .then((result) => {
        tokenSpender = result;
      });
  });

  it('main test', async () => {
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
    await DAI.methods['approve(address,uint256)'](tokenSpender, daiAmount.toString())
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    console.log('calling logic with actions...');
    await logic.methods.executeActions(
      [
        // exchange 50,2% to MKR tokens
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('OneSplit'),
          ADAPTER_EXCHANGE,
          [daiAddress],
          ['502000000000000000'],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', mkrAddress),
        ],
        // exchange remaining to ETH
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('OneSplit'),
          ADAPTER_EXCHANGE,
          [daiAddress],
          [RELATIVE_AMOUNT_BASE],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', ethAddress),
        ],
        // deposit to uniswap pool
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Uniswap V1'),
          ADAPTER_ASSET,
          [ethAddress, mkrAddress],
          [RELATIVE_AMOUNT_BASE, RELATIVE_AMOUNT_BASE],
          [AMOUNT_RELATIVE, AMOUNT_RELATIVE],
          EMPTY_BYTES,
        ],
        // swap change (in MKR) back to DAI
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('OneSplit'),
          ADAPTER_EXCHANGE,
          [mkrAddress],
          [RELATIVE_AMOUNT_BASE],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', daiAddress),
        ],
      ],
      [
        [daiAddress, RELATIVE_AMOUNT_BASE, AMOUNT_RELATIVE, 0],
      ],
    )
      .send({
        from: accounts[0],
        gas: 10000000,
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
    await MKRUNI.methods['approve(address,uint256)'](tokenSpender, mkrUniAmount.toString())
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    console.log('calling logic with actions...');
    await logic.methods.executeActions(
      [
        // withdraw MKRUNI tokens
        [
          ACTION_WITHDRAW,
          web3.utils.toHex('Uniswap V1'),
          ADAPTER_ASSET,
          [mkrUniAddress],
          [RELATIVE_AMOUNT_BASE],
          [AMOUNT_RELATIVE],
          EMPTY_BYTES,
        ],
        // exchange remaining ETH to DAI
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('OneSplit'),
          ADAPTER_EXCHANGE,
          [ethAddress],
          [RELATIVE_AMOUNT_BASE],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', daiAddress),
        ],
        // exchange remaining MKR to DAI
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('OneSplit'),
          ADAPTER_EXCHANGE,
          [mkrAddress],
          [RELATIVE_AMOUNT_BASE],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', daiAddress),
        ],
      ],
      [
        [mkrUniAddress, RELATIVE_AMOUNT_BASE, AMOUNT_RELATIVE, 0],
      ],
    )
      .send({
        from: accounts[0],
        gas: 10000000,
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
  });
});
