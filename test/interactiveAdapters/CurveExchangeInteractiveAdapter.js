// import displayToken from './helpers/displayToken';
// import expectRevert from './helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';

const ACTION_DEPOSIT = 1;
// const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const RELATIVE_AMOUNT_BASE = '1000000000000000000';
// const EMPTY_BYTES = '0x';
// const ADAPTER_ASSET = 0;
// const ADAPTER_DEBT = 1;
const ADAPTER_EXCHANGE = 2;

const ZERO = '0x0000000000000000000000000000000000000000';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const InteractiveAdapter = artifacts.require('./CurveExchangeInteractiveAdapter');
const UniswapV1ExchangeAdapter = artifacts.require('./UniswapV1ExchangeInteractiveAdapter');
const Logic = artifacts.require('./Logic');
const TokenSpender = artifacts.require('./TokenSpender');
const ERC20 = artifacts.require('./ERC20');

contract('Curve exchange interactive adapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  // const tusdAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
  // const busdAddress = '0x4Fabb145d64652a948d72533023f6E7A623C7C53';
  const susdAddress = '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  let accounts;
  let logic;
  let tokenSpender;
  let adapterRegistry;
  let protocolAdapterAddress;
  let uniswapAdapterAddress;
  let DAI;
  let USDC;
  let USDT;
  // let TUSD;
  // let BUSD;
  let SUSD;

  describe('DAI -> BUSD exchange in 3 steps', () => {
    beforeEach(async () => {
      accounts = await web3.eth.getAccounts();
      await InteractiveAdapter.new({ from: accounts[0] })
        .then((result) => {
          protocolAdapterAddress = result.address;
        });
      await UniswapV1ExchangeAdapter.new({ from: accounts[0] })
        .then((result) => {
          uniswapAdapterAddress = result.address;
        });
      await AdapterRegistry.new({ from: accounts[0] })
        .then((result) => {
          adapterRegistry = result.contract;
        });
      await adapterRegistry.methods.addProtocols(
        [web3.utils.toHex('Curve'), web3.utils.toHex('Uniswap V1')],
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
            ZERO, ZERO, uniswapAdapterAddress,
          ],
        ],
        [
          [[], [], []],
          [[], [], []],
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
      await ERC20.at(usdcAddress)
        .then((result) => {
          USDC = result.contract;
        });
      await ERC20.at(usdtAddress)
        .then((result) => {
          USDT = result.contract;
        });
      // await ERC20.at(tusdAddress)
      //   .then((result) => {
      //     TUSD = result.contract;
      //   });
      // await ERC20.at(busdAddress)
      //   .then((result) => {
      //     BUSD = result.contract;
      //   });
      await ERC20.at(susdAddress)
        .then((result) => {
          SUSD = result.contract;
        });
    });

    it('DAI -> SUSD (deposit/relative)', async () => {
      // exchange 1 ETH to DAI like we had DAI initially
      await tokenSpender.methods.startExecution(
        // actions
        [
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
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await SUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`susd amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods.approve(tokenSpender.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await tokenSpender.methods.startExecution(
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('Curve'),
            ADAPTER_EXCHANGE,
            [daiAddress],
            [convertToShare(1)],
            [AMOUNT_RELATIVE],
            web3.eth.abi.encodeParameter('address', susdAddress),
          ],
        ],
        [
          [daiAddress, RELATIVE_AMOUNT_BASE, AMOUNT_RELATIVE, 0, ZERO],
        ],
        [],
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
      await SUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`susd amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await SUSD.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('SUSD -> USDC (deposit/absolute)', async () => {
      let susdAmount;
      await SUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`susd amount before is ${web3.utils.fromWei(result, 'ether')}`);
          susdAmount = result;
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdc amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await SUSD.methods.approve(tokenSpender.options.address, susdAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await tokenSpender.methods.startExecution(
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('Curve'),
            ADAPTER_EXCHANGE,
            [susdAddress],
            [susdAmount],
            [AMOUNT_ABSOLUTE],
            web3.eth.abi.encodeParameter('address', usdcAddress),
          ],
        ],
        [
          [susdAddress, susdAmount, AMOUNT_ABSOLUTE, 0, ZERO],
        ],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        })
        .then((receipt) => {
          console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
        });
      await SUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`susd amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdc amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await SUSD.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await USDC.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('USDC -> USDT (deposit/relative)', async () => {
      let usdcAmount;
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdc amount before is ${web3.utils.fromWei(result, 'ether')}`);
          usdcAmount = result;
        });
      await USDT.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdt amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await USDC.methods.approve(tokenSpender.options.address, usdcAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await tokenSpender.methods.startExecution(
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('Curve'),
            ADAPTER_EXCHANGE,
            [usdcAddress],
            [convertToShare(1)],
            [AMOUNT_RELATIVE],
            web3.eth.abi.encodeParameter('address', usdtAddress),
          ],
        ],
        [
          [usdcAddress, usdcAmount, AMOUNT_ABSOLUTE, 0, ZERO],
        ],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        })
        .then((receipt) => {
          console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdc amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDT.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdt amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await USDT.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await USDC.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
