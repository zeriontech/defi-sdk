import expectRevert from '../helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';

const protocolAdapterName = convertToBytes32('Aave V2');

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./AaveV2AssetInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('AaveV2AssetInteractiveAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const adaiAddress = '0x028171bCA77440897B824Ca71D1c56caC55b68A3';

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  let DAI;
  let ADAI;

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
      [
        protocolAdapterName,
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
    await ERC20.at(daiAddress)
      .then((result) => {
        DAI = result.contract;
      });
    await ERC20.at(adaiAddress)
      .then((result) => {
        ADAI = result.contract;
      });
  });

  describe('DAI <-> aDAI', () => {
    it('should not be correct DAI -> aDAI deposit for doubled tokens', async () => {
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
      await expectRevert(router.methods.execute(
        [
          [
            protocolAdapterName,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        [
          [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        }));
    });

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
      await router.methods.execute(
        [
          [
            protocolAdapterName,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        [
          [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
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

    it('should not be correct DAI <- aDAI withdraw with doubled token', async () => {
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
      await expectRevert(router.methods.execute(
        [
          [
            protocolAdapterName,
            ACTION_WITHDRAW,
            [
              [adaiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        [
          [adaiAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        }));
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
      await router.methods.execute(
        [
          [
            protocolAdapterName,
            ACTION_WITHDRAW,
            [
              [adaiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        [
          [adaiAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
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
