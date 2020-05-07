const ACTION_DEPOSIT = 1;
// const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
// const AMOUNT_ABSOLUTE = 2;
const RELATIVE_AMOUNT_BASE = '1000000000000000000';
// const EMPTY_BYTES = '0x';
const ADAPTER_ASSET = 0;
// const ADAPTER_DEBT = 1;
const ADAPTER_EXCHANGE = 2;

const ZERO = '0x0000000000000000000000000000000000000000';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const TokenSetsAdapter = artifacts.require('./TokenSetsInteractiveAdapter');
const OneSplitAdapter = artifacts.require('./OneSplitInteractiveAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const Logic = artifacts.require('./Logic');
const ERC20 = artifacts.require('./ERC20');

contract('Scenario ETH -> WETH/WBTC set', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wbtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const setAddress = '0xA6c040045d962e4B8eFa00954c7d23CCd0a2b8AD';

  let accounts;
  let logic;
  let adapterRegistry;
  let tokenSetsAdapterAddress;
  let oneSplitAdapterAddress;
  let erc20TokenAdapterAddress;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await TokenSetsAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenSetsAdapterAddress = result.address;
      });
    await OneSplitAdapter.new({ from: accounts[0] })
      .then((result) => {
        oneSplitAdapterAddress = result.address;
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
      [web3.utils.toHex('OneSplit'), web3.utils.toHex('TokenSets')],
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
          ZERO, ZERO, oneSplitAdapterAddress,
        ],
        [
          tokenSetsAdapterAddress,
        ],
      ],
      [
        [[], [], []],
        [[]],
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
    await Logic.new(
      adapterRegistry.options.address,
      { from: accounts[0] },
    )
      .then((result) => {
        logic = result.contract;
      });
    await logic.methods.tokenSpender()
      .call({ gas: 1000000 });
  });

  it('main test', async () => {
    let WBTC;
    let WETH;
    let SET;
    await ERC20.at(wbtcAddress)
      .then((result) => {
        WBTC = result.contract;
      });
    await ERC20.at(wethAddress)
      .then((result) => {
        WETH = result.contract;
      });
    await ERC20.at(setAddress)
      .then((result) => {
        SET = result.contract;
      });
    await web3.eth.getBalance(accounts[0])
      .then((result) => {
        console.log(`eth amount before is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WETH.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`weth amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WBTC.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`wbtc amount before is ${web3.utils.fromWei(result, 'gwei') * 10}`);
      });
    await SET.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`set amount before is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    console.log('calling logic with actions...');
    const actions = [
      // // exchange ETH to WBTC
      [
        ACTION_DEPOSIT,
        web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('OneSplit')),
        ADAPTER_EXCHANGE,
        [ethAddress],
        [web3.utils.toWei('0.24', 'ether')],
        [AMOUNT_RELATIVE],
        web3.eth.abi.encodeParameter('address', wbtcAddress),
      ],
      // exchange ETH to WETH
      [
        ACTION_DEPOSIT,
        web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('OneSplit')),
        ADAPTER_EXCHANGE,
        [ethAddress],
        [web3.utils.toWei('1', 'ether')], // 100% of the remaining
        [AMOUNT_RELATIVE],
        web3.eth.abi.encodeParameter('address', wethAddress),
      ],
      // deposit to token set (1 full share of SetToken)
      [
        ACTION_DEPOSIT,
        web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('TokenSets')),
        ADAPTER_ASSET,
        [
          wethAddress,
          wbtcAddress,
        ],
        [
          RELATIVE_AMOUNT_BASE,
          RELATIVE_AMOUNT_BASE,
        ],
        [
          AMOUNT_RELATIVE,
          AMOUNT_RELATIVE,
        ],
        web3.eth.abi.encodeParameters(
          ['address', 'uint256'],
          [setAddress, web3.utils.toWei('0.01', 'ether')],
        ),
      ],
      // swap change (in WBTC) back to ETH
      [
        ACTION_DEPOSIT,
        web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('OneSplit')),
        ADAPTER_EXCHANGE,
        [wbtcAddress],
        [RELATIVE_AMOUNT_BASE],
        [AMOUNT_RELATIVE],
        web3.eth.abi.encodeParameter('address', ethAddress),
      ],
      // swap change (in WETH) back to ETH
      [
        ACTION_DEPOSIT,
        web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('OneSplit')),
        ADAPTER_EXCHANGE,
        [wethAddress],
        [RELATIVE_AMOUNT_BASE],
        [AMOUNT_RELATIVE],
        web3.eth.abi.encodeParameter('address', ethAddress),
      ],
    ];
    console.log(actions);
    // await logic.methods.executeActions(
    //   actions,
    //   [],
    // )
    //   .send({
    //     from: accounts[0],
    //     gas: 5000000,
    //     value: web3.utils.toWei('1', 'ether'),
    //   });
    console.log(logic.methods.executeActions(
      actions,
      [],
    ).encodeABI());
    await web3.eth.getBalance(accounts[0])
      .then((result) => {
        console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WETH.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`weth amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WBTC.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`wbtc amount after is ${web3.utils.fromWei(result, 'gwei') * 10}`);
      });
    await SET.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`set amount after is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await WETH.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await WBTC.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await SET.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await web3.eth.getBalance(logic.options.address)
      .then((result) => {
        assert.equal(result, 0);
      });
  });

  it('reverse test', async () => {

  });
});
