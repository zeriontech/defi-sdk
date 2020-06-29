// import displayToken from './helpers/displayToken';\
// import convertToShare from '../helpers/convertToShare';
import expectRevert from '../helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';

const { BN } = web3.utils;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';
const ADAPTER_ASSET = 0;
const ADAPTER_DEBT = 1;
const ADAPTER_EXCHANGE = 2;

const ZERO = '0x0000000000000000000000000000000000000000';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const InteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('Core + Router', () => {
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  let accounts;
  let core;
  let router;
  let adapterRegistry;
  let protocolAdapterAddress;
  let WETH;
  let wethAmount;

  describe('Core and Router tests using Weth', () => {
    beforeEach(async () => {
      accounts = await web3.eth.getAccounts();
      await InteractiveAdapter.new({from: accounts[0]})
        .then((result) => {
          protocolAdapterAddress = result.address;
        });
      await AdapterRegistry.new({from: accounts[0]})
        .then((result) => {
          adapterRegistry = result.contract;
        });
      await adapterRegistry.methods.addProtocols(
        [web3.utils.toHex('Weth')],
        [[
          'Mock Protocol Name',
          'Mock protocol description',
          'Mock website',
          'Mock icon',
          '0',
        ]],
        [[
          protocolAdapterAddress, ZERO,
        ]],
        [[[],[]]],
      )
        .send({
          from: accounts[0],
          gas: '1000000',
        });
      await Core.new(
        adapterRegistry.options.address,
        {from: accounts[0]},
      )
        .then((result) => {
          core = result.contract;
        });
      await Router.new(
        core.options.address,
        {from: accounts[0]},
      )
        .then((result) => {
          router = result.contract;
        });
      await ERC20.at(wethAddress)
        .then((result) => {
          WETH = result.contract;
        });
    });

    it('should not deploy router with no core', async () => {
      await expectRevert(Router.new(
        ZERO,
        {from: accounts[0]},
      ))
    });

    it('should not deploy core with no registry', async () => {
      await expectRevert(Core.new(
        ZERO,
        {from: accounts[0]},
      ))
    });

    it('should not get 1 WETH from 1 ETH with broken amount type', async () => {
      await expectRevert(router.methods.startExecution(
        // actions
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('Weth'),
            ADAPTER_ASSET,
            [],
            [web3.utils.toWei('1', 'ether')],
            [0],
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
        }));
    });

    it('should not get 1 WETH from 1 ETH with too large relative amount', async () => {
      await expectRevert(router.methods.startExecution(
        // actions
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('Weth'),
            ADAPTER_ASSET,
            [],
            [web3.utils.toWei('1.1', 'ether')],
            [AMOUNT_RELATIVE],
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
        }));
    });

    it('should get 1 WETH from 1 ETH and get half back', async () => {
      await router.methods.startExecution(
        // actions
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('Weth'),
            ADAPTER_ASSET,
            [],
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
      await WETH.methods.approve(router.options.address, web3.utils.toWei('1', 'ether'))
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.startExecution(
        // actions
        [
          [
            ACTION_WITHDRAW,
            web3.utils.toHex('Weth'),
            ADAPTER_ASSET,
            [],
            [web3.utils.toWei('1', 'ether')],
            [AMOUNT_RELATIVE],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [
          [wethAddress, convertToShare(0.5), AMOUNT_RELATIVE, 0, ZERO]
        ],
        // outputs
        [
          [ethAddress, 1000]
        ],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        });
    });

    it('should not execute action with wrong type', async () => {
      await expectRevert(router.methods.startExecution(
        // actions
        [
          [
            0,
            web3.utils.toHex('Weth'),
            ADAPTER_ASSET,
            [],
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
        }));
    });

    it('should not execute action with wrong amountType length', async () => {
      await expectRevert(router.methods.startExecution(
        // actions
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('Weth'),
            ADAPTER_ASSET,
            [],
            [web3.utils.toWei('1', 'ether')],
            [AMOUNT_ABSOLUTE, AMOUNT_ABSOLUTE],
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
        }));
    });

    it('should not execute action with wrong protocol', async () => {
      await expectRevert(router.methods.startExecution(
        // actions
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('WethHHHH'),
            ADAPTER_ASSET,
            [],
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
        }));
    });

    it('should not execute action with wrong index', async () => {
      await expectRevert(router.methods.startExecution(
        // actions
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('Weth'),
            ADAPTER_EXCHANGE,
            [],
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
        }));
    });

    it('should not execute action with wrong zero adapter', async () => {
      await expectRevert(router.methods.startExecution(
        // actions
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('Weth'),
            ADAPTER_DEBT,
            [],
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
        }));
    });

    it('should return lost tokens', async () => {
      await WETH.methods.transfer(router.options.address, 1)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await WETH.methods.balanceOf(router.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 1);
        });
      await router.methods.returnLostTokens(wethAddress, accounts[0])
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await WETH.methods.balanceOf(router.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should return required allowances', async () => {
      await WETH.methods.approve(router.options.address, 1)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await WETH.methods.allowance(accounts[0], router.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 1);
        });
      await router.methods.getRequiredAllowances(
        [
          [wethAddress, 2, AMOUNT_ABSOLUTE, 0, ZERO],
        ],
        accounts[0],
      )
        .call()
        .then((result) => {
          assert.equal(result[0].amount, 1);
        });
      await router.methods.getRequiredAllowances(
        [
          [wethAddress, 1, AMOUNT_ABSOLUTE, 0, ZERO],
        ],
        accounts[0],
      )
        .call()
        .then((result) => {
          assert.equal(result[0].amount, 0);
        });
    });

    it('should return required balances', async () => {
      await WETH.methods.balanceOf(accounts[0])
        .call()
        .then((result) => {
          wethAmount = result;
        });
      await router.methods.getRequiredBalances(
        [
          [wethAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE, 0, ZERO],
        ],
        accounts[0],
      )
        .call()
        .then((result) => {
          assert.equal(
            result[0].amount,
            new BN(web3.utils.toWei('100', 'ether')).sub(new BN(wethAmount))
          );
        });
      await router.methods.getRequiredBalances(
        [
          [wethAddress, 1, AMOUNT_ABSOLUTE, 0, ZERO],
        ],
        accounts[0],
      )
        .call()
        .then((result) => {
          assert.equal(result[0].amount, 0);
        });
    });

    it('should not handle large fees correctly', async () => {
      await WETH.methods.approve(router.options.address, web3.utils.toWei('1', 'ether'))
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await expectRevert(router.methods.startExecution(
        // actions
        [],
        // inputs
        [
          [
            wethAddress,
            web3.utils.toWei('1', 'ether'),
            AMOUNT_ABSOLUTE,
            web3.utils.toWei('0.011', 'ether'),
            accounts[1],
          ],
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should not handle fees to ZERO correctly', async () => {
      await WETH.methods.approve(router.options.address, web3.utils.toWei('1', 'ether'))
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await expectRevert(router.methods.startExecution(
        // actions
        [],
        // inputs
        [
          [
            wethAddress,
            web3.utils.toWei('1', 'ether'),
            AMOUNT_ABSOLUTE,
            web3.utils.toWei('0.01', 'ether'),
            ZERO,
          ],
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should handle fees correctly', async () => {
      await WETH.methods.approve(router.options.address, web3.utils.toWei('1', 'ether'))
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.startExecution(
        // actions
        [],
        // inputs
        [
          [
            wethAddress,
            web3.utils.toWei('0.1', 'ether'),
            AMOUNT_ABSOLUTE,
            web3.utils.toWei('0.01', 'ether'),
            accounts[1],
          ],
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await WETH.methods.balanceOf(accounts[1])
        .call()
        .then((result) => {
          assert.equal(result, web3.utils.toWei('0.0008', 'ether'));
        });
      await WETH.methods.balanceOf(router.options.address)
        .call()
        .then((result) => {
          assert.equal(result, web3.utils.toWei('0.0002', 'ether'));
        });
    });
  });
});
