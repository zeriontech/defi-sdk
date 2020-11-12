import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';
import expectRevert from '../helpers/expectRevert';

const TOKENSETS_ASSET_ADAPTER = convertToBytes32('TokenSets Rebalancing');
const UNISWAP_V1_EXCHANGE_ADAPTER = convertToBytes32('Uniswap V1 Exchange');
const WETH_ASSET_ADAPTER = convertToBytes32('Weth');

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
// const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const TokenSetsAdapter = artifacts.require('./TokenSetsRebalancingInteractiveAdapter');
const WethInteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const UniswapV1ExchangeAdapter = artifacts.require('./UniswapV1ExchangeInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract.only('TokenSetsRebalancingInteractiveAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const linkAddress = '0x514910771AF9Ca656af840dff83E8264EcF986CA';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const setAddress = '0x542156d51d10db5accb99f9db7e7c91b74e80a2c';

  let accounts;
  let core;
  let protocolAdapterRegistry;
  let router;
  let tokenSetsAdapterAddress;
  let wethAdapterAddress;
  let uniswapAdapterAddress;

  let LINK;
  let WETH;
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
    await UniswapV1ExchangeAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapAdapterAddress = result.address;
      });
    await ProtocolAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterRegistry = result.contract;
      });
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [
        TOKENSETS_ASSET_ADAPTER,
        WETH_ASSET_ADAPTER,
        UNISWAP_V1_EXCHANGE_ADAPTER,
      ],
      [
        tokenSetsAdapterAddress,
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
    await ERC20.at(linkAddress)
      .then((result) => {
        LINK = result.contract;
      });
    await ERC20.at(wethAddress)
      .then((result) => {
        WETH = result.contract;
      });
    await ERC20.at(setAddress)
      .then((result) => {
        SET = result.contract;
      });
  });
  describe('Scenario ETH <-> WETH/LINK set', () => {
    it('should buy token sets for 1 ether', async () => {
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await LINK.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`link amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      const actions = [
        // exchange ETH to LINK
        [
          UNISWAP_V1_EXCHANGE_ADAPTER,
          ACTION_DEPOSIT,
          [
            [ethAddress, convertToShare(0.1317), AMOUNT_RELATIVE],
          ],
          web3.eth.abi.encodeParameter('address', linkAddress),
        ],
        // exchange ETH to WETH
        [
          WETH_ASSET_ADAPTER,
          ACTION_DEPOSIT,
          [
            [ethAddress, convertToShare(1), AMOUNT_RELATIVE],
          ],
          EMPTY_BYTES,
        ],
        [
          TOKENSETS_ASSET_ADAPTER,
          ACTION_DEPOSIT,
          [
            [linkAddress, convertToShare(1), AMOUNT_RELATIVE],
            [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
          ],
          web3.eth.abi.encodeParameter(
            'address',
            setAddress,
          ),
        ],
      ];
      // console.log(actions);
      await router.methods.execute(
        actions,
        [],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 5000000,
          value: web3.utils.toWei('1', 'ether'),
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is   ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await LINK.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`link amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount after is   ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await LINK.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await SET.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(core.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should not sell all token set for eth with wrong tokens', async () => {
      let setAmount;
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          setAmount = result;
        });
      await SET.methods.approve(router.options.address, setAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      const actions = [
        // withdraw to all sets
        [
          TOKENSETS_ASSET_ADAPTER,
          ACTION_WITHDRAW,
          [
            [setAddress, convertToShare(1), AMOUNT_RELATIVE],
            [setAddress, convertToShare(1), AMOUNT_RELATIVE],
          ],
          EMPTY_BYTES,
        ],
        // swap change (in LINK) back to ETH
        [
          UNISWAP_V1_EXCHANGE_ADAPTER,
          ACTION_DEPOSIT,
          [
            [linkAddress, convertToShare(1), AMOUNT_RELATIVE],
          ],
          web3.eth.abi.encodeParameter('address', ethAddress),
        ],
        // swap change (in WETH) back to ETH
        [
          WETH_ASSET_ADAPTER,
          ACTION_WITHDRAW,
          [
            [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
          ],
          EMPTY_BYTES,
        ],
      ];
      // console.log(actions);
      await expectRevert(router.methods.execute(
        actions,
        [
          [setAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 5000000,
        }));
    });

    it('should sell all token set for eth', async () => {
      let setAmount;
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await LINK.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`LINK amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount before is  ${web3.utils.fromWei(result, 'ether')}`);
          setAmount = result;
        });
      await SET.methods.approve(router.options.address, setAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      const actions = [
        // withdraw to all sets
        [
          TOKENSETS_ASSET_ADAPTER,
          ACTION_WITHDRAW,
          [
            [setAddress, convertToShare(1), AMOUNT_RELATIVE],
          ],
          EMPTY_BYTES,
        ],
        // swap change (in LINK) back to ETH
        [
          UNISWAP_V1_EXCHANGE_ADAPTER,
          ACTION_DEPOSIT,
          [
            [linkAddress, convertToShare(1), AMOUNT_RELATIVE],
          ],
          web3.eth.abi.encodeParameter('address', ethAddress),
        ],
        // swap change (in WETH) back to ETH
        [
          WETH_ASSET_ADAPTER,
          ACTION_WITHDRAW,
          [
            [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
          ],
          EMPTY_BYTES,
        ],
      ];
      // console.log(actions);
      await router.methods.execute(
        actions,
        [
          [setAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 5000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await LINK.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`LINK amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await LINK.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await SET.methods['balanceOf(address)'](core.options.address)
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
