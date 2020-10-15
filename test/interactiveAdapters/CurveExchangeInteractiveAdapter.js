// import displayToken from '../helpers/displayToken';
import expectRevert from '../helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';

const CURVE_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('Curve'),
).slice(0, -2);
const UNISWAP_V1_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('Uniswap V1'),
).slice(0, -2);
const EXCHANGE_ADAPTER = '03';
const CURVE_EXCHANGE_ADAPTER = `${CURVE_ADAPTER}${EXCHANGE_ADAPTER}`;
const UNISWAP_V1_EXCHANGE_ADAPTER = `${UNISWAP_V1_ADAPTER}${EXCHANGE_ADAPTER}`;

const ACTION_DEPOSIT = 1;
// const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const RELATIVE_AMOUNT_BASE = '1000000000000000000';
// const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./CurveExchangeInteractiveAdapter');
const UniswapV1ExchangeAdapter = artifacts.require('./UniswapV1ExchangeInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('Curve exchange interactive adapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const tusdAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
  const busdAddress = '0x4Fabb145d64652a948d72533023f6E7A623C7C53';
  const susdAddress = '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51';
  const paxAddress = '0x8E870D67F660D95d5be530380D0eC0bd388289E1';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  //  const cSwapAddress = '0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56';
  const tSwapAddress = '0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C';
  //  const ySwapAddress = '0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51';
  const bSwapAddress = '0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27';
  const sSwapAddress = '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD';
  const pSwapAddress = '0x06364f10B501e868329afBc005b3492902d6C763';
  //  const threeSwapAddress = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7';
  //  const renbtcSwapAddress = '0x93054188d876f558f4a66B2EF1d97d16eDf0895B';
  //  const sbtcSwapAddress = '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714';
  //  const hbtcSwapAddress = '0x4CA9b3063Ec5866A4B82E437059D2C43d1be596F';

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  let uniswapAdapterAddress;
  let DAI;
  let USDC;
  let USDT;
  let TUSD;
  let BUSD;
  let SUSD;
  let PAX;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await InteractiveAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterAddress = result.address;
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
        CURVE_EXCHANGE_ADAPTER,
        UNISWAP_V1_EXCHANGE_ADAPTER,
      ],
      [
        protocolAdapterAddress,
        uniswapAdapterAddress,
      ],
      [
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
    await ERC20.at(daiAddress)
      .then((result) => {
        DAI = result.contract;
      });
    await ERC20.at(usdcAddress)
      .then((result) => {
        USDC = result.contract;
      });
    await ERC20.at(usdtAddress)
      .then((result) => {
        USDT = result.contract;
      });
    await ERC20.at(tusdAddress)
      .then((result) => {
        TUSD = result.contract;
      });
    await ERC20.at(busdAddress)
      .then((result) => {
        BUSD = result.contract;
      });
    await ERC20.at(susdAddress)
      .then((result) => {
        SUSD = result.contract;
      });
    await ERC20.at(paxAddress)
      .then((result) => {
        PAX = result.contract;
      });
  });

  describe('All possible (1-side) stablecoins swaps', () => {
    it('should prepare fot tests (sell 1 ETH for DAI)', async () => {
      // exchange 1 ETH to DAI like we had DAI initially
      await router.methods.execute(
        // actions
        [
          [
            UNISWAP_V1_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [ethAddress, '1000000000000000000', AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter('address', daiAddress),
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
          value: web3.utils.toWei('1', 'ether'),
        });
    });

    it('should not swap DAI -> SUSD with 2 input tokens', async () => {
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await expectRevert(router.methods.execute(
        [
          [
            CURVE_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', susdAddress)
              + web3.eth.abi.encodeParameter('address', sSwapAddress).slice(2)
              + web3.eth.abi.encodeParameter('int128', 0).slice(2)
              + web3.eth.abi.encodeParameter('int128', 3).slice(2)
              + web3.eth.abi.encodeParameter('bool', false).slice(2),
          ],
        ],
        [
          [daiAddress, RELATIVE_AMOUNT_BASE, AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        }));
    });

    it('should swap DAI -> SUSD (deposit/relative)', async () => {
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await SUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`susd amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        [
          [
            CURVE_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', susdAddress)
              + web3.eth.abi.encodeParameter('address', sSwapAddress).slice(2)
              + web3.eth.abi.encodeParameter('int128', 0).slice(2)
              + web3.eth.abi.encodeParameter('int128', 3).slice(2)
              + web3.eth.abi.encodeParameter('bool', false).slice(2),
          ],
        ],
        [
          [daiAddress, RELATIVE_AMOUNT_BASE, AMOUNT_RELATIVE],
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
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await SUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`susd amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await SUSD.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should swap SUSD -> USDC (deposit/absolute)', async () => {
      let susdAmount;
      await SUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`susd amount before is ${web3.utils.fromWei(result, 'ether')}`);
          susdAmount = result;
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdc amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await SUSD.methods.approve(router.options.address, susdAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        [
          [
            CURVE_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [susdAddress, susdAmount, AMOUNT_ABSOLUTE],
            ],

            web3.eth.abi.encodeParameter('address', usdcAddress)
              + web3.eth.abi.encodeParameter('address', sSwapAddress).slice(2)
              + web3.eth.abi.encodeParameter('int128', 3).slice(2)
              + web3.eth.abi.encodeParameter('int128', 1).slice(2)
              + web3.eth.abi.encodeParameter('bool', false).slice(2),
          ],
        ],
        [
          [susdAddress, susdAmount, AMOUNT_ABSOLUTE],
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
      await SUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`susd amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdc amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await SUSD.methods['balanceOf(address)'](core.options.address)
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

    it('should swap USDC -> USDT (deposit/relative)', async () => {
      let usdcAmount;
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdc amount before is ${web3.utils.fromWei(result, 'mwei')}`);
          usdcAmount = result;
        });
      await USDT.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdt amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods.approve(router.options.address, usdcAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        [
          [
            CURVE_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [usdcAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', usdtAddress)
              + web3.eth.abi.encodeParameter('address', tSwapAddress).slice(2)
              + web3.eth.abi.encodeParameter('int128', 1).slice(2)
              + web3.eth.abi.encodeParameter('int128', 2).slice(2)
              + web3.eth.abi.encodeParameter('bool', true).slice(2),
          ],
        ],
        [
          [usdcAddress, usdcAmount, AMOUNT_ABSOLUTE],
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
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdc amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDT.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdt amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await USDT.methods['balanceOf(address)'](core.options.address)
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

    it('should swap USDT -> BUSD (deposit/relative)', async () => {
      let usdtAmount;
      await USDT.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdt amount before is ${web3.utils.fromWei(result, 'mwei')}`);
          usdtAmount = result;
        });
      await BUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`busd amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDT.methods.approve(router.options.address, usdtAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        [
          [
            CURVE_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [usdtAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', busdAddress)
              + web3.eth.abi.encodeParameter('address', bSwapAddress).slice(2)
              + web3.eth.abi.encodeParameter('int128', 2).slice(2)
              + web3.eth.abi.encodeParameter('int128', 3).slice(2)
              + web3.eth.abi.encodeParameter('bool', true).slice(2),
          ],
        ],
        [
          [usdtAddress, usdtAmount, AMOUNT_ABSOLUTE],
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
      await USDT.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdt amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await BUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`busd amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await BUSD.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await USDT.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should swap BUSD -> DAI (deposit/relative)', async () => {
      let busdAmount;
      await BUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`busd amount before is ${web3.utils.fromWei(result, 'ether')}`);
          busdAmount = result;
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await BUSD.methods.approve(router.options.address, busdAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        [
          [
            CURVE_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [busdAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', daiAddress)
              + web3.eth.abi.encodeParameter('address', bSwapAddress).slice(2)
              + web3.eth.abi.encodeParameter('int128', 3).slice(2)
              + web3.eth.abi.encodeParameter('int128', 0).slice(2)
              + web3.eth.abi.encodeParameter('bool', true).slice(2),
          ],
        ],
        [
          [busdAddress, busdAmount, AMOUNT_ABSOLUTE],
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
      await BUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`busd amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await BUSD.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should swap DAI -> PAX (deposit/relative)', async () => {
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await PAX.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pax amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods.approve(router.options.address, daiAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        [
          [
            CURVE_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', paxAddress)
              + web3.eth.abi.encodeParameter('address', pSwapAddress).slice(2)
              + web3.eth.abi.encodeParameter('int128', 0).slice(2)
              + web3.eth.abi.encodeParameter('int128', 3).slice(2)
              + web3.eth.abi.encodeParameter('bool', true).slice(2),
          ],
        ],
        [
          [daiAddress, daiAmount, AMOUNT_ABSOLUTE],
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
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await PAX.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pax amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await PAX.methods['balanceOf(address)'](core.options.address)
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

    it('should swap PAX -> DAI (deposit/relative)', async () => {
      let paxAmount;
      await PAX.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pax amount before is ${web3.utils.fromWei(result, 'ether')}`);
          paxAmount = result;
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await PAX.methods.approve(router.options.address, paxAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        [
          [
            CURVE_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [paxAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', daiAddress)
              + web3.eth.abi.encodeParameter('address', pSwapAddress).slice(2)
              + web3.eth.abi.encodeParameter('int128', 3).slice(2)
              + web3.eth.abi.encodeParameter('int128', 0).slice(2)
              + web3.eth.abi.encodeParameter('bool', true).slice(2),
          ],
        ],
        [
          [paxAddress, paxAmount, AMOUNT_ABSOLUTE],
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
      await PAX.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`pax amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await PAX.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should swap DAI -> TUSD (deposit/relative)', async () => {
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await TUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`tusd amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods.approve(router.options.address, daiAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        [
          [
            CURVE_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', tusdAddress)
              + web3.eth.abi.encodeParameter('address', tSwapAddress).slice(2)
              + web3.eth.abi.encodeParameter('int128', 0).slice(2)
              + web3.eth.abi.encodeParameter('int128', 2).slice(2)
              + web3.eth.abi.encodeParameter('bool', true).slice(2),
          ],
        ],
        [
          [daiAddress, daiAmount, AMOUNT_ABSOLUTE],
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
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await TUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`tusd amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await TUSD.methods['balanceOf(address)'](core.options.address)
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
