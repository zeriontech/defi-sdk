// import displayToken from './helpers/displayToken';
// import expectRevert from './helpers/expectRevert';

const { BN } = web3.utils;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const RELATIVE_AMOUNT_BASE = '1000000000000000000';
// const EMPTY_BYTES = '0x';
// const ADAPTER_ASSET = 0;
// const ADAPTER_DEBT = 1;
const ADAPTER_EXCHANGE = 2;

const ZERO = '0x0000000000000000000000000000000000000000';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const InteractiveAdapter = artifacts.require('./UniswapV1ExchangeInteractiveAdapter');
const Logic = artifacts.require('./Logic');
const ERC20 = artifacts.require('./ERC20');

contract.only('Logic', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const mkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  let accounts;
  let logic;
  let tokenSpender;
  let adapterRegistry;
  let protocolAdapterAddress;
  let DAI;
  let MKR;

  describe('ETH <-> DAI exchange', () => {
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
        [web3.utils.toHex('Uniswap')],
        [[
          'Mock Protocol Name',
          'Mock protocol description',
          'Mock website',
          'Mock icon',
          '0',
        ]],
        [[
          ZERO, ZERO, protocolAdapterAddress,
        ]],
        [[[], [], []]],
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
      await ERC20.at(daiAddress)
        .then((result) => {
          DAI = result.contract;
        });
    });

    it('should be correct one-side exchange deposit-like', async () => {
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is    ${web3.utils.fromWei(result, 'ether')}`);
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
            web3.utils.toHex('Uniswap'),
            ADAPTER_EXCHANGE,
            [ethAddress],
            ['1000000000000000000'],
            [AMOUNT_ABSOLUTE],
            web3.eth.abi.encodeParameter('address', daiAddress),
          ],
        ],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
          value: '1000000000000000000',
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](logic.options.address)
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
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is    ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await DAI.methods['approve(address,uint256)'](tokenSpender, daiAmount.toString())
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
            ACTION_DEPOSIT,
            web3.utils.toHex('Uniswap'),
            ADAPTER_EXCHANGE,
            [daiAddress],
            [RELATIVE_AMOUNT_BASE],
            [AMOUNT_RELATIVE],
            web3.eth.abi.encodeParameter('address', ethAddress),
          ],
        ],
        [
          [daiAddress, RELATIVE_AMOUNT_BASE, AMOUNT_RELATIVE, 0],
        ],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
          value: '1000000000000000000',
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(logic.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct one-side exchange withdraw-like', async () => {
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is    ${web3.utils.fromWei(result, 'ether')}`);
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
            web3.utils.toHex('Uniswap'),
            ADAPTER_EXCHANGE,
            [daiAddress],
            ['100000000000000000000'],
            [AMOUNT_ABSOLUTE],
            web3.eth.abi.encodeParameter('address', ethAddress),
          ],
        ],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
          value: '1000000000000000000',
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(logic.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct reverse exchange withdraw-like', async () => {
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is    ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await DAI.methods['approve(address,uint256)'](tokenSpender, daiAmount.toString())
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
            web3.utils.toHex('Uniswap'),
            ADAPTER_EXCHANGE,
            [ethAddress],
            ['300000000000000000'],
            [AMOUNT_ABSOLUTE],
            web3.eth.abi.encodeParameter('address', daiAddress),
          ],
        ],
        [
          [daiAddress, RELATIVE_AMOUNT_BASE, AMOUNT_RELATIVE, 0],
        ],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](logic.options.address)
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

  describe('MKR <-> DAI exchange', () => {
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
        [web3.utils.toHex('Uniswap')],
        [[
          'Mock Protocol Name',
          'Mock protocol description',
          'Mock website',
          'Mock icon',
          '0',
        ]],
        [[
          ZERO, ZERO, protocolAdapterAddress,
        ]],
        [[[], [], []]],
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
      await ERC20.at(daiAddress)
        .then((result) => {
          DAI = result.contract;
        });
      await ERC20.at(mkrAddress)
        .then((result) => {
          MKR = result.contract;
        });
    });

    it('should be correct one-side exchange deposit-like', async () => {
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is    ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await MKR.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`mkr amount before is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['approve(address,uint256)'](tokenSpender, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      console.log('calling logic with action...');
      await logic.methods.executeActions(
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('Uniswap'),
            ADAPTER_EXCHANGE,
            [daiAddress],
            [RELATIVE_AMOUNT_BASE],
            [AMOUNT_RELATIVE],
            web3.eth.abi.encodeParameter('address', mkrAddress),
          ],
        ],
        [
          [daiAddress, RELATIVE_AMOUNT_BASE, AMOUNT_RELATIVE, 0],
        ],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await MKR.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`mkr amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await MKR.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct reverse exchange deposit-like', async () => {
      let mkrAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await MKR.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`mkr amount before is    ${web3.utils.fromWei(result, 'ether')}`);
          mkrAmount = result;
        });
      await MKR.methods['approve(address,uint256)'](tokenSpender, mkrAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      console.log('calling logic with action...');
      await logic.methods.executeActions(
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('Uniswap'),
            ADAPTER_EXCHANGE,
            [mkrAddress],
            [RELATIVE_AMOUNT_BASE],
            [AMOUNT_RELATIVE],
            web3.eth.abi.encodeParameter('address', daiAddress),
          ],
        ],
        [
          [mkrAddress, RELATIVE_AMOUNT_BASE, AMOUNT_RELATIVE, 0],
        ],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await MKR.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct noe-side exchange withdraw-like', async () => {
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is    ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await MKR.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`mkr amount before is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['approve(address,uint256)'](tokenSpender, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      console.log('calling logic with action...');
      await logic.methods.executeActions(
        [
          [
            ACTION_WITHDRAW,
            web3.utils.toHex('Uniswap'),
            ADAPTER_EXCHANGE,
            [mkrAddress],
            ['1000000000000000'],
            [AMOUNT_ABSOLUTE],
            web3.eth.abi.encodeParameter('address', daiAddress),
          ],
        ],
        [
          [daiAddress, RELATIVE_AMOUNT_BASE, AMOUNT_RELATIVE, 0],
        ],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await MKR.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`mkr amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await MKR.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct reverse exchange withdraw-like', async () => {
      let mkrAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await MKR.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`mkr amount before is    ${web3.utils.fromWei(result, 'ether')}`);
          mkrAmount = result;
        });
      await MKR.methods['approve(address,uint256)'](tokenSpender, mkrAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      console.log('calling logic with action...');
      await logic.methods.executeActions(
        [
          [
            ACTION_WITHDRAW,
            web3.utils.toHex('Uniswap'),
            ADAPTER_EXCHANGE,
            [daiAddress],
            ['100000000000000000'],
            [AMOUNT_ABSOLUTE],
            web3.eth.abi.encodeParameter('address', mkrAddress),
          ],
        ],
        [
          [mkrAddress, RELATIVE_AMOUNT_BASE, AMOUNT_RELATIVE, 0],
        ],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await MKR.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`mkr amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await MKR.methods['balanceOf(address)'](logic.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
