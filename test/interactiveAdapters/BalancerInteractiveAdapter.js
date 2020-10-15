import convertToShare from '../helpers/convertToShare';
import expectRevert from '../helpers/expectRevert';

const UNISWAP_V1_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('Uniswap V1'),
).slice(0, -2);
const BALANCER_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('Balancer'),
).slice(0, -2);
const ASSET_ADAPTER = '01';
const EXCHANGE_ADAPTER = '03';
const BALANCER_ASSET_ADAPTER = `${BALANCER_ADAPTER}${ASSET_ADAPTER}`;
const UNISWAP_V1_EXCHANGE_ADAPTER = `${UNISWAP_V1_ADAPTER}${EXCHANGE_ADAPTER}`;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
// const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const UniswapV1Adapter = artifacts.require('./UniswapV1ExchangeInteractiveAdapter');
const BalancerAdapter = artifacts.require('./BalancerInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('BalancerAssetInteractiveAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const mkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const poolAddress = '0x987D7Cc04652710b74Fff380403f5c02f82e290a';

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let uniswapAdapterAddress;
  let balancerAdapterAddress;

  let DAI;
  let MKR;
  let pool;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await UniswapV1Adapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapAdapterAddress = result.address;
      });
    await BalancerAdapter.new({ from: accounts[0] })
      .then((result) => {
        balancerAdapterAddress = result.address;
      });
    await ProtocolAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterRegistry = result.contract;
      });
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [
        UNISWAP_V1_EXCHANGE_ADAPTER,
        BALANCER_ASSET_ADAPTER,
      ],
      [
        uniswapAdapterAddress,
        balancerAdapterAddress,
      ],
      [
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
    await ERC20.at(mkrAddress)
      .then((result) => {
        MKR = result.contract;
      });
    await ERC20.at(poolAddress)
      .then((result) => {
        pool = result.contract;
      });
  });

  describe('DAI <-> MKR+WETH Pool', () => {
    it('should not buy pool with 2 tokens', async () => {
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await expectRevert(router.methods.execute(
        // actions
        [
          // exchange DAI to MKR to make swap
          [
            UNISWAP_V1_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', mkrAddress),
          ],
          // deposit to pool using mkr
          [
            BALANCER_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [mkrAddress, convertToShare(1), AMOUNT_RELATIVE],
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              poolAddress,
            ),
          ],
        ],
        // inputs
        [
          [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        // outputs
        [
          [poolAddress, '1000000000000000000'],
        ],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should buy pool', async () => {
      let daiAmount;
      await router.methods.execute(
        // actions
        [
          // exchange 1 ETH to DAI like we had dai initially
          [
            UNISWAP_V1_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [ethAddress, '1000000000000000000', AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter('address', daiAddress),
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
          value: web3.utils.toWei('1', 'ether'),
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is  ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await MKR.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`mkr amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await pool.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        // actions
        [
          // exchange DAI to MKR to make swap
          [
            UNISWAP_V1_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', mkrAddress),
          ],
          // deposit to pool using mkr
          [
            BALANCER_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [mkrAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              poolAddress,
            ),
          ],
        ],
        // inputs
        [
          [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        // outputs
        [
          [poolAddress, '1000000000000000000'],
        ],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await MKR.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`mkr amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await pool.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await MKR.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await pool.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(core.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should not sell pool more than exists', async () => {
      let poolAmount;
      await pool.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          poolAmount = result;
        });
      await pool.methods.approve(router.options.address, poolAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await expectRevert(router.methods.execute(
        [
          // withdraw pool tokens
          [
            BALANCER_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [poolAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', mkrAddress),
          ],
          // exchange MKR to DAI
          [
            UNISWAP_V1_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [mkrAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter('address', daiAddress),
          ],
        ],
        [
          [poolAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should not sell pool with 2 tokens', async () => {
      let poolAmount;
      await pool.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          poolAmount = result;
        });
      await pool.methods.approve(router.options.address, poolAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await expectRevert(router.methods.execute(
        [
          // withdraw pool tokens
          [
            BALANCER_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [poolAddress, convertToShare(1), AMOUNT_RELATIVE],
              [poolAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', mkrAddress),
          ],
          // exchange MKR to DAI
          [
            UNISWAP_V1_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [mkrAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', daiAddress),
          ],
        ],
        [
          [poolAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should sell pool', async () => {
      let poolAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await MKR.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`mkr amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await pool.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool amount before is ${web3.utils.fromWei(result, 'ether')}`);
          poolAmount = result;
        });
      await pool.methods.approve(router.options.address, poolAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        [
          // withdraw pool tokens
          [
            BALANCER_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [poolAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', mkrAddress),
          ],
          // exchange MKR to DAI
          [
            UNISWAP_V1_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [mkrAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', daiAddress),
          ],
        ],
        [
          [poolAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await MKR.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`mkr amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await pool.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await MKR.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await pool.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(core.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
