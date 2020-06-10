// import displayToken from './helpers/displayToken';
// import expectRevert from './helpers/expectRevert';
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
const InteractiveAdapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const WethAdapter = artifacts.require('./WethInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('UniswapV2ExchangeAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

  let accounts;
  let core;
  let tokenSpender;
  let adapterRegistry;
  let protocolAdapterAddress;
  let wethAdapterAddress;
  let DAI;
  let WETH;

  describe('ETH <-> DAI exchange', () => {
    beforeEach(async () => {
      accounts = await web3.eth.getAccounts();
      await InteractiveAdapter.new({ from: accounts[0] })
        .then((result) => {
          protocolAdapterAddress = result.address;
        });
      await WethAdapter.new({ from: accounts[0] })
        .then((result) => {
          wethAdapterAddress = result.address;
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
            ZERO, ZERO, protocolAdapterAddress,
          ],
          [
            wethAdapterAddress,
          ],
        ],
        [[[], [], []], [[]]],
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
      await ERC20.at(wethAddress)
        .then((result) => {
          WETH = result.contract;
        });
    });

    it('should be correct one-side exchange deposit-like', async () => {
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
      let wethAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount before is ${web3.utils.fromWei(result, 'ether')}`);
          wethAmount = result;
        });
      await WETH.methods.approve(tokenSpender.options.address, wethAmount.toString())
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
            [web3.utils.toWei('0.5', 'ether')],
            [AMOUNT_ABSOLUTE],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, daiAddress]),
          ],
        ],
        // inputs
        [
          [wethAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
        ],
        // outputs
        [
          [daiAddress, web3.utils.toWei('90', 'ether')],
        ],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        })
        .then((receipt) => {
          console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await WETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct reverse exchange withdraw-like', async () => {
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is  ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods.approve(tokenSpender.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await tokenSpender.methods.startExecution(
        [
          [
            ACTION_WITHDRAW,
            web3.utils.toHex('Uniswap V2'),
            ADAPTER_EXCHANGE,
            [],
            [web3.utils.toWei('0.3', 'ether')],
            [AMOUNT_ABSOLUTE],
            web3.eth.abi.encodeParameter('address[]', [daiAddress, wethAddress]),
          ],
        ],
        [
          [daiAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
        ],
        [
          [wethAddress, web3.utils.toWei('0.3', 'ether')],
        ],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        })
        .then((receipt) => {
          console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await WETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
