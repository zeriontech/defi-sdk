import displayToken from '../helpers/displayToken';
import expectRevert from '../helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';

// const { BN } = web3.utils;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';
const ADAPTER_ASSET = 0;
// const ADAPTER_DEBT = 1;
const ADAPTER_EXCHANGE = 2;

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const ChaiAdapter = artifacts.require('./ChaiInteractiveAdapter');
const CompoundAssetAdapter = artifacts.require('./CompoundAssetInteractiveAdapter');
const OneSplitAdapter = artifacts.require('./OneSplitInteractiveAdapter');
const ChaiTokenAdapter = artifacts.require('./ChaiTokenAdapter');
const CompoundTokenAdapter = artifacts.require('./CompoundTokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('Core', () => {
  const chaiAddress = '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215';
  const cDAIAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  let accounts;
  let core;
  let tokenSpender;
  let protocolAdapterRegistry;
  let compoundAssetAdapterAddress;
  let chaiAdapterAddress;
  let chaiTokenAdapterAddress;
  let compoundTokenAdapterAddress;
  let erc20TokenAdapterAddress;
  let protocolAdapterAddress;

  describe.skip('Chai <-> DSR transfer', () => {
    beforeEach(async () => {
      accounts = await web3.eth.getAccounts();
      await ChaiAdapter.new({ from: accounts[0] })
        .then((result) => {
          chaiAdapterAddress = result.address;
        });
      await ChaiTokenAdapter.new({ from: accounts[0] })
        .then((result) => {
          chaiTokenAdapterAddress = result.address;
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
        [web3.utils.toHex('Chai')],
        [[
          chaiAdapterAddress,
        ]],
        [[[chaiAddress]]],
      )
        .send({
          from: accounts[0],
          gas: '1000000',
        });
      await protocolAdapterRegistry.methods.addTokenAdapters(
        [web3.utils.toHex('ERC20'), web3.utils.toHex('Chai Token')],
        [erc20TokenAdapterAddress, chaiTokenAdapterAddress],
      )
        .send({
          from: accounts[0],
          gas: '1000000',
        });
      await CompoundAssetAdapter.new({ from: accounts[0] })
        .then((result) => {
          compoundAssetAdapterAddress = result.address;
        });
      await CompoundTokenAdapter.new({ from: accounts[0] })
        .then((result) => {
          compoundTokenAdapterAddress = result.address;
        });
      await protocolAdapterRegistry.methods.addProtocolAdapters(
        [web3.utils.toHex('Compound')],
        [[
          compoundAssetAdapterAddress,
        ]],
        [[[
          cDAIAddress,
        ]]],
      )
        .send({
          from: accounts[0],
          gas: '1000000',
        });
      await protocolAdapterRegistry.methods.addTokenAdapters(
        [web3.utils.toHex('CToken')],
        [compoundTokenAdapterAddress],
      )
        .send({
          from: accounts[0],
          gas: '300000',
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
          tokenSpender = result.contract;
        });
    });

    it('should be correct Chai -> Compound transfer', async () => {
      let chaiAmount;
      console.log('Compound and Chai balances before:');
      await protocolAdapterRegistry.methods.getBalances(accounts[0])
        .call()
        .then(async (result) => {
          await displayToken(protocolAdapterRegistry, result[0].adapterBalances[0].balances[0]);
          await displayToken(protocolAdapterRegistry, result[1].adapterBalances[0].balances[0]);
        });
      // approve CHAI to tokenSpender contract
      let CHAI;
      await ERC20.at(chaiAddress)
        .then((result) => {
          CHAI = result.contract;
        });
      await CHAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          chaiAmount = result;
        });
      await CHAI.methods.approve(tokenSpender.options.address, chaiAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      // call core with two actions
      await tokenSpender.methods.startExecution(
        [
          [
            ACTION_WITHDRAW,
            web3.utils.toHex('Chai'),
            ADAPTER_ASSET,
            [chaiAddress],
            [convertToShare(1)],
            [AMOUNT_RELATIVE],
            EMPTY_BYTES,
          ],
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('Compound'),
            ADAPTER_ASSET,
            [daiAddress],
            [convertToShare(1)],
            [AMOUNT_RELATIVE],
            EMPTY_BYTES,
          ],
        ],
        [
          [chaiAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
        ],
        [
          // no need to check outputs as there should be no change
        ],
      )
        .send({
          from: accounts[0],
          gas: 1000000,
        })
        .then((receipt) => {
          console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
        });
      console.log('Compound and Chai balances after:');
      await protocolAdapterRegistry.methods.getBalances(accounts[0])
        .call()
        .then(async (result) => {
          await displayToken(protocolAdapterRegistry, result[0].adapterBalances[0].balances[0]);
        });
    });

    it.skip('should be correct Compound -> Chai transfer', async () => {
      let cdaiAmount;
      console.log('Compound and Chai balances before:');
      await protocolAdapterRegistry.methods.getBalances(accounts[0])
        .call()
        .then(async (result) => {
          await displayToken(protocolAdapterRegistry, result[0].adapterBalances[0].balances[0]);
        });
      // approve cDAI to tokenSpender contract
      let cDAI;
      await ERC20.at(cDAIAddress)
        .then((result) => {
          cDAI = result.contract;
        });
      await cDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          cdaiAmount = result;
        });
      await cDAI.methods.approve(tokenSpender.options.address, cdaiAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      // call core with two actions
      await tokenSpender.methods.startExecution(
        [
          [
            ACTION_WITHDRAW,
            web3.utils.toHex('Compound'),
            ADAPTER_ASSET,
            [cDAIAddress],
            [convertToShare(0.5)],
            [AMOUNT_RELATIVE],
            EMPTY_BYTES,
          ],
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('Chai'),
            ADAPTER_ASSET,
            [chaiAddress],
            [convertToShare(1)],
            [AMOUNT_RELATIVE],
            EMPTY_BYTES,
          ],
        ],
        [
          [cDAIAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
        ],
        [
          // no need to check outputs as there should be no change
        ],
      )
        .send({
          from: accounts[0],
          gas: 1000000,
        })
        .then((receipt) => {
          console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
        });
      console.log('Compound and Chai balances after:');
      await protocolAdapterRegistry.methods.getBalances(accounts[0])
        .call()
        .then(async (result) => {
          await displayToken(protocolAdapterRegistry, result[0].adapterBalances[0].balances[0]);
        });
    });
  });

  describe.skip('1split tests', () => {
    beforeEach(async () => {
      accounts = await web3.eth.getAccounts();
      await OneSplitAdapter.new({ from: accounts[0] })
        .then((result) => {
          protocolAdapterAddress = result.address;
        });
      await ProtocolAdapterRegistry.new({ from: accounts[0] })
        .then((result) => {
          protocolAdapterRegistry = result.contract;
        });
      await protocolAdapterRegistry.methods.addProtocolAdapters(
        [web3.utils.toHex('OneSplit')],
        [[
          ZERO, ZERO, protocolAdapterAddress,
        ]],
        [[[], [], []]],
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
          tokenSpender = result.contract;
        });
    });

    it('should be correct 1split exchange (eth->dai) with 0.01 ETH', async () => {
      let DAI;
      await ERC20.at(daiAddress)
        .then((result) => {
          DAI = result.contract;
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      console.log('calling core with action...');
      await tokenSpender.methods.startExecution(
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('OneSplit'),
            ADAPTER_EXCHANGE,
            [ethAddress],
            ['10000000000000000'],
            [AMOUNT_ABSOLUTE],
            web3.eth.abi.encodeParameter('address', daiAddress),
          ],
        ],
        [],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
          value: web3.utils.toWei('0.01', 'ether'),
        })
        .then((receipt) => {
          console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
    });

    it('should be correct 1split exchange (dai->usdc) with 100% DAI', async () => {
      let DAI;
      let daiAmount;
      await ERC20.at(daiAddress)
        .then((result) => {
          DAI = result.contract;
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
          console.log(`DAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods.approve(tokenSpender.options.address, daiAmount)
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      let USDC;
      await ERC20.at(usdcAddress)
        .then((result) => {
          USDC = result.contract;
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`USDC amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      console.log('calling core with action...');
      await tokenSpender.methods.startExecution(
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('OneSplit'),
            ADAPTER_EXCHANGE,
            [daiAddress],
            [convertToShare(1)],
            [AMOUNT_RELATIVE],
            web3.eth.abi.encodeParameter('address', usdcAddress),
          ],
        ],
        [
          [daiAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
        ],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        })
        .then((receipt) => {
          console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`DAI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`USDC amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await USDC.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct 1split exchange (eth->dai) with 0.01 ETH', async () => {
      let DAI;
      await ERC20.at(daiAddress)
        .then((result) => {
          DAI = result.contract;
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      console.log('calling core with action...');
      await tokenSpender.methods.startExecution(
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('OneSplit'),
            ADAPTER_EXCHANGE,
            [ethAddress],
            ['10000000000000000'],
            [AMOUNT_ABSOLUTE],
            web3.eth.abi.encodeParameter('address', daiAddress),
          ],
        ],
        [],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
          value: web3.utils.toWei('0.01', 'ether'),
        })
        .then((receipt) => {
          console.log(`called tokenSpender for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
    });

    it('should be correct 1split exchange (dai->eth) with 100% DAI', async () => {
      let DAI;
      let daiAmount;
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await ERC20.at(daiAddress)
        .then((result) => {
          DAI = result.contract;
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
          console.log(`DAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods.approve(tokenSpender.options.address, daiAmount)
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      console.log('calling core with action...');
      await tokenSpender.methods.startExecution(
        [
          [
            ACTION_DEPOSIT,
            web3.utils.toHex('OneSplit'),
            ADAPTER_EXCHANGE,
            [daiAddress],
            [convertToShare(1)],
            [AMOUNT_RELATIVE],
            web3.eth.abi.encodeParameter('address', ethAddress),
          ],
        ],
        [
          [daiAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
        ],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`DAI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(core.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('revert on withdraw call', async () => {
      let DAI;
      let daiAmount;
      await ERC20.at(daiAddress)
        .then((result) => {
          DAI = result.contract;
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
        });
      await DAI.methods.approve(tokenSpender.options.address, daiAmount)
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await expectRevert(tokenSpender.methods.startExecution(
        [
          [
            ACTION_WITHDRAW,
            web3.utils.toHex('OneSplit'),
            ADAPTER_EXCHANGE,
            [daiAddress],
            [convertToShare(1)],
            [AMOUNT_RELATIVE],
            web3.eth.abi.encodeParameter('address', daiAddress),
          ],
        ],
        [
          [daiAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
        ],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        }));
    });
  });
});
