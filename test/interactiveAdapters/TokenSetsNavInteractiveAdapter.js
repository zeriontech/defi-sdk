import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';
import expectRevert from '../helpers/expectRevert';

const TOKENSETS_ASSET_ADAPTER = convertToBytes32('TokenSets Nav');
const WETH_ASSET_ADAPTER = convertToBytes32('Weth');

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const TokenSetsAdapter = artifacts.require('./TokenSetsNavInteractiveAdapter');
const WethInteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('TokenSetsNavInteractiveAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

  const setAddress = '0x23687D9d40F9Ecc86E7666DDdB820e700F954526';

  let accounts;
  let core;
  let protocolAdapterRegistry;
  let router;
  let tokenSetsAdapterAddress;
  let wethAdapterAddress;

  let SET;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await TokenSetsAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenSetsAdapterAddress = result.address;
      });
    await WethInteractiveAdapter.new({ from: accounts[0] })
      .then((result) => {
        wethAdapterAddress = result.address;
      });
    await ProtocolAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterRegistry = result.contract;
      });
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [
        TOKENSETS_ASSET_ADAPTER,
        WETH_ASSET_ADAPTER,
      ],
      [
        tokenSetsAdapterAddress,
        wethAdapterAddress,
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
    await ERC20.at(setAddress)
      .then((result) => {
        SET = result.contract;
      });
  });
  describe('Scenario ETH <-> ETH USD Yield Farm set', () => {
    it('should not buy 1 set with existing ETH with wrong tokens', async () => {
      await expectRevert(router.methods.execute(
        // actions
        [
          [
            WETH_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [ethAddress, web3.utils.toWei('1', 'ether'), AMOUNT_ABSOLUTE],
            ],
            EMPTY_BYTES,
          ],
          [
            TOKENSETS_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, web3.utils.toWei('1', 'ether'), AMOUNT_RELATIVE],
              [wethAddress, web3.utils.toWei('1', 'ether'), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', setAddress),
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
        }));
    });

    it('should buy 1 set with existing ETH', async () => {
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        // actions
        [
          [
            WETH_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [ethAddress, web3.utils.toWei('1', 'ether'), AMOUNT_ABSOLUTE],
            ],
            EMPTY_BYTES,
          ],
          [
            TOKENSETS_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, web3.utils.toWei('1', 'ether'), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', setAddress),
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
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(core.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
      await SET.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should not sell 50% of set with wrong tokens', async () => {
      let setBalance;
      await SET.methods.balanceOf(accounts[0])
        .call()
        .then((result) => {
          setBalance = result;
        });
      await SET.methods.approve(router.options.address, setBalance)
        .send({
          from: accounts[0],
          gas: 1000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await expectRevert(router.methods.execute(
        // actions
        [
          [
            TOKENSETS_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [setAddress, web3.utils.toWei('1', 'ether'), AMOUNT_RELATIVE],
              [setAddress, web3.utils.toWei('1', 'ether'), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', wethAddress),
          ],
          [
            WETH_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [wethAddress, web3.utils.toWei('1', 'ether'), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [
          [setAddress, convertToShare(0.5), AMOUNT_RELATIVE],
        ],
        // fee
        [0, ZERO],
        // outputs
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        }));
    });

    it('should sell 50% of set', async () => {
      let setBalance;
      await SET.methods.balanceOf(accounts[0])
        .call()
        .then((result) => {
          setBalance = result;
          console.log(`set amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await SET.methods.approve(router.options.address, setBalance)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        // actions
        [
          [
            TOKENSETS_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [setAddress, web3.utils.toWei('1', 'ether'), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', wethAddress),
          ],
          [
            WETH_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [wethAddress, web3.utils.toWei('1', 'ether'), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [
          [setAddress, convertToShare(0.5), AMOUNT_RELATIVE],
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
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(core.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
      await SET.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
