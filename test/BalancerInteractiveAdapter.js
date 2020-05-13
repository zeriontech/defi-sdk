const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const RELATIVE_AMOUNT_BASE = '1000000000000000000';
const EMPTY_BYTES = '0x';
const ADAPTER_ASSET = 0;
// const ADAPTER_DEBT = 1;
const ADAPTER_EXCHANGE = 2;

const ZERO = '0x0000000000000000000000000000000000000000';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const UniswapV1Adapter = artifacts.require('./UniswapV1ExchangeInteractiveAdapter');
const BalancerAdapter = artifacts.require('./BalancerInteractiveAdapter');
const BalancerTokenAdapter = artifacts.require('./BalancerTokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const Logic = artifacts.require('./Logic');
const ERC20 = artifacts.require('./ERC20');

contract.only('BalancerLiquidityInteractiveAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const mkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const poolAddress = '0x987D7Cc04652710b74Fff380403f5c02f82e290a';

  let accounts;
  let logic;
  let tokenSpender;
  let adapterRegistry;
  let uniswapAdapterAddress;
  let balancerAdapterAddress;
  let balancerTokenAdapterAddress;
  let erc20TokenAdapterAddress;

  let DAI;
  let pool;
  let MKR;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await UniswapV1Adapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapAdapterAddress = result.address;
      });
    await BalancerAdapter.new({ from: accounts[0] })
      .then((result) => {
        balancerAdapterAddress = result.address;
      });
    await BalancerTokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        balancerTokenAdapterAddress = result.address;
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
      [web3.utils.toHex('Uniswap'), web3.utils.toHex('Balancer')],
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
          ZERO, ZERO, uniswapAdapterAddress,
        ],
        [
          balancerAdapterAddress,
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
      [web3.utils.toHex('ERC20'), web3.utils.toHex('Balancer pool token')],
      [erc20TokenAdapterAddress, balancerTokenAdapterAddress],
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

    await ERC20.at(daiAddress)
      .then((result) => {
        DAI = result.contract;
      });
    await ERC20.at(mkrAddress)
      .then((result) => {
        MKR = result.contract;
      });
    await ERC20.at(poolAddress)
      .then((result) => {
        pool = result.contract;
      });
  });

  it('DAI -> MKR+WETH pool', async () => {
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount before is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await MKR.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`mkr amount before is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await pool.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`pool amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await web3.eth.getBalance(accounts[0])
      .then((result) => {
        console.log(`eth amount before is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    console.log('calling logic with actions...');
    await logic.methods.executeActions(
      [
        // exchange eth to dai like we had dai initially
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Uniswap'),
          ADAPTER_EXCHANGE,
          [ethAddress],
          ['1000000000000000000'],
          [AMOUNT_ABSOLUTE],
          web3.eth.abi.encodeParameter('address', daiAddress),
        ],
        // exchange dai to mkr to make swap
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Uniswap'),
          ADAPTER_EXCHANGE,
          [daiAddress],
          ['100000000000000000000'], // 100 DAI
          [AMOUNT_ABSOLUTE],
          web3.eth.abi.encodeParameter('address', mkrAddress),
        ],
        // deposit to pool using dai
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Balancer'),
          ADAPTER_ASSET,
          [mkrAddress],
          [RELATIVE_AMOUNT_BASE], // all MKR
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', poolAddress),
        ],
      ],
      [],
    )
      .send({
        from: accounts[0],
        gas: 10000000,
        value: '1000000000000000000',
      });
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount after is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await MKR.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`mkr amount after is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await pool.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`pool amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await web3.eth.getBalance(accounts[0])
      .then((result) => {
        console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
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
    await pool.methods['balanceOf(address)'](logic.options.address)
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
    let poolAmount;
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount before is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await MKR.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`mkr amount before is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await pool.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`pool amount before is ${web3.utils.fromWei(result, 'ether')}`);
        poolAmount = result;
      });
    await web3.eth.getBalance(accounts[0])
      .then((result) => {
        console.log(`eth amount before is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await pool.methods['approve(address,uint256)'](tokenSpender, poolAmount)
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    console.log('calling logic with actions...');
    await logic.methods.executeActions(
      [
        // exchange eth to dai like we had dai initially
        [
          ACTION_WITHDRAW,
          web3.utils.toHex('Balancer'),
          ADAPTER_ASSET,
          [poolAddress],
          [RELATIVE_AMOUNT_BASE],
          [AMOUNT_RELATIVE],
          EMPTY_BYTES,
        ],
        // exchange MKR to DAI to make swap
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Uniswap'),
          ADAPTER_EXCHANGE,
          [mkrAddress],
          [RELATIVE_AMOUNT_BASE], // all MKR
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', daiAddress),
        ],
        // exchange WETH to DAI to make swap (TODO WETH->ETH->DAI)
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Uniswap'),
          ADAPTER_EXCHANGE,
          [wethAddress],
          [RELATIVE_AMOUNT_BASE], // all WETH
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', daiAddress),
        ],
      ],
      [
        [poolAddress, poolAmount, AMOUNT_ABSOLUTE, 0, 0, ZERO],
      ],
    )
      .send({
        from: accounts[0],
        gas: 10000000,
      });
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`dai amount after is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await MKR.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`mkr amount after is  ${web3.utils.fromWei(result, 'ether')}`);
      });
    await pool.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`pool amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await web3.eth.getBalance(accounts[0])
      .then((result) => {
        console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
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
    await pool.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await web3.eth.getBalance(logic.options.address)
      .then((result) => {
        assert.equal(result, 0);
      });
  });
});
