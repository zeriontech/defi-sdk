// import displayToken from '../helpers/displayToken';
// import expectRevert from '../helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';

const AAVE_ADAPTER = web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('Aave')).slice(0, -2);
const ASSET_ADAPTER = '01';
const AAVE_ASSET_ADAPTER = `${AAVE_ADAPTER}${ASSET_ADAPTER}`;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
// const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const InteractiveAdapter = artifacts.require('./AaveAssetInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('AaveAssetInteractiveAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const aethAddress = '0x3a3A65aAb0dd2A17E3F1947bA16138cd37d08c04';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const adaiAddress = '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d';

  let accounts;
  let core;
  let router;
  let adapterRegistry;
  let protocolAdapterAddress;
  let AETH;
  let DAI;
  let ADAI;

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
    await adapterRegistry.methods.addProtocolAdapters(
      [
        AAVE_ASSET_ADAPTER,
      ],
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
      adapterRegistry.options.address,
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
    await ERC20.at(aethAddress)
      .then((result) => {
        AETH = result.contract;
      });
    await ERC20.at(daiAddress)
      .then((result) => {
        DAI = result.contract;
      });
    await ERC20.at(adaiAddress)
      .then((result) => {
        ADAI = result.contract;
      });
  });

  describe('ETH <-> aETH', () => {
    it('should not be correct ETH -> aETH deposit if 2 tokens', async () => {
      await AETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`aeth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(` eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.startExecution(
        [
          [
            AAVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              ethAddress,
              ethAddress,
            ],
            [convertToShare(1)],
            [AMOUNT_RELATIVE],
            EMPTY_BYTES,
          ],
        ],
        [],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
          value: web3.utils.toWei('1', 'ether'),
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await AETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`aeth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(` eth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await AETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(core.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should not be correct ETH -> aETH deposit if inconsistent arrays', async () => {
      await AETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`aeth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(` eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.startExecution(
        [
          [
            AAVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [ethAddress],
            [
              convertToShare(1),
              convertToShare(1),
            ],
            [
              AMOUNT_RELATIVE,
              AMOUNT_RELATIVE,
            ],
            EMPTY_BYTES,
          ],
        ],
        [],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
          value: web3.utils.toWei('1', 'ether'),
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await AETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`aeth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(` eth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await AETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(core.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct ETH -> aETH deposit', async () => {
      await AETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`aeth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(` eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.startExecution(
        [
          [
            AAVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [ethAddress],
            [convertToShare(1)],
            [AMOUNT_RELATIVE],
            EMPTY_BYTES,
          ],
        ],
        [],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
          value: web3.utils.toWei('1', 'ether'),
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await AETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`aeth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(` eth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await AETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(core.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should not be correct ETH <- aETH withdraw if 2 tokens', async () => {
      let aethAmount;
      await AETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          aethAmount = result;
          console.log(`aeth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(` eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await AETH.methods.approve(router.options.address, (aethAmount * 2).toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.startExecution(
        [
          [
            AAVE_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              aethAddress,
              aethAddress,
            ],
            [convertToShare(1)],
            [AMOUNT_RELATIVE],
            EMPTY_BYTES,
          ],
        ],
        [
          [aethAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
        ],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await AETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`aeth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(` eth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await AETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(core.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should not be correct ETH <- aETH withdraw if inconsistent arrays', async () => {
      let aethAmount;
      await AETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          aethAmount = result;
          console.log(`aeth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(` eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await AETH.methods.approve(router.options.address, (aethAmount * 2).toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.startExecution(
        [
          [
            AAVE_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [aethAddress],
            [
              convertToShare(1),
              convertToShare(1),
            ],
            [AMOUNT_RELATIVE],
            EMPTY_BYTES,
          ],
        ],
        [
          [aethAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
        ],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await AETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`aeth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(` eth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await AETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(core.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct ETH <- aETH withdraw', async () => {
      let aethAmount;
      await AETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          aethAmount = result;
          console.log(`aeth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(` eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await AETH.methods.approve(router.options.address, (aethAmount * 2).toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.startExecution(
        [
          [
            AAVE_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [aethAddress],
            [convertToShare(1)],
            [AMOUNT_RELATIVE],
            EMPTY_BYTES,
          ],
        ],
        [
          [aethAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
        ],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await AETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`aeth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(` eth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await AETH.methods['balanceOf(address)'](core.options.address)
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

  describe('DAI <-> aDAI', () => {
    it('should be correct DAI -> aDAI deposit', async () => {
      let daiAmount;
      await ADAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`adai amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
          console.log(` dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods.approve(router.options.address, daiAmount)
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.startExecution(
        [
          [
            AAVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [daiAddress],
            [convertToShare(1)],
            [AMOUNT_RELATIVE],
            EMPTY_BYTES,
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
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await ADAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`adai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await ADAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct DAI <- aDAI withdraw', async () => {
      let adaiAmount;
      await ADAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          adaiAmount = result;
          console.log(`adai amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await ADAI.methods.approve(router.options.address, (adaiAmount * 2).toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.startExecution(
        [
          [
            AAVE_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [adaiAddress],
            [convertToShare(1)],
            [AMOUNT_RELATIVE],
            EMPTY_BYTES,
          ],
        ],
        [
          [adaiAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
        ],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await ADAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`adai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await ADAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
