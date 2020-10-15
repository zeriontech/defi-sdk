// import displayToken from '../helpers/displayToken';
import convertToShare from '../helpers/convertToShare';
import expectRevert from '../helpers/expectRevert';

const CURVE_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('Curve'),
).slice(0, -2);
const UNISWAP_V2_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('Uniswap V2'),
).slice(0, -2);
const WETH_ASSET_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('Weth'),
).slice(0, -2);
const ASSET_ADAPTER = '01';
const EXCHANGE_ADAPTER = '03';
const CURVE_ASSET_ADAPTER = `${CURVE_ADAPTER}${ASSET_ADAPTER}`;
const UNISWAP_V2_EXCHANGE_ADAPTER = `${UNISWAP_V2_ADAPTER}${EXCHANGE_ADAPTER}`;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const CurveAdapter = artifacts.require('./CurveAssetInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const WethAdapter = artifacts.require('./WethInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('CurveAssetInteractiveAdapter', () => {
  const cPoolToken = '0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2';
  const tPoolToken = '0x9fC689CCaDa600B6DF723D9E47D84d76664a1F23';
  const yPoolToken = '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8';
  const bPoolToken = '0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B';
  const sPoolToken = '0xC25a3A3b969415c80451098fa907EC722572917F';
  const pPoolToken = '0xD905e2eaeBe188fc92179b6350807D8bd91Db0D8';
  const threePoolToken = '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490';
  const renbtcPoolToken = '0x49849C98ae39Fff122806C06791Fa73784FB3675';
  const sbtcPoolToken = '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3';
  const hbtcPoolToken = '0xb19059ebb43466C323583928285a49f558E572Fd';

  const renBTCAddress = '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D';
  const wbtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  let uniswapAdapterAddress;
  let wethAdapterAddress;
  let DAI;
  let WETH;
  let WBTC;
  let poolTokenAddress;
  let poolToken;
  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await CurveAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterAddress = result.address;
      });
    await UniswapV2ExchangeAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapAdapterAddress = result.address;
      });
    await WethAdapter.new({ from: accounts[0] })
      .then((result) => {
        wethAdapterAddress = result.address;
      });
    await ProtocolAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterRegistry = result.contract;
      });
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [
        UNISWAP_V2_EXCHANGE_ADAPTER,
        WETH_ASSET_ADAPTER,
        CURVE_ASSET_ADAPTER,
      ],
      [
        uniswapAdapterAddress,
        wethAdapterAddress,
        protocolAdapterAddress,
      ],
      [
        [],
        [],
        [
          cPoolToken,
          tPoolToken,
          yPoolToken,
          bPoolToken,
          sPoolToken,
          pPoolToken,
          renbtcPoolToken,
        ],
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
    await ERC20.at(daiAddress)
      .then((result) => {
        DAI = result.contract;
      });
    await ERC20.at(wbtcAddress)
      .then((result) => {
        WBTC = result.contract;
      });
    await ERC20.at(wethAddress)
      .then((result) => {
        WETH = result.contract;
      });
  });

  describe('checking sell/buy curve pool', () => {
    it('should prepare for tests (sell 10 ETH for DAI)', async () => {
      // exchange 10 ETH to WETH like we had WETH initially
      await router.methods.execute(
        // actions
        [
          [
            WETH_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [ethAddress, web3.utils.toWei('10', 'ether'), AMOUNT_ABSOLUTE],
            ],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [],
        [0, ZERO],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
          value: web3.utils.toWei('10', 'ether'),
        });
      await WETH.methods.approve(router.options.address, web3.utils.toWei('5', 'ether'))
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await router.methods.execute(
        // actions
        [
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, web3.utils.toWei('5', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, daiAddress]),
          ],
        ],
        // inputs
        [
          [wethAddress, web3.utils.toWei('5', 'ether'), AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        // outputs
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        });
    });

    it('should not buy curve pool for 100 dai with 2 tokens', async () => {
      poolTokenAddress = cPoolToken;
      await ERC20.at(poolTokenAddress)
        .then((result) => {
          poolToken = result.contract;
        });
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await expectRevert(router.methods.execute(
        [
          [
            CURVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
              [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              poolTokenAddress,
            ),
          ],
        ],
        [
          [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should not buy curve pool for 100 dai with wrong token', async () => {
      poolTokenAddress = cPoolToken;
      await ERC20.at(poolTokenAddress)
        .then((result) => {
          poolToken = result.contract;
        });
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await expectRevert(router.methods.execute(
        [
          [
            CURVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [renBTCAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              poolTokenAddress,
            ),
          ],
        ],
        [
          [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should buy c curve pool for 100 dai', async () => {
      poolTokenAddress = cPoolToken;
      await ERC20.at(poolTokenAddress)
        .then((result) => {
          poolToken = result.contract;
        });
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        [
          [
            CURVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              poolTokenAddress,
            ),
          ],
        ],
        [
          [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await poolToken.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should buy t curve pool for 100 dai', async () => {
      poolTokenAddress = tPoolToken;
      await ERC20.at(poolTokenAddress)
        .then((result) => {
          poolToken = result.contract;
        });
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        [
          [
            CURVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              poolTokenAddress,
            ),
          ],
        ],
        [
          [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await poolToken.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should buy s curve pool for 100 dai', async () => {
      poolTokenAddress = sPoolToken;
      await ERC20.at(poolTokenAddress)
        .then((result) => {
          poolToken = result.contract;
        });
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        [
          [
            CURVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              poolTokenAddress,
            ),
          ],
        ],
        [
          [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await poolToken.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should buy y curve pool for 100 dai', async () => {
      poolTokenAddress = yPoolToken;
      await ERC20.at(poolTokenAddress)
        .then((result) => {
          poolToken = result.contract;
        });
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        [
          [
            CURVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              poolTokenAddress,
            ),
          ],
        ],
        [
          [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await poolToken.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should buy b curve pool for 100 dai', async () => {
      poolTokenAddress = bPoolToken;
      await ERC20.at(poolTokenAddress)
        .then((result) => {
          poolToken = result.contract;
        });
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        [
          [
            CURVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              poolTokenAddress,
            ),
          ],
        ],
        [
          [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await poolToken.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should buy p curve pool for 100 dai', async () => {
      poolTokenAddress = pPoolToken;
      await ERC20.at(poolTokenAddress)
        .then((result) => {
          poolToken = result.contract;
        });
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        [
          [
            CURVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              poolTokenAddress,
            ),
          ],
        ],
        [
          [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await poolToken.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should buy 3 curve pool for 100 dai', async () => {
      poolTokenAddress = threePoolToken;
      await ERC20.at(poolTokenAddress)
        .then((result) => {
          poolToken = result.contract;
        });
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        [
          [
            CURVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              poolTokenAddress,
            ),
          ],
        ],
        [
          [daiAddress, web3.utils.toWei('100', 'ether'), AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await poolToken.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should prepare for tests (sell 10 ETH for WBTC)', async () => {
      // exchange 10 ETH to WETH like we had WETH initially
      await router.methods.execute(
        // actions
        [
          [
            WETH_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [ethAddress, web3.utils.toWei('10', 'ether'), AMOUNT_ABSOLUTE],
            ],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [],
        [0, ZERO],
        // outputs
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
          value: web3.utils.toWei('10', 'ether'),
        });
      await WETH.methods.approve(router.options.address, web3.utils.toWei('5', 'ether'))
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await router.methods.execute(
        // actions
        [
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, web3.utils.toWei('5', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, wbtcAddress]),
          ],
        ],
        // inputs
        [
          [wethAddress, web3.utils.toWei('5', 'ether'), AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        // outputs
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        });
    });

    it('should buy sbtc curve pool for 1000 wbtc', async () => {
      poolTokenAddress = sbtcPoolToken;
      await ERC20.at(poolTokenAddress)
        .then((result) => {
          poolToken = result.contract;
        });
      let wbtcAmount;
      await WBTC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       wbtc amount before is ${web3.utils.fromWei(result, 'ether')}`);
          wbtcAmount = result;
        });
      await WBTC.methods.approve(router.options.address, wbtcAmount.toString())
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        [
          [
            CURVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wbtcAddress, 1000000, AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              poolTokenAddress,
            ),
          ],
        ],
        [
          [wbtcAddress, 1000000, AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await WBTC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       wbtc amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WBTC.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await poolToken.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should buy renbtc curve pool for 1000 wbtc', async () => {
      poolTokenAddress = renbtcPoolToken;
      await ERC20.at(poolTokenAddress)
        .then((result) => {
          poolToken = result.contract;
        });
      let wbtcAmount;
      await WBTC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       wbtc amount before is ${web3.utils.fromWei(result, 'ether')}`);
          wbtcAmount = result;
        });
      await WBTC.methods.approve(router.options.address, wbtcAmount.toString())
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        [
          [
            CURVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wbtcAddress, 1000000, AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              poolTokenAddress,
            ),
          ],
        ],
        [
          [wbtcAddress, 1000000, AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await WBTC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       wbtc amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WBTC.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await poolToken.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should buy hbtc curve pool for 1000 wbtc', async () => {
      poolTokenAddress = hbtcPoolToken;
      await ERC20.at(poolTokenAddress)
        .then((result) => {
          poolToken = result.contract;
        });
      let wbtcAmount;
      await WBTC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       wbtc amount before is ${web3.utils.fromWei(result, 'ether')}`);
          wbtcAmount = result;
        });
      await WBTC.methods.approve(router.options.address, wbtcAmount.toString())
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        [
          [
            CURVE_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wbtcAddress, 1000000, AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              poolTokenAddress,
            ),
          ],
        ],
        [
          [wbtcAddress, 1000000, AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await WBTC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       wbtc amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WBTC.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await poolToken.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should not sell 100% of pool tokens if wrong token', async () => {
      let poolAmount;
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          poolAmount = result;
        });
      await poolToken.methods.approve(router.options.address, poolAmount.toString())
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await expectRevert(router.methods.execute(
        [
          [
            CURVE_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [poolTokenAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              renBTCAddress,
            ),
          ],
        ],
        [
          [poolTokenAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [
          [renBTCAddress, 1],
        ],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should sell 100% of pool tokens', async () => {
      poolTokenAddress = cPoolToken;
      await ERC20.at(poolTokenAddress)
        .then((result) => {
          poolToken = result.contract;
        });
      let poolAmount;
      await WBTC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       wbtc amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          poolAmount = result;
          console.log(`pool token amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await poolToken.methods.approve(router.options.address, poolAmount.toString())
        .send({
          from: accounts[0],
          gas: 10000000,
        });
      await router.methods.execute(
        [
          [
            CURVE_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [poolTokenAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter(
              'address',
              wbtcAddress,
            ),
          ],
        ],
        [
          [poolTokenAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await WBTC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`       wbtc amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await poolToken.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pool token amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WBTC.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await poolToken.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
