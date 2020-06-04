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
const CurveAdapter = artifacts.require('./CurveLiquidityInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const WethAdapter = artifacts.require('./WethInteractiveAdapter');
const CurveTokenAdapter = artifacts.require('./CurveTokenAdapter');
const CTokenAdapter = artifacts.require('./CompoundTokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const Logic = artifacts.require('./Logic');
const TokenSpender = artifacts.require('./TokenSpender');
const ERC20 = artifacts.require('./ERC20');

contract.only('CurveLiquidityAdapter', () => {
  const cPoolToken = '0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2';
  const tPoolToken = '0x9fC689CCaDa600B6DF723D9E47D84d76664a1F23';
  const yPoolToken = '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8';
  const bPoolToken = '0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B';
  const sPoolToken = '0xC25a3A3b969415c80451098fa907EC722572917F';
  const pPoolToken = '0xD905e2eaeBe188fc92179b6350807D8bd91Db0D8';
  const renPoolToken = '0x7771F704490F9C0C3B06aFe8960dBB6c58CBC812';

  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
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
  let cTokenAdapterAddress;
  let DAI;
  let WETH;
  let poolTokenAddress;
  let poolToken;
  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await CurveAdapter.new({ from: accounts[0] })
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
    await CurveTokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapterAddress = result.address;
      });
    await ERC20TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        erc20TokenAdapterAddress = result.address;
      });
    await CTokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        cTokenAdapterAddress = result.address;
      });
    await AdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        adapterRegistry = result.contract;
      });
    await adapterRegistry.methods.addProtocols(
      [
        web3.utils.toHex('Uniswap V2'),
        web3.utils.toHex('Weth'),
        web3.utils.toHex('Curve'),
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
          ZERO, ZERO, uniswapAdapterAddress,
        ],
        [
          wethAdapterAddress,
        ],
        [
          protocolAdapterAddress,
        ],
      ],
      [
        [
          [], [], [],
        ],
        [
          [],
        ],
        [
          [
            cPoolToken,
            tPoolToken,
            yPoolToken,
            bPoolToken,
            sPoolToken,
            pPoolToken,
            renPoolToken,
          ],
        ],
      ],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [
        web3.utils.toHex('ERC20'),
        web3.utils.toHex('Curve Pool Token'),
        web3.utils.toHex('CToken'),
      ],
      [
        erc20TokenAdapterAddress,
        tokenAdapterAddress,
        cTokenAdapterAddress,
      ],
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
    await TokenSpender.new(
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
    poolTokenAddress = cPoolToken;
    await ERC20.at(poolTokenAddress)
      .then((result) => {
        poolToken = result.contract;
      });
  });

  it('should buy curve pool for 100 dai', async () => {
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
    await WETH.methods.approve(tokenSpender.options.address, web3.utils.toWei('1', 'ether'))
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
          [web3.utils.toWei('1', 'ether')],
          [AMOUNT_ABSOLUTE],
          web3.eth.abi.encodeParameter('address[]', [wethAddress, daiAddress]),
        ],
      ],
      // inputs
      [
        [wethAddress, web3.utils.toWei('1', 'ether'), AMOUNT_ABSOLUTE, 0, ZERO],
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
        console.log(`       dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
        daiAmount = result;
      });
    await DAI.methods.approve(tokenSpender.options.address, daiAmount.toString())
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    await poolToken.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`pool token amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await tokenSpender.methods.startExecution(
      [
        [
          ACTION_DEPOSIT,
          web3.utils.toHex('Curve'),
          ADAPTER_ASSET,
          [daiAddress],
          [web3.utils.toWei('100', 'ether')],
          [AMOUNT_ABSOLUTE],
          web3.eth.abi.encodeParameter(
            'address',
            poolTokenAddress,
          ),
        ],
      ],
      [
        [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE, 0, ZERO],
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
        console.log(`       dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await poolToken.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`pool token amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await DAI.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await poolToken.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
  });

  it('should sell 100% of pool tokens', async () => {
    let poolAmount;
    await DAI.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`       dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await poolToken.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        poolAmount = result;
        console.log(`pool token amount before is ${web3.utils.fromWei(result, 'ether')}`);
      });
    // await adapterRegistry.methods['getBalances(address)'](accounts[0])
    //   .call()
    //   .then(async (result) => {
    //     await displayToken(adapterRegistry, result[0].adapterBalances[0].balances[0]);
    //   });
    await poolToken.methods.approve(tokenSpender.options.address, poolAmount.toString())
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    await tokenSpender.methods.startExecution(
      [
        [
          ACTION_WITHDRAW,
          web3.utils.toHex('Curve'),
          ADAPTER_ASSET,
          [poolTokenAddress],
          [convertToShare(1)],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter(
            'address',
            daiAddress,
          ),
        ],
      ],
      [
        [poolTokenAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
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
        console.log(`       dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await poolToken.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        console.log(`pool token amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    await DAI.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
    await poolToken.methods['balanceOf(address)'](logic.options.address)
      .call()
      .then((result) => {
        assert.equal(result, 0);
      });
  });
});
