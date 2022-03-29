// import displayToken from '../helpers/displayToken';
import convertToShare from '../helpers/convertToShare';
import expectRevert from '../helpers/expectRevert';

const HYPERVISOR_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('HVIA'),
).slice(0, -2);
const UNISWAP_V2_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('Uniswap V2'),
).slice(0, -2);
const WETH_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('Weth'),
).slice(0, -2);
const ASSET_ADAPTER = '01';
const EXCHANGE_ADAPTER = '03';
const HYPERVISOR_ASSET_ADAPTER = `${HYPERVISOR_ADAPTER}${ASSET_ADAPTER}`;
const UNISWAP_V2_EXCHANGE_ADAPTER = `${UNISWAP_V2_ADAPTER}${EXCHANGE_ADAPTER}`;
const WETH_ASSET_ADAPTER = `${WETH_ADAPTER}${ASSET_ADAPTER}`;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const HypervisorAdapter = artifacts.require('./VisorInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const WethAdapter = artifacts.require('./WethInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract.only('VisorInteractiveAdapter', () => {
  const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
  const usdcWethAddress = '0x716bd8A7f8A44B010969A1825ae5658e7a18630D';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  let uniswapAdapterAddress;
  let wethAdapterAddress;
  let WETH;
  let USDC;
  let USDCWETH;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await HypervisorAdapter.new({ from: accounts[0] })
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
        HYPERVISOR_ASSET_ADAPTER,
        UNISWAP_V2_EXCHANGE_ADAPTER,
        WETH_ASSET_ADAPTER,
      ],
      [
        protocolAdapterAddress,
        uniswapAdapterAddress,
        wethAdapterAddress,
      ],
      [
        [usdcWethAddress],
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
    await ERC20.at(usdcAddress)
      .then((result) => {
        USDC = result.contract;
      });
    await ERC20.at(wethAddress)
      .then((result) => {
        WETH = result.contract;
      });
    await ERC20.at(usdcWethAddress)
      .then((result) => {
        USDCWETH = result.contract;
      });
    await router.methods.execute(
      // actions
      [
        [
          WETH_ASSET_ADAPTER,
          ACTION_DEPOSIT,
          [
            [ethAddress, web3.utils.toWei('1', 'ether'), AMOUNT_ABSOLUTE],
          ],
          EMPTY_BYTES,
        ],
      ],
      // inputs
      [],
      // fee
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

  describe('Hypervisor asset tests', () => {
    it('should prepare for tests by buying usdc and weth', async () => {
      await WETH.methods.approve(router.options.address, web3.utils.toWei('0.3', 'ether'))
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        // actions
        [
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, web3.utils.toWei('0.3', 'ether'), AMOUNT_ABSOLUTE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, usdcAddress]),
          ],
        ],
        // inputs
        [
          [wethAddress, web3.utils.toWei('0.3', 'ether'), AMOUNT_ABSOLUTE],
        ],
        // fee
        [0, ZERO],
        // outputs
        [],
      )
        .send({
          gas: 10000000,
          from: accounts[0],
        });
    });

    it('should not buy USDC-WETH Visor with existing USDC and WETH with wrong tokens', async () => {
      let usdcAmount;
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          usdcAmount = result;
        });
      await USDC.methods.approve(router.options.address, usdcAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });

      let wethAmount;
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          wethAmount = result;
        });
      await WETH.methods.approve(router.options.address, wethAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });

      await expectRevert(router.methods.execute(
        [
          [
            HYPERVISOR_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [usdcAddress, convertToShare(1), AMOUNT_RELATIVE],
              [usdcAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameters(
              ['address'],
              [usdcWethAddress],
            ),
          ],
        ],
        [
          [usdcAddress, convertToShare(50), AMOUNT_ABSOLUTE],
          [wethAddress, convertToShare(50), AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        [
          [usdcWethAddress, 0],
        ],
      )
        .send({
          from: accounts[0],
          gas: 1000000,
        }));
    });

    it('should buy USDC-WETH Visor with existing USDC and WETH', async () => {
      let usdcAmount;
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`USDC amount before is     ${web3.utils.fromWei(result, 'ether')}`);
          usdcAmount = result;
        });
      await USDC.methods.approve(router.options.address, usdcAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });

      let wethAmount;
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`WETH amount before is    ${web3.utils.fromWei(result, 'ether')}`);
          wethAmount = result;
        });
      await WETH.methods.approve(router.options.address, wethAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await USDCWETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`USDCWETH Hypervisor amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        [
          [
            HYPERVISOR_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [usdcAddress, convertToShare(1), AMOUNT_RELATIVE],
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameters(
              ['address'],
              [usdcWethAddress],
            ),
          ],
        ],
        [
          [usdcAddress, convertToShare(0.5), AMOUNT_RELATIVE],
          [wethAddress, convertToShare(0.5), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [
          [usdcWethAddress, 0],
        ],
      )
        .send({
          from: accounts[0],
          gas: 1000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`USDC amount after is     ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`WETH amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDCWETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`USDCWETH Hypervisor amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await WETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await USDCWETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should sell 100% USDC-WETH Visor', async () => {
      let usdcWethAmount;
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`         USDC amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`        WETH amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDCWETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then(async (result) => {
          console.log(`USDCWETH amount before is ${web3.utils.fromWei(result, 'ether')}`);
          usdcWethAmount = result;
        });
      await USDCWETH.methods.approve(router.options.address, usdcWethAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        [
          [
            HYPERVISOR_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [usdcWethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', usdcAddress),
          ],
        ],
        [
          [usdcWethAddress, convertToShare(1), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [],
      )
        .send({
          from: accounts[0],
          gas: 1000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`USDC amount after is     ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`WETH amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDCWETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`USDCWETHamount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await WETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await USDCWETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
