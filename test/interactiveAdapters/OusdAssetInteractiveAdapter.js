import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';

const OUSD_ASSET_ADAPTER = convertToBytes32('OUSD Asset');
const UNISWAP_V2_EXCHANGE_ADAPTER = convertToBytes32('Uniswap V2 Exchange');
const WETH_ASSET_ADAPTER = convertToBytes32('WETH');

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./OusdAssetInteractiveAdapter');
const WethInteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('OusdAssetInteractiveAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const ousdAddress = '0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  let wethAdapterAddress;
  let uniswapAdapterAddress;
  let OUSD;
  let DAI;
  let USDC;
  let USDT;

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
        OUSD_ASSET_ADAPTER,
        WETH_ASSET_ADAPTER,
        UNISWAP_V2_EXCHANGE_ADAPTER,
      ],
      [
        protocolAdapterAddress,
        wethAdapterAddress,
        uniswapAdapterAddress,
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
    await ERC20.at(ousdAddress)
      .then((result) => {
        OUSD = result.contract;
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
  });

  describe('buy/sell OUSD', () => {
    it('should be correct ETH -> OUSD deposit', async () => {
      await OUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`ousd amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
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
          [
            OUSD_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
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
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await OUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` ousd amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      // For some reason it's always 1 wei of OUSD left
      await OUSD.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, '1');
        });
    });

    it('should be correct DAI, USDC, USDT <- OUSD withdraw', async () => {
      let ousdAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdc amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await USDT.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdt amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await OUSD.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          ousdAmount = result;
          console.log(`ousd amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await OUSD.methods.approve(router.options.address, ousdAmount.toString())
        .send({
          gas: 10000000,
          from: accounts[0],
        });
      await router.methods.execute(
        [
          [
            OUSD_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [ousdAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        [
          [
            [ousdAddress, convertToShare(1), AMOUNT_RELATIVE],
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
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`  dai amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` usdc amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await USDT.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(` usdt amount after is ${web3.utils.fromWei(result, 'mwei')}`);
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
      await USDT.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
