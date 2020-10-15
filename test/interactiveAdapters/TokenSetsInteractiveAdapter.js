import convertToShare from '../helpers/convertToShare';
import expectRevert from '../helpers/expectRevert';

const TOKENSETS_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('Curve'),
).slice(0, -2);
const UNISWAP_V1_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('Uniswap V1'),
).slice(0, -2);
const WETH_ADAPTER = web3.eth.abi.encodeParameter(
  'bytes32',
  web3.utils.toHex('Weth'),
).slice(0, -2);
const ASSET_ADAPTER = '01';
const EXCHANGE_ADAPTER = '03';
const TOKENSETS_ASSET_ADAPTER = `${TOKENSETS_ADAPTER}${ASSET_ADAPTER}`;
const WETH_ASSET_ADAPTER = `${WETH_ADAPTER}${ASSET_ADAPTER}`;
const UNISWAP_V1_EXCHANGE_ADAPTER = `${UNISWAP_V1_ADAPTER}${EXCHANGE_ADAPTER}`;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
// const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const TokenSetsAdapter = artifacts.require('./TokenSetsInteractiveAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const WethInteractiveAdapter = artifacts.require('./WethInteractiveAdapter');
const UniswapV1ExchangeAdapter = artifacts.require('./UniswapV1ExchangeInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');

