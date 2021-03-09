import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';

const DODO_V2_ASSET_ADAPTER = convertToBytes32('DODO V2 Asset');
const UNISWAP_V2_EXCHANGE_ADAPTER = convertToBytes32('Uniswap V2 Exchange');
const WETH_ASSET_ADAPTER = convertToBytes32('WETH');

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./DodoV2AssetInteractiveAdapter');
const WethInteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('DodoV2AssetInteractiveAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const dodoAddress = '0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd';
  const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const dlpAddress = '0x509eF8C68E7d246aAb686B6D9929998282A941fB'; // DODO-USDT pool

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  let wethAdapterAddress;
  let uniswapAdapterAddress;
  let DODO;
  let USDT;
  let DLP;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await InteractiveAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterAddress = result.address;
      });
    await ProtocolAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterRegistry = result.contract;
      });
    await WethInteractiveAdapter.new({ from: accounts[0] })
      .then((result) => {
        wethAdapterAddress = result.address;
      });
    await UniswapV2ExchangeAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapAdapterAddress = result.address;
      });
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [
        DODO_V2_ASSET_ADAPTER,
        WETH_ASSET_ADAPTER,
        UNISWAP_V2_EXCHANGE_ADAPTER,
      ],
      [
        protocolAdapterAddress,
        wethAdapterAddress,
        uniswapAdapterAddress,
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
    await ERC20.at(dodoAddress)
      .then((result) => {
        DODO = result.contract;
      });
    await ERC20.at(usdtAddress)
      .then((result) => {
        USDT = result.contract;
      });
    await ERC20.at(dlpAddress)
      .then((result) => {
        DLP = result.contract;
      });
  });

  describe('buy/sell DODO/USDT pool', () => {
    it('should prepare like we had WETH', async () => {
      await router.methods.execute(
        [
          [
            WETH_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [ethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(0.5), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, dodoAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, usdtAddress]),
          ],
        ],
        [],
        ['0', ZERO],
        [],
      )
        .send({
          gas: '10000000',
          from: accounts[0],
          value: web3.utils.toWei('1', 'ether').toString(),
        });
    });

    it('should be correct DODO+USDT -> DLP deposit', async () => {
      let dodoAmount;
      await DODO.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          dodoAmount = result;
          console.log(`DODO amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      let usdtAmount;
      await USDT.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          usdtAmount = result;
          console.log(`USDT amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await DLP.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` DLP amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DODO.methods.approve(router.options.address, dodoAmount.toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await USDT.methods.approve(router.options.address, usdtAmount.toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        [
          [
            DODO_V2_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [dodoAddress, convertToShare(1), AMOUNT_RELATIVE],
              [usdtAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', dlpAddress),
          ],
        ],
        [
          [
            [dodoAddress, convertToShare(1), AMOUNT_RELATIVE],
            [0, EMPTY_BYTES],
          ],
          [
            [usdtAddress, convertToShare(1), AMOUNT_RELATIVE],
            [0, EMPTY_BYTES],
          ],
        ],
        ['0', ZERO],
        [],
      )
        .send({
          gas: '10000000',
          from: accounts[0],
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await DODO.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` DODO amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDT.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` USDT amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await DLP.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`  DLP amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DLP.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await DODO.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await USDT.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct DODO+USDT <- DLP withdraw', async () => {
      let amount;
      await DLP.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amount = result;
          console.log(` DLP amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDT.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`USDT amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await DODO.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`DODO amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DLP.methods.approve(router.options.address, amount.toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        [
          [
            DODO_V2_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [dlpAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        [
          [
            [dlpAddress, convertToShare(1), AMOUNT_RELATIVE],
            [0, EMPTY_BYTES],
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
      await DLP.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amount = result;
          console.log(`  DLP amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDT.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` USDT amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await DODO.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` DODO amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DLP.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await USDT.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await DODO.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
