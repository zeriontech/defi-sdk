// import displayToken from '../helpers/displayToken';
import expectRevert from '../helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';

const UNISWAP_V2_ADAPTER = convertToBytes32('Uniswap V2').slice(0, -2);
const ANGLE_ADAPTER = convertToBytes32('Angle').slice(0, -2);
const WETH_ADAPTER = convertToBytes32('Weth').slice(0, -2);
const ASSET_ADAPTER = '01';
const EXCHANGE_ADAPTER = '03';
const ANGLE_ASSET_ADAPTER = `${ANGLE_ADAPTER}${ASSET_ADAPTER}`;
const UNISWAP_V2_EXCHANGE_ADAPTER = `${UNISWAP_V2_ADAPTER}${EXCHANGE_ADAPTER}`;
const WETH_ASSET_ADAPTER = `${WETH_ADAPTER}${ASSET_ADAPTER}`;
const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./AngleAssetInteractiveAdapter');
const UniswapV2Adapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const WethAdapter = artifacts.require('./WethInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract.only('AngleAssetInteractiveAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const sanDaiAddress = '0x7B8E89b0cE7BAC2cfEC92A371Da899eA8CBdb450';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  let wethAssetAdapterAddress;
  let uniswapV2ExchangeAdapterAddress;
  let DAI;
  let SANDAI;

  before(async () => {
    accounts = await web3.eth.getAccounts();
    await InteractiveAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterAddress = result.address;
      });
    await UniswapV2Adapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapV2ExchangeAdapterAddress = result.address;
      });
    await WethAdapter.new({ from: accounts[0] })
      .then((result) => {
        wethAssetAdapterAddress = result.address;
      });
    await ProtocolAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterRegistry = result.contract;
      });
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [
        ANGLE_ASSET_ADAPTER,
        UNISWAP_V2_EXCHANGE_ADAPTER,
        WETH_ASSET_ADAPTER,
      ],
      [
        protocolAdapterAddress,
        uniswapV2ExchangeAdapterAddress,
        wethAssetAdapterAddress,
      ],
      [[], [], []],
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
    await ERC20.at(sanDaiAddress)
      .then((result) => {
        SANDAI = result.contract;
      });
    await router.methods.execute(
      // actions
      [
        [
          WETH_ASSET_ADAPTER,
          ACTION_DEPOSIT,
          [
            [ethAddress, web3.utils.toWei('1', 'ether'), AMOUNT_RELATIVE],
          ],
          EMPTY_BYTES,
        ],
        [
          UNISWAP_V2_EXCHANGE_ADAPTER,
          ACTION_DEPOSIT,
          [
            [wethAddress, web3.utils.toWei('1', 'ether'), AMOUNT_ABSOLUTE],
          ],
          web3.eth.abi.encodeParameter('address[]', [wethAddress, daiAddress]),
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
  });

  describe('DAI <-> sanDAI', () => {
    it('should be correct DAI -> sanDAI deposit', async () => {
      let daiAmount;
      await SANDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`sanDAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
          console.log(` DAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods.approve(router.options.address, daiAmount)
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        [
          [
            ANGLE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', sanDaiAddress),
          ],
        ],
        [
          [
            [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            [0, ZERO],
          ],
        ],
        [0, ZERO],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await SANDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`sanDAI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` DAI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await SANDAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct DAI <- sanDAI withdraw', async () => {
      let sanDaiAmount;
      await SANDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          sanDaiAmount = result;
          console.log(`sanDAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` DAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await SANDAI.methods.approve(router.options.address, sanDaiAmount)
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        [
          [
            ANGLE_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [sanDaiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        [
          [
            [sanDaiAddress, convertToShare(1), AMOUNT_RELATIVE],
            [0, ZERO],
          ],
        ],
        [0, ZERO],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await SANDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`sanDAI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` DAI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await SANDAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
