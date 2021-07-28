import convertToBytes32 from '../helpers/convertToBytes32';

import expectRevert from '../helpers/expectRevert';

const AMUN_LENDING_ADAPTER = convertToBytes32('AmunLending').slice(0, -2);
const UNISWAP_V2_ADAPTER = convertToBytes32('Uniswap V2').slice(0, -2);
const WETH_ADAPTER = convertToBytes32('Weth').slice(0, -2);
const ASSET_ADAPTER = '01';
const EXCHANGE_ADAPTER = '03';
const AMUN_LENDING_ASSET_ADAPTER = `${AMUN_LENDING_ADAPTER}${ASSET_ADAPTER}`;
const WETH_ASSET_ADAPTER = `${WETH_ADAPTER}${ASSET_ADAPTER}`;
const UNISWAP_V2_EXCHANGE_ADAPTER = `${UNISWAP_V2_ADAPTER}${EXCHANGE_ADAPTER}`;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';
const EMPTY_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

const ZERO = '0x0000000000000000000000000000000000000000';
const ONE = web3.utils.toWei('1', 'ether');
const ONE_USDC = '1000000';

const TEN = web3.utils.toWei('10', 'ether');

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const AmunLendingAdapter = artifacts.require('./AmunLendingInteractiveAdapter');
const WethInteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require(
  './UniswapV2ExchangeInteractiveAdapter',
);
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');
const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');
const TokenAdapter = artifacts.require('AmunLendingTokenAdapter');

contract('AmunLendingInteractiveAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const tusdAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';

  const amunLendingAddress = '0x78f9c12e15ec36C2AB1bE0b2e5f79B71A9ECdFC8';

  let accounts;
  let core;
  let protocolAdapterRegistry;
  let router;
  let amunLendingAdapterAddress;
  let wethAdapterAddress;
  let uniswapAdapterAddress;
  let tokenAdapterRegistry;
  let erc20TokenAdapterAddress;
  let tokenAdapterAddress;

  let WETH;
  let LENDING;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await AmunLendingAdapter.new({ from: accounts[0] }).then((result) => {
      amunLendingAdapterAddress = result.address;
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
          AMUN_LENDING_ASSET_ADAPTER,
          WETH_ASSET_ADAPTER,
          UNISWAP_V2_EXCHANGE_ADAPTER,
        ],
        [amunLendingAdapterAddress, wethAdapterAddress, uniswapAdapterAddress],
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
        [EMPTY_BYTES32, convertToBytes32('Amun Lending Token')],
        [erc20TokenAdapterAddress, tokenAdapterAddress],
      )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods
      .addTokenAdapterNamesByHashes(
        [amunLendingAddress],
        [convertToBytes32('Amun Lending Token')],
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
    await ERC20.at(wethAddress).then((result) => {
      WETH = result.contract;
    });
    await ERC20.at(amunLendingAddress).then((result) => {
      LENDING = result.contract;
    });
  });

  describe('Scenario ETH <-> DFI Lending', () => {
    it('should not buy lending with unsupported token', async () => {
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

      await WETH.methods.approve(router.options.address, ONE).send({
        from: accounts[0],
        gas: 10000000,
      });

      const swapsFromEthToLendingComposition = [
        UNISWAP_V2_EXCHANGE_ADAPTER,
        ACTION_DEPOSIT,
        [[wethAddress, ONE, AMOUNT_ABSOLUTE]],
        web3.eth.abi.encodeParameter('address[]', [wethAddress, tusdAddress]),
      ];
      const actions = [
        swapsFromEthToLendingComposition,
        [
          AMUN_LENDING_ASSET_ADAPTER,
          ACTION_DEPOSIT,
          [
            [
              tusdAddress,
              ONE_USDC,
              AMOUNT_ABSOLUTE,
            ],
          ],
          web3.eth.abi.encodeParameters(['address'], [amunLendingAddress]),
        ],
      ];

      await expectRevert(router.methods
        .execute(
          actions,
          // inputs
          [[[wethAddress, ONE, AMOUNT_ABSOLUTE], [0, EMPTY_BYTES]]],
          [0, ZERO],
          // outputs
          [],
        )
        .send({
          from: accounts[0],
          gas: 5000000,
        }));
    });

    it('should buy 1 lending token', async () => {
      // exchange 10 ETH to WETH like we had WETH initially
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

      await WETH.methods.approve(router.options.address, ONE).send({
        from: accounts[0],
        gas: 10000000,
      });

      const swapsFromEthToLendingComposition = [
        UNISWAP_V2_EXCHANGE_ADAPTER,
        ACTION_DEPOSIT,
        [[wethAddress, ONE, AMOUNT_ABSOLUTE]],
        web3.eth.abi.encodeParameter('address[]', [wethAddress, usdcAddress]),
      ];
      const actions = [
        swapsFromEthToLendingComposition,
        [
          AMUN_LENDING_ASSET_ADAPTER,
          ACTION_DEPOSIT,
          [
            [
              usdcAddress,
              ONE_USDC,
              AMOUNT_ABSOLUTE,
            ],
          ],
          web3.eth.abi.encodeParameters(['address'], [amunLendingAddress]),
        ],
      ];
      const lendingBalanceBefore = await LENDING.methods['balanceOf(address)'](accounts[0])
        .call();

      await router.methods
        .execute(
          actions,
          // inputs
          [[[wethAddress, ONE, AMOUNT_ABSOLUTE], [0, EMPTY_BYTES]]],
          [0, ZERO],
          // outputs
          [],
        )
        .send({
          from: accounts[0],
          gas: 5000000,
        });
      await LENDING.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });

      await LENDING.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          assert.equal(true, BigInt(result) > BigInt(lendingBalanceBefore));
        });
    });

    it('should sell 1 lending token', async () => {
      const actions = [
        [
          AMUN_LENDING_ASSET_ADAPTER,
          ACTION_WITHDRAW,
          [
            [
              amunLendingAddress,
              ONE,
              AMOUNT_ABSOLUTE,
            ],
          ],
          EMPTY_BYTES,
        ]];
      await LENDING.methods.approve(router.options.address, ONE).send({
        from: accounts[0],
        gas: 10000000,
      });

      const lendingBalanceBefore = await LENDING.methods['balanceOf(address)'](accounts[0])
        .call();

      assert.equal(true, BigInt(ONE) < BigInt(lendingBalanceBefore));

      await router.methods
        .execute(
          actions,
          // inputs
          [[[amunLendingAddress, ONE, AMOUNT_ABSOLUTE], [0, EMPTY_BYTES],
          ]],
          [0, ZERO],
          // outputs
          [],
        )
        .send({
          from: accounts[0],
          gas: 5000000,
        });

      await LENDING.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });

      await LENDING.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          assert.equal(true, BigInt(result) < BigInt(lendingBalanceBefore));
        });
    });
    it('should fail sell more lending token then own', async () => {
      const actions = [
        [
          AMUN_LENDING_ASSET_ADAPTER,
          ACTION_WITHDRAW,
          [
            [
              amunLendingAddress,
              ONE,
              AMOUNT_ABSOLUTE,
            ],
          ],
          EMPTY_BYTES,
        ],
      ];

      await LENDING.methods.approve(router.options.address, ONE).send({
        from: accounts[0],
        gas: 10000000,
      });

      await expectRevert(router.methods
        .execute(
          actions,
          // inputs
          [[[amunLendingAddress, TEN, AMOUNT_ABSOLUTE], [0, EMPTY_BYTES],
          ]],
          [0, ZERO],
          // outputs
          [],
        )
        .send({
          from: accounts[0],
          gas: 5000000,
        }));
    });
  });
});
