import convertToBytes32 from '../helpers/convertToBytes32';

import expectRevert from '../helpers/expectRevert';

const { BN } = web3.utils;

const AMUN_BASKET_ADAPTER = convertToBytes32('AmunBasket').slice(0, -2);
const UNISWAP_V2_ADAPTER = convertToBytes32('Uniswap V2').slice(0, -2);
const WETH_ADAPTER = convertToBytes32('Weth').slice(0, -2);
const ASSET_ADAPTER = '01';
const EXCHANGE_ADAPTER = '03';
const AMUN_BASKET_ASSET_ADAPTER = `${AMUN_BASKET_ADAPTER}${ASSET_ADAPTER}`;
const WETH_ASSET_ADAPTER = `${WETH_ADAPTER}${ASSET_ADAPTER}`;
const UNISWAP_V2_EXCHANGE_ADAPTER = `${UNISWAP_V2_ADAPTER}${EXCHANGE_ADAPTER}`;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';
const EMPTY_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

const ZERO = '0x0000000000000000000000000000000000000000';
const ONE = web3.utils.toWei('1', 'ether');
const TEN = web3.utils.toWei('10', 'ether');

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const AmunBasketAdapter = artifacts.require('./AmunBasketInteractiveAdapter');
const WethInteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require(
  './UniswapV2ExchangeInteractiveAdapter',
);
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');
const TokenAdapterRegistry = artifacts.require('TokenAdapterRegistry');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');
const TokenAdapter = '';// const TokenAdapter = artifacts.require('AmunBasketAdapter');

