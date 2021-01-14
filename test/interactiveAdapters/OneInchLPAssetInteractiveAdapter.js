// import displayToken from '../helpers/displayToken';
import convertToShare from '../helpers/convertToShare';
// import expectRevert from '../helpers/expectRevert';

const UNISWAP_V2_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('Uniswap V2'),
).slice(0, -2);
const ONE_INCH_LP = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('1inch LP'),
).slice(0, -2);
const WETH_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('Weth'),
).slice(0, -2);
const ASSET_ADAPTER = '01';
const EXCHANGE_ADAPTER = '03';
const ONE_INCH_LP_ASSET_ADAPTER = `${ONE_INCH_LP}${ASSET_ADAPTER}`;
const UNISWAP_V2_EXCHANGE_ADAPTER = `${UNISWAP_V2_ADAPTER}${EXCHANGE_ADAPTER}`;
const WETH_ASSET_ADAPTER = `${WETH_ADAPTER}${ASSET_ADAPTER}`;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const UniswapV2Adapter = artifacts.require('./OneInchLPAssetInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const WethAdapter = artifacts.require('./WethInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract.only('OneInchLPAssetInteractiveAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const oneInchAddress = '0x111111111117dC0aa78b770fA6A738034120C302';
  const oneInchDaiAddress = '0x7566126f2fD0f2Dddae01Bb8A6EA49b760383D5A';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  let uniswapAdapterAddress;
  let wethAdapterAddress;
  let DAI;
  let WETH;
  let ONEINCH;
  let ONEINCHDAI;

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
    await ProtocolAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterRegistry = result.contract;
      });
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [
        ONE_INCH_LP_ASSET_ADAPTER,
        UNISWAP_V2_EXCHANGE_ADAPTER,
        WETH_ASSET_ADAPTER,
      ],
      [
        protocolAdapterAddress,
        uniswapAdapterAddress,
        wethAdapterAddress,
      ],
      [
        [oneInchDaiAddress],
        [],
        [],
      ],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await Core.new(
      protocolAdapterRegistry.options.address,
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
        router = result.contract;
      });
    await ERC20.at(daiAddress)
      .then((result) => {
        DAI = result.contract;
      });
    await ERC20.at(wethAddress)
      .then((result) => {
        WETH = result.contract;
      });
    await ERC20.at(oneInchDaiAddress)
      .then((result) => {
        ONEINCHDAI = result.contract;
      });
    await ERC20.at(oneInchAddress)
      .then((result) => {
        ONEINCH = result.contract;
      });
  });

  describe('Uniswap V2 asset tests', () => {
    it('should prepare for tests buyng dai for WETH', async () => {
      // exchange 1 ETH to WETH like we had WETH initially
      await router.methods.execute(
        // actions
        [
          [
            WETH_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [ethAddress, web3.utils.toWei('1', 'ether'), AMOUNT_ABSOLUTE],
            ],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [],
        // fee
        [0, ZERO],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
          value: web3.utils.toWei('1', 'ether'),
        });
      await WETH.methods.approve(router.options.address, web3.utils.toWei('0.6', 'ether'))
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        // actions
        [
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, web3.utils.toWei('0.3', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, daiAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, web3.utils.toWei('0.3', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, oneInchAddress]),
          ],
        ],
        // inputs
        [
          [wethAddress, web3.utils.toWei('0.6', 'ether'), AMOUNT_ABSOLUTE],
        ],
        // fee
        [0, ZERO],
        // outputs
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        });
    });

    it('should buy 1 UNI-V2 with existing DAI and WETH', async () => {
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`DAI amount before is        ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      let oneInchAmount;
      await ONEINCH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`ONEINCH amount before is    ${web3.utils.fromWei(result, 'ether')}`);
          oneInchAmount = result;
        });
      await ONEINCH.methods.approve(router.options.address, oneInchAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await ONEINCHDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`ONEINCHDAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        [
          [
            ONE_INCH_LP_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
              [oneInchAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameters('address', oneInchDaiAddress),
          ],
        ],
        [
          [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
          [oneInchAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [
          [oneInchDaiAddress, 0],
        ],
      )
        .send({
          from: accounts[0],
          gas: 1000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`DAI amount after is        ${web3.utils.fromWei(result, 'ether')}`);
        });
      await ONEINCH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`ONEINCH amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await ONEINCHDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`ONEINCHDAI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await ONEINCH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await ONEINCHDAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should sell 100% ONEINCHDAI', async () => {
      let oneInchDaiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`DAI amount before is        ${web3.utils.fromWei(result, 'ether')}`);
        });
      await ONEINCH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`ONEINCH amount before is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await ONEINCHDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`ONEINCHDAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
          oneInchDaiAmount = result;
        });
      await ONEINCHDAI.methods.approve(router.options.address, oneInchDaiAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        [
          [
            ONE_INCH_LP_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [oneInchDaiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', daiAddress),
          ],
        ],
        [
          [oneInchDaiAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 1000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`DAI amount after is        ${web3.utils.fromWei(result, 'ether')}`);
        });
      await ONEINCH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`ONEINCH amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await ONEINCHDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`ONEINCHDAI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await ONEINCH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await ONEINCHDAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
