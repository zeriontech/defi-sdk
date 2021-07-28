import convertToBytes32 from '../helpers/convertToBytes32';
import convertToShare from '../helpers/convertToShare';

import expectRevert from '../helpers/expectRevert';

const AMUN_MINE_ADAPTER = convertToBytes32('AmunLiquidity').slice(0, -2);
const UNISWAP_V2_ADAPTER = convertToBytes32('Uniswap V2').slice(0, -2);
const WETH_ADAPTER = convertToBytes32('Weth').slice(0, -2);
const ASSET_ADAPTER = '01';
const EXCHANGE_ADAPTER = '03';
const AMUN_MINE_ASSET_ADAPTER = `${AMUN_MINE_ADAPTER}${ASSET_ADAPTER}`;
const WETH_ASSET_ADAPTER = `${WETH_ADAPTER}${ASSET_ADAPTER}`;
const UNISWAP_V2_EXCHANGE_ADAPTER = `${UNISWAP_V2_ADAPTER}${EXCHANGE_ADAPTER}`;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';
const EMPTY_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

const ZERO = '0x0000000000000000000000000000000000000000';
const ONE = web3.utils.toWei('1', 'ether');

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const AmunLiquidityAdapter = artifacts.require('./AmunLiquidityInteractiveAdapter');
const WethInteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require(
  './UniswapV2ExchangeInteractiveAdapter',
);
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');
const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');
const TokenAdapter = artifacts.require('AmunLiquidityAdapter');

contract('AmunLiquidityInteractiveAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

  const amunLiquidityAddress = '0x9D895763488a9f60D1882296cBe23399f974E10d'; // MINE

  let accounts;
  let core;
  let protocolAdapterRegistry;
  let router;
  let amunLiquidityAdapterAddress;
  let wethAdapterAddress;
  let uniswapAdapterAddress;
  let tokenAdapterRegistry;
  let erc20TokenAdapterAddress;
  let tokenAdapterAddress;

  let MINE;
  let USDC;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await AmunLiquidityAdapter.new({ from: accounts[0] }).then((result) => {
      amunLiquidityAdapterAddress = result.address;
    });
    await WethInteractiveAdapter.new({ from: accounts[0] }).then((result) => {
      wethAdapterAddress = result.address;
    });
    await UniswapV2ExchangeAdapter.new({ from: accounts[0] }).then((result) => {
      uniswapAdapterAddress = result.address;
    });
    await TokenAdapter.new({ from: accounts[0] }).then((result) => {
      tokenAdapterAddress = result.address;
    });
    await ProtocolAdapterRegistry.new({ from: accounts[0] }).then((result) => {
      protocolAdapterRegistry = result.contract;
    });
    await protocolAdapterRegistry.methods
      .addProtocolAdapters(
        [
          AMUN_MINE_ASSET_ADAPTER,
          WETH_ASSET_ADAPTER,
          UNISWAP_V2_EXCHANGE_ADAPTER,
        ],
        [amunLiquidityAdapterAddress, wethAdapterAddress, uniswapAdapterAddress],
        [[], [], []],
      )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await ERC20TokenAdapter.new({ from: accounts[0] }).then((result) => {
      erc20TokenAdapterAddress = result.address;
    });
    await TokenAdapterRegistry.new({ from: accounts[0] }).then((result) => {
      tokenAdapterRegistry = result.contract;
    });
    await tokenAdapterRegistry.methods
      .addTokenAdapters(
        [EMPTY_BYTES32, convertToBytes32('Amun Liquidity Token')],
        [erc20TokenAdapterAddress, tokenAdapterAddress],
      )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods
      .addTokenAdapterNamesByHashes(
        [amunLiquidityAddress],
        [convertToBytes32('Amun Liquidity Token')],
      )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await Core.new(protocolAdapterRegistry.options.address, {
      from: accounts[0],
    }).then((result) => {
      core = result.contract;
    });
    await Router.new(core.options.address, { from: accounts[0] }).then(
      (result) => {
        router = result.contract;
      },
    );

    await ERC20.at(amunLiquidityAddress).then((result) => {
      MINE = result.contract;
    });
    await ERC20.at(usdcAddress)
      .then((result) => {
        USDC = result.contract;
      });
    await router.methods
      .execute(
      // actions
        [
          [
            WETH_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [[ethAddress, ONE, AMOUNT_ABSOLUTE]],
            EMPTY_BYTES,
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [[wethAddress, ONE, AMOUNT_ABSOLUTE]],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, usdcAddress]),
          ],
        ],
        // inputs
        [],
        [0, ZERO],
        // outputs
        [],
      )
      .send({
        from: accounts[0],
        gas: 10000000,
        value: ONE,
      });
  });

  describe('USDC <-> MINE', () => {
    it('should not be correct USDC -> MINE deposit with two tokenAmounts', async () => {
      let usdcAmount;
      await MINE.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`MINE amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          usdcAmount = result;
          console.log(` USDC amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await USDC.methods.approve(router.options.address, usdcAmount)
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await expectRevert(router.methods.execute(
        [
          [
            AMUN_MINE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [usdcAddress, convertToShare(1), AMOUNT_RELATIVE],
              [usdcAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', amunLiquidityAddress),
          ],
        ],
        [[
          [usdcAddress, convertToShare(0.5), AMOUNT_RELATIVE],
          [0, EMPTY_BYTES],
        ],
        ],
        [0, ZERO],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        }));
      await MINE.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`MINE amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          usdcAmount = result;
          console.log(` USDC amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await MINE.methods['balanceOf(address)'](core.options.address)
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

    it('should be correct USDC -> MINE deposit', async () => {
      let usdcAmount;
      await MINE.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`MINE amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          usdcAmount = result;
          console.log(` USDC amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await USDC.methods.approve(router.options.address, usdcAmount)
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        [
          [
            AMUN_MINE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [usdcAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', amunLiquidityAddress),
          ],
        ],
        [[
          [usdcAddress, convertToShare(1), AMOUNT_RELATIVE],
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
      await MINE.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`MINE amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` USDC amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await MINE.methods['balanceOf(address)'](core.options.address)
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

    it('should not be correct USDC <- MINE withdraw with 2 tokenAmounts', async () => {
      let amunLiquidityAmount;
      await MINE.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amunLiquidityAmount = result;
          console.log(`MINE amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` USDC amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await MINE.methods.approve(router.options.address, (amunLiquidityAmount * 2).toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await expectRevert(
        router.methods.execute(
          [
            [
              AMUN_MINE_ASSET_ADAPTER,
              ACTION_WITHDRAW,
              [
                [amunLiquidityAddress, convertToShare(1), AMOUNT_RELATIVE],
                [amunLiquidityAddress, convertToShare(1), AMOUNT_RELATIVE],
              ],
              EMPTY_BYTES,
            ],
          ],
          [[
            [amunLiquidityAddress, convertToShare(0.5), AMOUNT_RELATIVE],
            [0, EMPTY_BYTES],
          ],
          ],
          [0, ZERO],
          [],
        )
          .send({
            gas: 10000000,
            from: accounts[0],
          }),
      );
    });

    it('should be correct USDC <- MINE withdraw', async () => {
      let amunLiquidityAmount;
      await MINE.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amunLiquidityAmount = result;
          console.log(`MINE amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` USDC amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await MINE.methods.approve(router.options.address, (amunLiquidityAmount * 2).toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        [
          [
            AMUN_MINE_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [amunLiquidityAddress, web3.utils.toWei('1', 'mwei'), AMOUNT_ABSOLUTE],
            ],
            EMPTY_BYTES,
          ],
        ],
        [[
          [amunLiquidityAddress, web3.utils.toWei('1', 'mwei'), AMOUNT_ABSOLUTE],
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
      await MINE.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`MINE amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` USDC amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await MINE.methods['balanceOf(address)'](core.options.address)
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