contract('AmunBasketInteractiveAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const amunBasketAddress = '0xA9536B9c75A9E0faE3B56a96AC8EdF76AbC91978';

  let accounts;
  let core;
  let protocolAdapterRegistry;
  let router;
  let amunBasketAdapterAddress;
  let wethAdapterAddress;
  let uniswapAdapterAddress;
  let tokenAdapterRegistry;
  let erc20TokenAdapterAddress;
  let tokenAdapterAddress;

  let WETH;
  let BASKET;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await AmunBasketAdapter.new({ from: accounts[0] }).then((result) => {
      amunBasketAdapterAddress = result.address;
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
          AMUN_BASKET_ASSET_ADAPTER,
          WETH_ASSET_ADAPTER,
          UNISWAP_V2_EXCHANGE_ADAPTER,
        ],
        [amunBasketAdapterAddress, wethAdapterAddress, uniswapAdapterAddress],
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
        [EMPTY_BYTES32, convertToBytes32('Amun Basket Token')],
        [erc20TokenAdapterAddress, tokenAdapterAddress],
      )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await tokenAdapterRegistry.methods
      .addTokenAdapterNamesByHashes(
        [amunBasketAddress],
        [convertToBytes32('Amun Basket Token')],
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
    await ERC20.at(amunBasketAddress).then((result) => {
      BASKET = result.contract;
    });
  });

  describe('Scenario ETH <-> DFI Basket', () => {
    it('should not buy basket with inconsistent tokens/amounts', async () => {
      const [fullTokenBalance] = await tokenAdapterRegistry.methods
        .getFullTokenBalances([amunBasketAddress])
        .call();
      // exchange 10 ETH to WETH like we had WETH initially
      await router.methods
        .execute(
        // actions
          [
            [
              WETH_ASSET_ADAPTER,
              ACTION_DEPOSIT,
              [[ethAddress, TEN, AMOUNT_ABSOLUTE]],
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
          value: TEN,
        });

      await WETH.methods.approve(router.options.address, TEN).send({
        from: accounts[0],
        gas: 10000000,
      });

      const swapsFromEthToBasketComposition = fullTokenBalance.underlying.map(
        ({ tokenBalance: { token } }) => [
          UNISWAP_V2_EXCHANGE_ADAPTER,
          ACTION_DEPOSIT,
          [[wethAddress, ONE, AMOUNT_ABSOLUTE]],
          web3.eth.abi.encodeParameter('address[]', [wethAddress, token]),
        ],
      );

      const depositTokenAmounts = fullTokenBalance.underlying.map(
        ({ tokenBalance: { token, amount } }, index) => [
          token,
          index ? 0 : amount,
          AMOUNT_ABSOLUTE,
        ],
      );

      const actions = [
        ...swapsFromEthToBasketComposition,
        [
          AMUN_BASKET_ASSET_ADAPTER,
          ACTION_DEPOSIT,
          [
            ...depositTokenAmounts,
          ],
          web3.eth.abi.encodeParameters(['address'], [amunBasketAddress]),
        ],
      ];
      await expectRevert(router.methods
        .execute(
          actions,
          // inputs
          [[[wethAddress, TEN, AMOUNT_ABSOLUTE], [0, EMPTY_BYTES]]],
          [0, ZERO],
          // outputs
          [],
        )
        .send({
          from: accounts[0],
          gas: 5000000,
        }));
    });

    it('should buy 1 basket token', async () => {
      const [fullTokenBalance] = await tokenAdapterRegistry.methods
        .getFullTokenBalances([amunBasketAddress])
        .call();
      // exchange 10 ETH to WETH like we had WETH initially
      await router.methods
        .execute(
          // actions
          [
            [
              WETH_ASSET_ADAPTER,
              ACTION_DEPOSIT,
              [[ethAddress, TEN, AMOUNT_ABSOLUTE]],
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
          value: TEN,
        });

      await WETH.methods.approve(router.options.address, TEN).send({
        from: accounts[0],
        gas: 10000000,
      });

      const swapsFromEthToBasketComposition = fullTokenBalance.underlying.map(
        ({ tokenBalance: { token } }) => [
          UNISWAP_V2_EXCHANGE_ADAPTER,
          ACTION_DEPOSIT,
          [[wethAddress, ONE, AMOUNT_ABSOLUTE]],
          web3.eth.abi.encodeParameter('address[]', [wethAddress, token]),
        ],
      );

      const depositTokenAmounts = fullTokenBalance.underlying.map(
        ({ tokenBalance: { token, amount } }) => [
          token,
          new BN(amount).add(new BN('1')).toString(),
          AMOUNT_ABSOLUTE,
        ],
      );

      const actions = [
        ...swapsFromEthToBasketComposition,
        [
          AMUN_BASKET_ASSET_ADAPTER,
          ACTION_DEPOSIT,
          [
            ...depositTokenAmounts,
          ],
          web3.eth.abi.encodeParameters(['address'], [amunBasketAddress]),
        ],
      ];
      const basketBalanceBefore = await BASKET.methods['balanceOf(address)'](accounts[0])
        .call();
      await router.methods
        .execute(
          actions,
          // inputs
          [
            [
              [wethAddress, TEN, AMOUNT_ABSOLUTE],
              [0, EMPTY_BYTES],
            ],
          ],
          [0, ZERO],
          // outputs
          [],
        )
        .send({
          from: accounts[0],
          gas: 5000000,
        });
      await BASKET.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await BASKET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          assert.equal(true, new BN(result).gt(new BN(basketBalanceBefore)));
        });
    });

    it('should sell 1 basket token', async () => {
      const actions = [
        [
          AMUN_BASKET_ASSET_ADAPTER,
          ACTION_WITHDRAW,
          [
            [
              amunBasketAddress,
              ONE,
              AMOUNT_ABSOLUTE,
            ],
          ],
          EMPTY_BYTES,
        ],
      ];
      await BASKET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          assert.equal(true, new BN(result).gte(ONE));
        });
      await BASKET.methods.approve(router.options.address, ONE).send({
        from: accounts[0],
        gas: 10000000,
      });

      const basketBalanceBefore = await BASKET.methods['balanceOf(address)'](accounts[0])
        .call();

      await router.methods
        .execute(
          actions,
          // inputs
          [[[amunBasketAddress, ONE, AMOUNT_ABSOLUTE], [0, EMPTY_BYTES]]],
          [0, ZERO],
          // outputs
          [],
        )
        .send({
          from: accounts[0],
          gas: 5000000,
        });
      await BASKET.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(true, new BN(basketBalanceBefore).gt(new BN(result)));
        });
    });

    it('should fail sell more basket token then own', async () => {
      const actions = [
        [
          AMUN_BASKET_ASSET_ADAPTER,
          ACTION_WITHDRAW,
          [
            [
              amunBasketAddress,
              ONE,
              AMOUNT_ABSOLUTE,
            ],
          ],
          EMPTY_BYTES,
        ],
      ];

      await BASKET.methods.approve(router.options.address, ONE).send({
        from: accounts[0],
        gas: 10000000,
      });

      await expectRevert(router.methods
        .execute(
          actions,
          // inputs
          [[[amunBasketAddress, ONE, AMOUNT_ABSOLUTE], [0, EMPTY_BYTES]]],
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
