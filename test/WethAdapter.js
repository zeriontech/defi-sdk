// import displayToken from './helpers/displayToken';
// import expectRevert from './helpers/expectRevert';

const { BN } = web3.utils;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const RELATIVE_AMOUNT_BASE = '1000000000000000000';
const EMPTY_BYTES = '0x';
const ADAPTER_ASSET = 0;
// const ADAPTER_DEBT = 1;
// const ADAPTER_EXCHANGE = 2;

const ZERO = '0x0000000000000000000000000000000000000000';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const InteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const Logic = artifacts.require('./Logic');
const ERC20 = artifacts.require('./ERC20');

contract('Weth interactive adapter', () => {
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  let accounts;
  let logic;
  let tokenSpender;
  let adapterRegistry;
  let protocolAdapterAddress;
  let WETH;

  describe('ETH <-> WETH exchange', () => {
    beforeEach(async () => {
      accounts = await web3.eth.getAccounts();
      await InteractiveAdapter.new({ from: accounts[0] })
        .then((result) => {
          protocolAdapterAddress = result.address;
        });
      await AdapterRegistry.new({ from: accounts[0] })
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
          protocolAdapterAddress,
        ]],
        [[[]]],
      )
        .send({
          from: accounts[0],
          gas: '1000000',
        });
      await Logic.new(
        adapterRegistry.options.address,
        { from: accounts[0] },
      )
        .then((result) => {
          logic = result.contract;
        });
      await logic.methods.tokenSpender()
        .call({ gas: 1000000 })
        .then((result) => {
          tokenSpender = result;
        });
      await ERC20.at(wethAddress)
        .then((result) => {
          WETH = result.contract;
        });
    });

    it('should be correct one-side exchange deposit-like', async () => {
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount before is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      console.log('calling logic with action...');
      await logic.methods.executeActions(
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('Weth'),
            ADAPTER_ASSET,
            [ethAddress],
            ['1000000000000000000'],
            [AMOUNT_ABSOLUTE],
            EMPTY_BYTES,
          ],
        ],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
          value: '1000000000000000000',
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(logic.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct reverse exchange deposit-like', async () => {
      let wethAmount;
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount before is    ${web3.utils.fromWei(result, 'ether')}`);
          wethAmount = result;
        });
      await WETH.methods['approve(address,uint256)'](tokenSpender, wethAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      console.log('calling logic with action...');
      await logic.methods.executeActions(
        [
          [
            ACTION_WITHDRAW,
            web3.utils.toHex('Weth'),
            ADAPTER_ASSET,
            [wethAddress],
            [RELATIVE_AMOUNT_BASE],
            [AMOUNT_RELATIVE],
            EMPTY_BYTES,
          ],
        ],
        [
          [wethAddress, RELATIVE_AMOUNT_BASE, AMOUNT_RELATIVE, 0],
        ],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
          value: '1000000000000000000',
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(logic.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
