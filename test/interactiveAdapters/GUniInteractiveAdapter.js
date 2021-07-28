// import displayToken from '../helpers/displayToken';
import convertToShare from '../helpers/convertToShare';
import expectRevert from '../helpers/expectRevert';

const GUNI_V1_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('G-UNI'),
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
const GUNI_V1_ASSET_ADAPTER = `${GUNI_V1_ADAPTER}${ASSET_ADAPTER}`;
const UNISWAP_V2_EXCHANGE_ADAPTER = `${UNISWAP_V2_ADAPTER}${EXCHANGE_ADAPTER}`;
const WETH_ASSET_ADAPTER = `${WETH_ADAPTER}${ASSET_ADAPTER}`;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const GUniV1Adapter = artifacts.require('./GUniInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const WethAdapter = artifacts.require('./WethInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract.only('GUniInteractiveAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const daiFraxAddress = '0xb1Cfdc7370550f5e421E1bf0BF3CADFaDF3C4141';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const fraxAddress = '0x853d955aCEf822Db058eb8505911ED77F175b99e';

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  let uniswapAdapterAddress;
  let wethAdapterAddress;
  let WETH;
  let DAI;
  let FRAX;
  let DAIFRAX;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await GUniV1Adapter.new({ from: accounts[0] })
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
        GUNI_V1_ASSET_ADAPTER,
        UNISWAP_V2_EXCHANGE_ADAPTER,
        WETH_ASSET_ADAPTER,
      ],
      [
        protocolAdapterAddress,
        uniswapAdapterAddress,
        wethAdapterAddress,
      ],
      [
        [daiFraxAddress],
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
    await ERC20.at(wethAddress)
      .then((result) => {
        WETH = result.contract;
      });
    await ERC20.at(fraxAddress)
      .then((result) => {
        FRAX = result.contract;
      });
    await ERC20.at(daiFraxAddress)
      .then((result) => {
        DAIFRAX = result.contract;
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

  describe('G-UNI asset tests', () => {
    it('should prepare for tests by buying DAI and FRAX', async () => {
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
            web3.eth.abi.encodeParameter('address[]', [wethAddress, daiAddress]),
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
            web3.eth.abi.encodeParameter('address[]', [wethAddress, fraxAddress]),
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

    it('should not buy G-UNI with existing DAI and FRAX with wrong tokens', async () => {
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
      let fraxAmount;
      await FRAX.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          fraxAmount = result;
        });
      await FRAX.methods.approve(router.options.address, fraxAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await expectRevert(router.methods.execute(
        [
          [
            GUNI_V1_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameters(
              ['address'],
              [daiFraxAddress],
            ),
          ],
        ],
        [
          [daiAddress, convertToShare(50), AMOUNT_ABSOLUTE],
          [fraxAddress, convertToShare(50), AMOUNT_ABSOLUTE],
        ],
        [0, ZERO],
        [
          [daiFraxAddress, 0],
        ],
      )
        .send({
          from: accounts[0],
          gas: 1000000,
        }));
    });

    it('should buy G-UNI with existing DAI and FRAX', async () => {
      /* await FRAX.methods.approve(router.options.address, web3.utils.toWei('0.3', 'ether'))
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
            web3.eth.abi.encodeParameter('address[]', [wethAddress, daiAddress]),
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
        }); */
      let daiAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is     ${web3.utils.fromWei(result, 'ether')}`);
          daiAmount = result;
        });
      await DAI.methods.approve(router.options.address, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });

      let fraxAmount;
      await FRAX.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`frax amount before is    ${web3.utils.fromWei(result, 'ether')}`);
          fraxAmount = result;
        });
      await FRAX.methods.approve(router.options.address, fraxAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await DAIFRAX.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`G-UNI amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        [
          [
            GUNI_V1_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [daiAddress, convertToShare(1), AMOUNT_RELATIVE],
              [fraxAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameters(
              ['address'],
              [daiFraxAddress],
            ),
          ],
        ],
        [
          [daiAddress, convertToShare(0.5), AMOUNT_RELATIVE],
          [fraxAddress, convertToShare(0.5), AMOUNT_RELATIVE],
        ],
        [0, ZERO],
        [
          [daiFraxAddress, 0],
        ],
      )
        .send({
          from: accounts[0],
          gas: 1000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is     ${web3.utils.fromWei(result, 'ether')}`);
        });
      await FRAX.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`frax amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAIFRAX.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`G-UNI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await FRAX.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await DAIFRAX.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should sell 100% G-UNI', async () => {
      let daiFraxAmount;
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`         dai amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await FRAX.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`        frax amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAIFRAX.methods['balanceOf(address)'](accounts[0])
        .call()
        .then(async (result) => {
          console.log(`G-UNI amount before is ${web3.utils.fromWei(result, 'ether')}`);
          daiFraxAmount = result;
        });
      await DAIFRAX.methods.approve(router.options.address, daiFraxAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        [
          [
            GUNI_V1_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [daiFraxAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address', daiAddress),
          ],
        ],
        [
          [daiFraxAddress, convertToShare(1), AMOUNT_RELATIVE],
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
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is     ${web3.utils.fromWei(result, 'ether')}`);
        });
      await FRAX.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`frax amount after is    ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAIFRAX.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`G-UNI amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await FRAX.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await DAIFRAX.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
