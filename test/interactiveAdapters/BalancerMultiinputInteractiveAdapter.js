import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';

const BALANCER_ASSET_ADAPTER = convertToBytes32('Balancer Multiinput');
const UNISWAP_V2_EXCHANGE_ADAPTER = convertToBytes32('Uniswap V2 Exchange');
const WETH_ASSET_ADAPTER = convertToBytes32('WETH');

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const BalancerMultiinputAdapter = artifacts.require('./BalancerMultiinputInteractiveAdapter');
const WethInteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('BalancerMultiinputInteractiveAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

  const balAddress = '0xba100000625a3754423978a60c9317c58a424e3D';

  const poolAddress = '0x59A19D8c652FA0284f44113D0ff9aBa70bd46fB4';

  let accounts;
  let core;
  let protocolAdapterRegistry;
  let router;
  let balancerMultiinputAdapterAddress;
  let wethAdapterAddress;
  let uniswapAdapterAddress;

  let POOL;
  let WETH;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await BalancerMultiinputAdapter.new({ from: accounts[0] })
      .then((result) => {
        balancerMultiinputAdapterAddress = result.address;
      });
    await WethInteractiveAdapter.new({ from: accounts[0] })
      .then((result) => {
        wethAdapterAddress = result.address;
      });
    await UniswapV2ExchangeAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapAdapterAddress = result.address;
      });
    await ProtocolAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterRegistry = result.contract;
      });
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [
        BALANCER_ASSET_ADAPTER,
        WETH_ASSET_ADAPTER,
        UNISWAP_V2_EXCHANGE_ADAPTER,
      ],
      [
        balancerMultiinputAdapterAddress,
        wethAdapterAddress,
        uniswapAdapterAddress,
      ],
      [
        [],
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
    await ERC20.at(poolAddress)
      .then((result) => {
        POOL = result.contract;
      });
    await ERC20.at(wethAddress)
      .then((result) => {
        WETH = result.contract;
      });
  });

  describe('Scenario ETH <-> WETH/BAL pool', () => {
    it('should buy WETH/BAL pool with existing 1 ETH', async () => {
      await POOL.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool amount before is     ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        // actions
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
              [wethAddress, convertToShare(0.8), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, balAddress]),
          ],
          [
            BALANCER_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [balAddress, convertToShare(1), AMOUNT_RELATIVE],
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', poolAddress),
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
          gas: 10000000,
          value: web3.utils.toWei('1', 'ether'),
          from: accounts[0],
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await POOL.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await POOL.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(core.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should sell 50% of WETH/BAL pool', async () => {
      let poolBalance;
      await POOL.methods.balanceOf(accounts[0])
        .call()
        .then((result) => {
          console.log(`pool amount before is ${web3.utils.fromWei(result, 'ether')}`);
          poolBalance = result;
        });
      await POOL.methods.approve(router.options.address, poolBalance)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        // actions
        [
          [
            BALANCER_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [poolAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [balAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [balAddress, wethAddress]),
          ],
          [
            WETH_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [
          [poolAddress, convertToShare(0.5), AMOUNT_RELATIVE],
        ],
        // fee
        [0, ZERO],
        // outputs
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await POOL.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await POOL.methods['balanceOf(address)'](core.options.address)
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