contract('TokenSetsInteractiveAdapter', () => {
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const setAddress = '0x8ddf05c42c698329053c4f39b5bb05a350fd8132';

  let accounts;
  let core;
  let protocolAdapterRegistry;
  let router;
  let tokenSetsAdapterAddress;
  let wethAdapterAddress;
  let uniswapAdapterAddress;
  let erc20TokenAdapterAddress;

  let USDC;
  let WETH;
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
    await UniswapV1ExchangeAdapter.new({ from: accounts[0] })
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
        UNISWAP_V1_EXCHANGE_ADAPTER,
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
    await ERC20.at(usdcAddress)
      .then((result) => {
        USDC = result.contract;
      });
    await ERC20.at(wethAddress)
      .then((result) => {
        WETH = result.contract;
      });
    await ERC20.at(setAddress)
      .then((result) => {
        SET = result.contract;
      });
  });
  describe('Scenario ETH <-> WETH/USDC set', () => {
    it('should not buy token sets for 1 ether with inconsistent tokens/amounts', async () => {
      const actions = [
        // exchange ETH to USDC
        [
          UNISWAP_V1_EXCHANGE_ADAPTER,
          ACTION_DEPOSIT,
          [ethAddress],
          [convertToShare(0.52)],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', usdcAddress),
        ],
        // exchange ETH to WETH
        [
          WETH_ASSET_ADAPTER,
          ACTION_DEPOSIT,
          [ethAddress],
          [convertToShare(1)], // 100% of the remaining
          [AMOUNT_RELATIVE],
          EMPTY_BYTES,
        ],
        [
          TOKENSETS_ASSET_ADAPTER,
          ACTION_DEPOSIT,
          [
            wethAddress,
            usdcAddress,
          ],
          [
            convertToShare(1),
            convertToShare(1),
            convertToShare(1),
          ],
          [
            AMOUNT_RELATIVE,
            AMOUNT_RELATIVE,
            AMOUNT_RELATIVE,
          ],
          web3.eth.abi.encodeParameter(
            'address',
            setAddress,
          ),
        ],
      ];
      // console.log(actions);
      await expectRevert(router.methods.execute(
        actions,
        [],
        [],
      )
        .send({
          from: accounts[0],
          gas: 5000000,
          value: web3.utils.toWei('1', 'ether'),
        }));
    });

    it('should not buy token sets for 1 ether with wrong tokens', async () => {
      const actions = [
        // exchange ETH to USDC
        [
          UNISWAP_V1_EXCHANGE_ADAPTER,
          ACTION_DEPOSIT,
          [ethAddress],
          [convertToShare(0.52)],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', usdcAddress),
        ],
        // exchange ETH to WETH
        [
          WETH_ASSET_ADAPTER,
          ACTION_DEPOSIT,
          [ethAddress],
          [convertToShare(1)], // 100% of the remaining
          [AMOUNT_RELATIVE],
          EMPTY_BYTES,
        ],
        [
          TOKENSETS_ASSET_ADAPTER,
          ACTION_DEPOSIT,
          [
            wethAddress,
            usdcAddress,
            daiAddress,
          ],
          [
            convertToShare(1),
            convertToShare(1),
            convertToShare(1),
          ],
          [
            AMOUNT_RELATIVE,
            AMOUNT_RELATIVE,
            AMOUNT_RELATIVE,
          ],
          web3.eth.abi.encodeParameter(
            'address',
            setAddress,
          ),
        ],
      ];
      // console.log(actions);
      await expectRevert(router.methods.execute(
        actions,
        [],
        [],
      )
        .send({
          from: accounts[0],
          gas: 5000000,
          value: web3.utils.toWei('1', 'ether'),
        }));
    });

    it('should buy token sets for 1 ether', async () => {
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdc amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      const actions = [
        // exchange ETH to USDC
        [
          UNISWAP_V1_EXCHANGE_ADAPTER,
          ACTION_DEPOSIT,
          [ethAddress],
          [convertToShare(0.52)],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', usdcAddress),
        ],
        // exchange ETH to WETH
        [
          WETH_ASSET_ADAPTER,
          ACTION_DEPOSIT,
          [ethAddress],
          [convertToShare(1)], // 100% of the remaining
          [AMOUNT_RELATIVE],
          EMPTY_BYTES,
        ],
        [
          TOKENSETS_ASSET_ADAPTER,
          ACTION_DEPOSIT,
          [
            wethAddress,
            usdcAddress,
          ],
          [
            convertToShare(1),
            convertToShare(1),
          ],
          [
            AMOUNT_RELATIVE,
            AMOUNT_RELATIVE,
          ],
          web3.eth.abi.encodeParameter(
            'address',
            setAddress,
          ),
        ],
      ];
      // console.log(actions);
      await router.methods.execute(
        actions,
        [],
        [],
      )
        .send({
          from: accounts[0],
          gas: 5000000,
          value: web3.utils.toWei('1', 'ether'),
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      // console.log(router.methods.execute(
      //   actions,
      //   [],
      // ).encodeABI());
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdc amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await USDC.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await SET.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await web3.eth.getBalance(core.options.address)
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should not sell all token set for eth if wrong tokens', async () => {
      let setAmount;
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          setAmount = result;
        });
      await SET.methods.approve(router.options.address, setAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      const actions = [
        // withdraw to all sets
        [
          TOKENSETS_ASSET_ADAPTER,
          ACTION_WITHDRAW,
          [
            setAddress,
            setAddress,
          ],
          [
            convertToShare(1),
          ],
          [
            AMOUNT_RELATIVE,
          ],
          EMPTY_BYTES,
        ],
        // swap change (in USDC) back to ETH
        [
          UNISWAP_V1_EXCHANGE_ADAPTER,
          ACTION_DEPOSIT,
          [usdcAddress],
          [convertToShare(1)],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', ethAddress),
        ],
        // swap change (in WETH) back to ETH
        [
          WETH_ASSET_ADAPTER,
          ACTION_WITHDRAW,
          [wethAddress],
          [convertToShare(1)],
          [AMOUNT_RELATIVE],
          EMPTY_BYTES,
        ],
      ];
      // console.log(actions);
      await expectRevert(router.methods.execute(
        actions,
        [
          [setAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
        ],
        [],
      )
        .send({
          from: accounts[0],
          gas: 5000000,
        }));
    });

    it('should not sell all token set for eth if wrong tokens', async () => {
      let setAmount;
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          setAmount = result;
        });
      await SET.methods.approve(router.options.address, setAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      const actions = [
        // withdraw to all sets
        [
          TOKENSETS_ASSET_ADAPTER,
          ACTION_WITHDRAW,
          [
            setAddress,
          ],
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
        // swap change (in USDC) back to ETH
        [
          UNISWAP_V1_EXCHANGE_ADAPTER,
          ACTION_DEPOSIT,
          [usdcAddress],
          [convertToShare(1)],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', ethAddress),
        ],
        // swap change (in WETH) back to ETH
        [
          WETH_ASSET_ADAPTER,
          ACTION_WITHDRAW,
          [wethAddress],
          [convertToShare(1)],
          [AMOUNT_RELATIVE],
          EMPTY_BYTES,
        ],
      ];
      // console.log(actions);
      await expectRevert(router.methods.execute(
        actions,
        [
          [setAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
        ],
        [],
      )
        .send({
          from: accounts[0],
          gas: 5000000,
        }));
    });

    it('should sell all token set for eth', async () => {
      let setAmount;
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdc amount before is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount before is  ${web3.utils.fromWei(result, 'ether')}`);
          setAmount = result;
        });
      await SET.methods.approve(router.options.address, setAmount)
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      const actions = [
        // withdraw to all sets
        [
          TOKENSETS_ASSET_ADAPTER,
          ACTION_WITHDRAW,
          [
            setAddress,
          ],
          [
            convertToShare(1),
          ],
          [
            AMOUNT_RELATIVE,
          ],
          EMPTY_BYTES,
        ],
        // swap change (in USDC) back to ETH
        [
          UNISWAP_V1_EXCHANGE_ADAPTER,
          ACTION_DEPOSIT,
          [usdcAddress],
          [convertToShare(1)],
          [AMOUNT_RELATIVE],
          web3.eth.abi.encodeParameter('address', ethAddress),
        ],
        // swap change (in WETH) back to ETH
        [
          WETH_ASSET_ADAPTER,
          ACTION_WITHDRAW,
          [wethAddress],
          [convertToShare(1)],
          [AMOUNT_RELATIVE],
          EMPTY_BYTES,
        ],
      ];
      // console.log(actions);
      await router.methods.execute(
        actions,
        [
          [setAddress, convertToShare(1), AMOUNT_RELATIVE, 0, ZERO],
        ],
        [],
      )
        .send({
          from: accounts[0],
          gas: 5000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount after is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await USDC.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`usdc amount after is ${web3.utils.fromWei(result, 'mwei')}`);
        });
      await SET.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`set amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await USDC.methods['balanceOf(address)'](core.options.address)
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
      await SET.methods['balanceOf(address)'](core.options.address)
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
