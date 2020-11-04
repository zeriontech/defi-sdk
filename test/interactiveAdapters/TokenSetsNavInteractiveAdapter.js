// import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';
// import expectRevert from '../helpers/expectRevert';

const TOKENSETS_ASSET_ADAPTER = convertToBytes32('TokenSets Nav');
const UNISWAP_V1_EXCHANGE_ADAPTER = convertToBytes32('Uniswap V1 Exchange');
const WETH_ASSET_ADAPTER = convertToBytes32('Weth');

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
// const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const TokenSetsAdapter = artifacts.require('./TokenSetsNavInteractiveAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const WethInteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract.only('TokenSetsNavInteractiveAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  const setAddress = '0x23687D9d40F9Ecc86E7666DDdB820e700F954526';

  let accounts;
  let core;
  let protocolAdapterRegistry;
  let router;
  let tokenSetsAdapterAddress;
  let wethAdapterAddress;
  let uniswapAdapterAddress;
  let erc20TokenAdapterAddress;

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
    await UniswapV2ExchangeAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapAdapterAddress = result.address;
      });
    await ERC20TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        erc20TokenAdapterAddress = result.address;
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
    await protocolAdapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [erc20TokenAdapterAddress],
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
    it('should buy 1 set with existing ETH', async () => {
      await web3.eth.getBalance(accounts[0])
        .call()
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
            encodeParameters('address', setAddress),
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
        });
      await web3.eth.getBalance(accounts[0])
        .call()
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await SET.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should sell 50% of set', async () => {
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
        });
      await web3.eth.getBalance(accounts[0])
        .call()
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
            TOKENSETS_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [setAddress, web3.utils.toWei('1', 'ether'), AMOUNT_RELATIVE],
            ],
            encodeParameters('address', wethAddress),
          ],
          [
            WETH_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [wethAddress, web3.utils.toWei('1', 'ether'), AMOUNT_ABSOLUTE],
            ],
            EMPTY_BYTES,
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
          from: accounts[0],
        });
      await web3.eth.getBalance(accounts[0])
        .call()
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(core.options.address)
        .call()
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
