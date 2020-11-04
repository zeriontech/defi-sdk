import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';
// import expectRevert from '../helpers/expectRevert';

const TOKENSETS_ASSET_ADAPTER = convertToBytes32('TokenSets Basic');
const UNISWAP_V2_EXCHANGE_ADAPTER = convertToBytes32('Uniswap V2 Exchange');
const WETH_ASSET_ADAPTER = convertToBytes32('Weth');

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
// const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const TokenSetsAdapter = artifacts.require('./TokenSetsBasicInteractiveAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const WethInteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const UniswapV2ExchangeAdapter = artifacts.require('./UniswapV2ExchangeInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract.only('TokenSetsBasicInteractiveAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

  const yfiAddress = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e';
  const uniAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
  const repAddress = '0x221657776846890989a759BA2973e427DfF5C9bB';
  const renAddress = '0x408e41876cCCDC0F92210600ef50372656052a38';
  const aaveAddress = '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9';
  const mkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
  const balAddress = '0xba100000625a3754423978a60c9317c58a424e3D';
  const lrcAddress = '0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD';
  const compAddress = '0xc00e94Cb662C3520282E6f5717214004A7f26888';
  const snxAddress = '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F';
  const kncAddress = '0xdd974D5C2e2928deA5F71b9825b8b646686BD200';

  const setAddress = '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b';

  let accounts;
  let core;
  let protocolAdapterRegistry;
  let router;
  let tokenSetsAdapterAddress;
  let wethAdapterAddress;
  let uniswapAdapterAddress;
  let erc20TokenAdapterAddress;

  let SET;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await TokenSetsAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenSetsAdapterAddress = result.address;
      });
    await WethInteractiveAdapter.new({ from: accounts[0] })
      .then((result) => {
        wethAdapterAddress = result.address;
      });
    await UniswapV2ExchangeAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapAdapterAddress = result.address;
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
      [
        TOKENSETS_ASSET_ADAPTER,
        WETH_ASSET_ADAPTER,
        UNISWAP_V2_EXCHANGE_ADAPTER,
      ],
      [
        tokenSetsAdapterAddress,
        wethAdapterAddress,
        uniswapAdapterAddress,
      ],
      [
        [],
        [],
        [],
      ],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await protocolAdapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [erc20TokenAdapterAddress],
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
    await ERC20.at(setAddress)
      .then((result) => {
        SET = result.contract;
      });
  });
  describe('Scenario ETH <-> DPI set', () => {
    it('should buy DPI with existing 1 ETH', async () => {
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount before is     ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.execute(
        // actions
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
              [wethAddress, convertToShare(0.1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, yfiAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(0.14), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, uniAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(0.03), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, repAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(0.08), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, renAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(0.11), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, aaveAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(0.17), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, mkrAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(0.03), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, balAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(0.06), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, lrcAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(0.12), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, compAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(0.12), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, snxAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(0.05), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [wethAddress, kncAddress]),
          ],
          [
            TOKENSETS_ASSET_ADAPTER,
            ACTION_DEPOSIT,
            [
              [yfiAddress, convertToShare(1), AMOUNT_RELATIVE],
              [uniAddress, convertToShare(1), AMOUNT_RELATIVE],
              [repAddress, convertToShare(1), AMOUNT_RELATIVE],
              [renAddress, convertToShare(1), AMOUNT_RELATIVE],
              [aaveAddress, convertToShare(1), AMOUNT_RELATIVE],
              [mkrAddress, convertToShare(1), AMOUNT_RELATIVE],
              [balAddress, convertToShare(1), AMOUNT_RELATIVE],
              [lrcAddress, convertToShare(1), AMOUNT_RELATIVE],
              [compAddress, convertToShare(1), AMOUNT_RELATIVE],
              [snxAddress, convertToShare(1), AMOUNT_RELATIVE],
              [kncAddress, convertToShare(1), AMOUNT_RELATIVE],
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
          gas: 10000000,
          value: web3.utils.toWei('1', 'ether'),
          from: accounts[0],
        });
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount after is      ${web3.utils.fromWei(result, 'ether')}`);
        });
    });
    it('should sell 50% of DPI', async () => {
      let setBalance;
      await SET.methods.balanceOf(accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount before is ${web3.utils.fromWei(result, 'ether')}`);
          setBalance = result;
        });
      await SET.methods.approve(router.options.address, setBalance)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await router.methods.execute(
        // actions
        [
          [
            TOKENSETS_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [setAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [yfiAddress, wethAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [uniAddress, wethAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [repAddress, wethAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [renAddress, wethAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [aaveAddress, wethAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [mkrAddress, wethAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [balAddress, wethAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [lrcAddress, wethAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [compAddress, wethAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [snxAddress, wethAddress]),
          ],
          [
            UNISWAP_V2_EXCHANGE_ADAPTER,
            ACTION_DEPOSIT,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            web3.eth.abi.encodeParameter('address[]', [kncAddress, wethAddress]),
          ],
          [
            WETH_ASSET_ADAPTER,
            ACTION_WITHDRAW,
            [
              [wethAddress, convertToShare(1), AMOUNT_RELATIVE],
            ],
            EMPTY_BYTES,
          ],
        ],
        // inputs
        [
          [setAddress, convertToShare(0.5), AMOUNT_RELATIVE],
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
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
    });
  });
});
