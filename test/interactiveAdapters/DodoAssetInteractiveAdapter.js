import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';

const DODO_ASSET_ADAPTER = convertToBytes32('DODO Asset');
const UNISWAP_V2_EXCHANGE_ADAPTER = convertToBytes32('Uniswap V2 Exchange');
const WETH_ASSET_ADAPTER = convertToBytes32('WETH');

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./DodoAssetInteractiveAdapter');
const WethInteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('DodoAssetInteractiveAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const dodoWethAddress = '0xc11eCCDee225d644f873776A68A02eCD8c015697'; // WETH-USDC Base
  const dodoUsdcAddress = '0x6a5Eb3555cBbD29016Ba6F6fFbCcEE28D57b2932'; // WETH-USDC Quote

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  let wethAdapterAddress;
  let uniswapAdapterAddress;
  let DODO_WETH;
  let DODO_USDC;
  let USDC;
  let WETH;

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
        DODO_ASSET_ADAPTER,
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
    await ERC20.at(dodoUsdcAddress)
      .then((result) => {
        DODO_USDC = result.contract;
      });
    await ERC20.at(dodoWethAddress)
      .then((result) => {
        DODO_WETH = result.contract;
      });
    await ERC20.at(usdcAddress)
      .then((result) => {
        USDC = result.contract;
      });
    await ERC20.at(wethAddress)
      .then((result) => {
        WETH = result.contract;
      });
  });

  describe('buy/sell DODO_WETH', () => {
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

    it('should be correct WETH -> DODO_WETH deposit', async () => {
      let amount;
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amount = result;
          console.log(`     WETH amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DODO_WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`DODO_WETH amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods.approve(router.options.address, amount.toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        [
          [
            DODO_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', dodoWethAddress),
          ],
        ],
        [
          [
            [wethAddress, convertToShare(1), AMOUNT_ABSOLUTE],
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
      await DODO_WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` DODO_WETH amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`      WETH amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DODO_WETH.methods['balanceOf(address)'](core.options.address)
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

    it('should be correct WETH <- DODO_WETH withdraw', async () => {
      let amount;
      await DODO_WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amount = result;
          console.log(`DODO_WETH amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`WETH amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DODO_WETH.methods.approve(router.options.address, amount.toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        [
          [
            DODO_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [dodoWethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        [
          [
            [dodoWethAddress, convertToShare(1), AMOUNT_RELATIVE],
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
      await DODO_WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amount = result;
          console.log(` DODO_WETH amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`      WETH amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DODO_WETH.methods['balanceOf(address)'](core.options.address)
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

    it('should prepare like we had USDC', async () => {
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
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, usdcAddress]),
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

    it('should be correct USDC -> DODO_USDC deposit', async () => {
      let amount;
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amount = result;
          console.log(`     USDC amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await DODO_USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`DODO_USDC amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods.approve(router.options.address, amount.toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        [
          [
            DODO_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [usdcAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', dodoUsdcAddress),
          ],
        ],
        [
          [
            [usdcAddress, convertToShare(0.5), AMOUNT_RELATIVE],
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
      await DODO_USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` DODO_USDC amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`      USDC amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await DODO_USDC.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await USDC.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct USDC <- DODO_USDC withdraw', async () => {
      let amount;
      await DODO_USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amount = result;
          console.log(`DODO_USDC amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`USDC amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await DODO_USDC.methods.approve(router.options.address, amount.toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        [
          [
            DODO_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [dodoUsdcAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        [
          [
            [dodoUsdcAddress, convertToShare(1), AMOUNT_RELATIVE],
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
      await DODO_USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amount = result;
          console.log(` DODO_USDC amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`      USDC amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await DODO_USDC.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await USDC.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
