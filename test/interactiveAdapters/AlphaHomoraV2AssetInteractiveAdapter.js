import expectRevert from '../helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';

const { BN } = web3.utils;

const protocolAdapterName = convertToBytes32('AlphaHomora V2');
const UNISWAP_V2_EXCHANGE_ADAPTER = convertToBytes32('Uniswap V2 Exchange');
const WETH_ASSET_ADAPTER = convertToBytes32('WETH');

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./AlphaHomoraV2AssetInteractiveAdapter');
const WethInteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('AlphaHomoraV2AssetInteractiveAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const ibDaiAddress = '0xee8389d235E092b2945fE363e97CDBeD121A0439';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const ibEthAddress = '0xeEa3311250FE4c3268F8E684f7C87A82fF183Ec1';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  let wethAdapterAddress;
  let uniswapAdapterAddress;
  let DAI;
  let IBDAI;
  let IBETH;

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
    await WethInteractiveAdapter.new({ from: accounts[0] })
      .then((result) => {
        wethAdapterAddress = result.address;
      });
    await UniswapV2ExchangeAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapAdapterAddress = result.address;
      });
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [
        protocolAdapterName,
        UNISWAP_V2_EXCHANGE_ADAPTER,
        WETH_ASSET_ADAPTER,
      ],
      [
        protocolAdapterAddress,
        uniswapAdapterAddress,
        wethAdapterAddress,
      ],
      [[], [], []],
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
    await ERC20.at(ibDaiAddress)
      .then((result) => {
        IBDAI = result.contract;
      });
    await ERC20.at(ibEthAddress)
      .then((result) => {
        IBETH = result.contract;
      });
  });

  describe('DAI <-> ibDAIv2', () => {
    it('should prepare like we had dai', async () => {
      await router.methods.execute(
        [
          [
            WETH_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [ethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, daiAddress]),
          ],
        ],
        [],
        ['0', ZERO],
        [],
      )
        .send({
          gas: '10000000',
          from: accounts[0],
          value: web3.utils.toWei('1', 'ether').toString(),
        });
    });

    it('should not be correct DAI -> ibDAIv2 deposit for doubled tokens', async () => {
      let amount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amount = result;
        });
      await DAI.methods.approve(router.options.address, amount)
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
          [
            [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            [0, EMPTY_BYTES],
          ],
        ],
        [0, ZERO],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        }));
    });

    it('should be correct DAI -> ibDAIv2 deposit', async () => {
      let amount;
      await IBDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`ibdai amount before is ${web3.utils.fromWei(new BN(result).muln(10), 'gwei')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amount = result;
          console.log(`  dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods.approve(router.options.address, amount)
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
            web3.eth.abi.encodeParameter('address', ibDaiAddress),
          ],
        ],
        [
          [
            [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            [0, EMPTY_BYTES],
          ],
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
      await IBDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`ibdai amount after is ${web3.utils.fromWei(new BN(result).muln(10), 'gwei')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`  dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await IBDAI.methods['balanceOf(address)'](core.options.address)
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

    it('should not be correct DAI <- ibDAIv2 withdraw with doubled token', async () => {
      let amount;
      await IBDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amount = result;
        });
      await IBDAI.methods.approve(router.options.address, (amount * 2).toString())
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
              [ibDaiAddress, convertToShare(1), AMOUNT_RELATIVE],
              [ibDaiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        [
          [
            [ibDaiAddress, convertToShare(1), AMOUNT_RELATIVE],
            [0, EMPTY_BYTES],
          ],
        ],
        [0, ZERO],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        }));
    });

    it('should be correct DAI <- ibDAIv2 withdraw (100%)', async () => {
      let amount;
      await IBDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amount = result;
          console.log(`ibdai amount before is ${web3.utils.fromWei(new BN(result).muln(10), 'gwei')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`  dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await IBDAI.methods.approve(router.options.address, amount.toString())
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
              [ibDaiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        [
          [
            [ibDaiAddress, convertToShare(1), AMOUNT_RELATIVE],
            [0, EMPTY_BYTES],
          ],
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
      await IBDAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`ibdai amount after is ${web3.utils.fromWei(new BN(result).muln(10), 'gwei')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`  dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await IBDAI.methods['balanceOf(address)'](core.options.address)
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

  describe('ETH <-> ibETHv2', () => {
    it('should be correct ETH -> ibETHv2 deposit', async () => {
      await IBETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`ibweth amount before is ${web3.utils.fromWei(new BN(result).muln(10), 'gwei')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`  eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        [
          [
            protocolAdapterName,
            ACTION_DEPOSIT,
            [
              [ethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', ibEthAddress),
          ],
        ],
        [],
        [0, ZERO],
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
      await IBETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` ibweth amount after is ${web3.utils.fromWei(new BN(result).muln(10), 'gwei')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`   eth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await IBETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(core.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should be correct ETH <- ibETHv2 withdraw (100%)', async () => {
      let amount;
      await IBETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          amount = result;
          console.log(`ibweth amount before is ${web3.utils.fromWei(new BN(result).muln(10), 'gwei')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`  eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await IBETH.methods.approve(router.options.address, amount)
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
              [ibEthAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        [
          [
            [ibEthAddress, convertToShare(1), AMOUNT_RELATIVE],
            [0, EMPTY_BYTES],
          ],
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
      await IBETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`ibweth amount after is ${web3.utils.fromWei(new BN(result).muln(10), 'gwei')}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          amount = result;
          console.log(`  eth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await IBETH.methods['balanceOf(address)'](core.options.address)
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
