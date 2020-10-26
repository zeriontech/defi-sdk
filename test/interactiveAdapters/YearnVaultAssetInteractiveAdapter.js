// import displayToken from '../helpers/displayToken';
import expectRevert from '../helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';

const YEARN_ADAPTER = convertToBytes32('yearn.finance').slice(0, -2);
const ASSET_ADAPTER = '01';
const YEARN_ASSET_ADAPTER = `${YEARN_ADAPTER}${ASSET_ADAPTER}`;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
// const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./YearnAssetInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('YearnAssetInteractiveAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const ydaiAddress = '0xACd43E627e64355f1861cEC6d3a6688B31a6F952';

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  let DAI;
  let YDAI;

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
        YEARN_ASSET_ADAPTER,
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
    await ERC20.at(ydaiAddress)
      .then((result) => {
        YDAI = result.contract;
      });
  });

  describe('DAI <-> YDAI', () => {
    it('should not be correct DAI -> YDAI deposit with two tokenAmounts', async () => {
      let daiAmount;
      await YDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`YDAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
          console.log(` DAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods.approve(router.options.address, daiAmount)
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await expectRevert(router.methods.execute(
        [
          [
            YEARN_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', ydaiAddress),
          ],
        ],
        [
          [daiAddress, convertToShare(0.5), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        }));
      await YDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`YDAI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
          console.log(` DAI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await YDAI.methods['balanceOf(address)'](core.options.address)
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

    it('should be correct DAI -> YDAI deposit', async () => {
      let daiAmount;
      await YDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`YDAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
          console.log(` DAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods.approve(router.options.address, daiAmount)
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        [
          [
            YEARN_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', ydaiAddress),
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
      await YDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`YDAI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` DAI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await YDAI.methods['balanceOf(address)'](core.options.address)
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

    it('should not be correct DAI <- YDAI withdraw with 2 tokenAmounts', async () => {
      let ydaiAmount;
      await YDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          ydaiAmount = result;
          console.log(`YDAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` DAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await YDAI.methods.approve(router.options.address, (ydaiAmount * 2).toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await expectRevert(
        router.methods.execute(
          [
            [
              YEARN_ASSET_ADAPTER,
              ACTION_WITHDRAW,
              [
                [ydaiAddress, convertToShare(1), AMOUNT_RELATIVE],
                [ydaiAddress, convertToShare(1), AMOUNT_RELATIVE],
              ],
              EMPTY_BYTES,
            ],
          ],
          [
            [ydaiAddress, convertToShare(0.5), AMOUNT_RELATIVE],
          ],
          [0, ZERO],
          [],
        )
          .send({
            gas: 10000000,
            from: accounts[0],
          }),
      );
    });

    it('should be correct DAI <- YDAI withdraw', async () => {
      let ydaiAmount;
      await YDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          ydaiAmount = result;
          console.log(`YDAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` DAI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await YDAI.methods.approve(router.options.address, (ydaiAmount * 2).toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        [
          [
            YEARN_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [ydaiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        [
          [ydaiAddress, convertToShare(1), AMOUNT_RELATIVE],
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
      await YDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`YDAI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` DAI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await YDAI.methods['balanceOf(address)'](core.options.address)
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
