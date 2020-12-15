import expectRevert from '../helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';

const { BN } = web3.utils;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./MockInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');
const WETH9 = artifacts.require('./WETH9');

contract.only('Core + Router', () => {
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  let WETH;

  describe('Core and Router tests using Mock', async () => {
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
      await protocolAdapterRegistry.methods.addProtocolAdapters(
        [convertToBytes32('Mock')],
        [
          protocolAdapterAddress,
        ],
        [[]],
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
      await ERC20.at(wethAddress)
        .then((result) => {
          WETH = result.contract;
        });
    });

    it('should not deploy router with no core', async () => {
      await expectRevert(Router.new(
        ZERO,
        { from: accounts[0] },
      ));
    });

    it('should be correct core', async () => {
      await router.methods.core()
        .call()
        .then((result) => {
          assert.equal(result, core.options.address);
        });
    });

    it('should be correct adapter registry', async () => {
      await core.methods.protocolAdapterRegistry()
        .call()
        .then((result) => {
          assert.equal(result, protocolAdapterRegistry.options.address);
        });
    });

    it('should not deploy core with no registry', async () => {
      await expectRevert(Core.new(
        ZERO,
        { from: accounts[0] },
      ));
    });

    it('should not execute action with wrong name', async () => {
      await expectRevert(router.methods.execute(
        // actions
        [
          [
            convertToBytes32('Mock1'),
            ACTION_DEPOSIT,
            [],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [],
        // fee
        [
          0,
          ZERO,
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
          value: web3.utils.toWei('1', 'ether'),
        }));
    });

    it('should not execute action with too large requirement', async () => {
      await expectRevert(router.methods.execute(
        // actions
        [
          [
            convertToBytes32('Mock'),
            ACTION_DEPOSIT,
            [],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [],
        // fee
        [
          0,
          ZERO,
        ],
        // outputs
        [
          [wethAddress, web3.utils.toWei('2', 'ether')],
        ],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
          value: web3.utils.toWei('1', 'ether'),
        }));
    });

    it('should not execute action (on core) with zero action type', async () => {
      await expectRevert(core.methods.executeActions(
        // actions
        [
          [
            convertToBytes32('Mock'),
            0,
            [],
            EMPTY_BYTES,
          ],
        ],
        // outputs
        [],
        accounts[0],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
          value: web3.utils.toWei('1', 'ether'),
        }));
    });

    it('should not execute action (on core) with zero account', async () => {
      await expectRevert(core.methods.executeActions(
        // actions
        [
          [
            convertToBytes32('Mock'),
            ACTION_DEPOSIT,
            [],
            EMPTY_BYTES,
          ],
        ],
        // outputs
        [],
        ZERO,
      )
        .send({
          from: accounts[0],
          gas: 10000000,
          value: web3.utils.toWei('1', 'ether'),
        }));
    });

    it('should execute deposit action (+ execute with CHI)', async () => {
      await router.methods.execute(
        // actions
        [
          [
            convertToBytes32('Mock'),
            ACTION_DEPOSIT,
            [],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [],
        // fee
        [
          0,
          ZERO,
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
          value: web3.utils.toWei('1', 'ether'),
        });
      await router.methods.executeWithCHI(
        // actions
        [
          [
            convertToBytes32('Mock'),
            ACTION_DEPOSIT,
            [],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [],
        // fee
        [
          0,
          ZERO,
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
          value: web3.utils.toWei('1', 'ether'),
        });
    });

    it('should execute withdraw action', async () => {
      await WETH.methods.approve(router.options.address, 1)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        // actions
        [
          [
            convertToBytes32('Mock'),
            ACTION_WITHDRAW,
            [],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [
          [
            [wethAddress, 1, AMOUNT_ABSOLUTE],
            [0, EMPTY_BYTES],
          ],
        ],
        // fee
        [
          0,
          ZERO,
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        });
    });

    it('should not execute withdraw action with too large relative amount', async () => {
      let wethBalance;
      await WETH.methods.balanceOf(accounts[0])
        .call()
        .then((result) => {
          wethBalance = result;
        });
      await WETH.methods.approve(router.options.address, wethBalance)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await expectRevert(router.methods.execute(
        // actions
        [
          [
            convertToBytes32('Mock'),
            ACTION_WITHDRAW,
            [],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [
          [
            [wethAddress, web3.utils.toWei('1.1', 'ether'), AMOUNT_RELATIVE],
            [0, EMPTY_BYTES],
          ],
        ],
        // fee
        [
          0,
          ZERO,
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should not execute withdraw action with bad amount type', async () => {
      let wethBalance;
      await WETH.methods.balanceOf(accounts[0])
        .call()
        .then((result) => {
          wethBalance = result;
        });
      await WETH.methods.approve(router.options.address, wethBalance)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await expectRevert(router.methods.execute(
        // actions
        [
          [
            convertToBytes32('Mock'),
            ACTION_WITHDRAW,
            [],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [
          [
            [wethAddress, web3.utils.toWei('1', 'ether'), 0],
            [0, EMPTY_BYTES],
          ],
        ],
        // fee
        [
          0,
          ZERO,
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
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

    it('should not return lost tokens if receiver cannot receive', async () => {
      await router.methods.returnLostTokens(ethAddress, accounts[0])
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await expectRevert(router.methods.returnLostTokens(ethAddress, router.options.address)
        .send({
          from: accounts[0],
          gas: 1000000,
        }));
    });

    it('should not handle large fees correctly', async () => {
      await WETH.methods.approve(router.options.address, web3.utils.toWei('1', 'ether'))
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await expectRevert(router.methods.execute(
        // actions
        [],
        // inputs
        [
          [
            [
              wethAddress,
              web3.utils.toWei('1', 'ether'),
              AMOUNT_ABSOLUTE,
            ],
            [0, EMPTY_BYTES],
          ],
        ],
        // fee
        [
          web3.utils.toWei('0.011', 'ether'),
          accounts[1],
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should not handle large eth fees correctly', async () => {
      await expectRevert(router.methods.execute(
        // actions
        [],
        // inputs
        [],
        // fee
        [
          web3.utils.toWei('0.011', 'ether'),
          accounts[1],
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          value: web3.utils.toWei('1', 'ether'),
          gas: 10000000,
        }));
    });

    it('should not accept 0 inputs', async () => {
      await expectRevert(router.methods.execute(
        // actions
        [],
        // inputs
        [
          [
            [
              daiAddress,
              0,
              AMOUNT_ABSOLUTE,
            ],
            [0, ZERO_BYTES],
          ],
        ],
        // fee
        [
          0,
          ZERO,
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should accept full share input', async () => {
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount)
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        // actions
        [],
        // inputs
        [
          [
            [
              daiAddress,
              convertToShare(1),
              AMOUNT_RELATIVE,
            ],
            [0, ZERO_BYTES],
          ],
        ],
        // fee
        [
          0,
          ZERO,
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        });
    });

    it('should accept not full share input', async () => {
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount)
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        // actions
        [],
        // inputs
        [
          [
            [
              ethAddress,
              convertToShare(0.99),
              AMOUNT_RELATIVE,
            ],
            [0, ZERO_BYTES],
          ],
        ],
        // fee
        [
          0,
          ZERO,
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          value: web3.utils.toWei('1', 'ether'),
          gas: 10000000,
        });
    });

    it('should handle eth fee correctly', async () => {
      let prevBalance;
      await web3.eth.getBalance(accounts[1])
        .then((result) => {
          prevBalance = result;
        });
      await router.methods.execute(
        // actions
        [],
        // inputs
        [],
        // fee
        [
          web3.utils.toWei('0.01', 'ether'),
          accounts[1],
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          value: web3.utils.toWei('1', 'ether'),
          gas: 10000000,
        });
      await web3.eth.getBalance(accounts[1])
        .then((result) => {
          assert.equal(result, new BN(prevBalance).add(new BN(web3.utils.toWei('0.01', 'ether'))));
        });
    });

    it('should not handle fees to ZERO correctly', async () => {
      await WETH.methods.approve(router.options.address, web3.utils.toWei('1', 'ether'))
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await expectRevert(router.methods.execute(
        // actions
        [],
        // inputs
        [],
        // fee
        [
          web3.utils.toWei('0.01', 'ether'),
          ZERO,
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should not handle fees to non-receiving address correctly', async () => {
      await expectRevert(router.methods.execute(
        // actions
        [],
        // inputs
        [],
        // fee
        [
          web3.utils.toWei('0.01', 'ether'),
          router.options.address,
        ],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          value: web3.utils.toWei('1', 'ether'),
          gas: 10000000,
        }));
    });

    it('should handle fees correctly', async () => {
      await WETH9.at(wethAddress)
        .then((result) => {
          result.contract.methods.deposit()
            .send({
              from: accounts[0],
              value: web3.utils.toWei('1', 'ether'),
              gas: 1000000,
            });
        });
      await WETH.methods.approve(router.options.address, web3.utils.toWei('1', 'ether'))
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      let wethBalance;
      await WETH.methods.balanceOf(accounts[1])
        .call()
        .then((result) => {
          wethBalance = new BN(result);
        });
      await router.methods.execute(
        // actions
        [],
        // inputs
        [
          [
            [
              wethAddress,
              web3.utils.toWei('0.1', 'ether'),
              AMOUNT_ABSOLUTE,
            ],
            [0, EMPTY_BYTES],
          ],
        ],
        // fee
        [
          web3.utils.toWei('0.01', 'ether'),
          accounts[1],
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
          assert.equal(wethBalance.sub(new BN(result)), web3.utils.toWei('0.001', 'ether'));
        });
    });
  });
});
