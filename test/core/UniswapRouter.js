import expectRevert from '../helpers/expectRevert';
import convertToBytes32 from '../helpers/convertToBytes32';

const { BN } = web3.utils;

const EMPTY_BYTES = '0x';
const ZERO = '0x0000000000000000000000000000000000000000';

// const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;

const FUTURE_TIMESTAMP = 1893456000;
const PAST_TIMESTAMP = 1577836800;
const UNISWAP_FACTORY = 1;
const SUSHISWAP_FACTORY = 2;
const INFINITY = (new BN(2)).pow(new BN(255)).toString();

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./MockInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');
const WETH9 = artifacts.require('./WETH9');

contract.only('UniswapRouter', () => {
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

  let daiAmount;

  let accounts;
  let core;
  let router;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  let DAI;
  let WETH;

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
      [convertToBytes32('Mock')],
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
    await ERC20.at(wethAddress)
      .then((result) => {
        WETH = result.contract;
      });
    await ERC20.at(daiAddress)
      .then((result) => {
        DAI = result.contract;
      });
    await WETH9.at(wethAddress)
      .then((result) => {
        result.contract.methods.deposit()
          .send({
            from: accounts[0],
            value: web3.utils.toWei('1', 'ether'),
            gas: 1000000,
          });
      });
    await DAI.methods.approve(router.options.address, INFINITY)
      .send({
        gas: 10000000,
        from: accounts[0],
      });
    await WETH.methods.approve(router.options.address, INFINITY)
      .send({
        gas: 10000000,
        from: accounts[0],
      });
  });

  describe('test Uniswap functionality', async () => {
    it('should not swapExactTokensForTokens with large expectations', async () => {
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
        });
      await expectRevert(router.methods.swapExactTokensForTokens(
        [
          [
            daiAddress,
            daiAmount,
            AMOUNT_ABSOLUTE,
          ],
          [
            0,
            EMPTY_BYTES,
          ],
        ],
        [
          0,
          ZERO,
        ],
        SUSHISWAP_FACTORY,
        INFINITY,
        [daiAddress, wethAddress],
        accounts[0],
        FUTURE_TIMESTAMP,
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should not swapExactTokensForTokens if expired', async () => {
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
        });
      await expectRevert(router.methods.swapExactTokensForTokens(
        [
          [
            daiAddress,
            daiAmount,
            AMOUNT_ABSOLUTE,
          ],
          [
            0,
            EMPTY_BYTES,
          ],
        ],
        [
          0,
          ZERO,
        ],
        SUSHISWAP_FACTORY,
        0,
        [daiAddress, wethAddress],
        accounts[0],
        PAST_TIMESTAMP,
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should not swapExactTokensForTokens with bad path', async () => {
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
        });
      await expectRevert(router.methods.swapExactTokensForTokens(
        [
          [
            daiAddress,
            daiAmount,
            AMOUNT_ABSOLUTE,
          ],
          [
            0,
            EMPTY_BYTES,
          ],
        ],
        [
          0,
          ZERO,
        ],
        SUSHISWAP_FACTORY,
        0,
        [wethAddress, daiAddress],
        accounts[0],
        FUTURE_TIMESTAMP,
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should not swapExactTokensForTokens with short path', async () => {
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
        });
      await expectRevert(router.methods.swapExactTokensForTokens(
        [
          [
            daiAddress,
            daiAmount,
            AMOUNT_ABSOLUTE,
          ],
          [
            0,
            EMPTY_BYTES,
          ],
        ],
        [
          0,
          ZERO,
        ],
        SUSHISWAP_FACTORY,
        0,
        [daiAddress],
        accounts[0],
        FUTURE_TIMESTAMP,
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should swapExactTokensForTokens', async () => {
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
          console.log(`dai amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount before is ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.swapExactTokensForTokens(
        [
          [
            daiAddress,
            daiAmount,
            AMOUNT_ABSOLUTE,
          ],
          [
            0,
            EMPTY_BYTES,
          ],
        ],
        [
          0,
          ZERO,
        ],
        SUSHISWAP_FACTORY,
        0,
        [daiAddress, wethAddress],
        accounts[0],
        FUTURE_TIMESTAMP,
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
          console.log(`dai amount after is   ${web3.utils.fromWei(result, 'ether')}`);
        });
      await WETH.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`weth amount after is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });

    it('should not swapExactETHForTokens with bad path', async () => {
      await expectRevert(router.methods.swapExactETHForTokens(
        [
          0,
          ZERO,
        ],
        UNISWAP_FACTORY,
        0,
        [daiAddress, wethAddress],
        accounts[0],
        FUTURE_TIMESTAMP,
      )
        .send({
          from: accounts[0],
          value: web3.utils.toWei('0.1', 'ether'),
          gas: 10000000,
        }));
    });

    it('should not swapExactETHForTokens with large expectations', async () => {
      await expectRevert(router.methods.swapExactETHForTokens(
        [
          0,
          ZERO,
        ],
        UNISWAP_FACTORY,
        INFINITY,
        [wethAddress, daiAddress],
        accounts[0],
        FUTURE_TIMESTAMP,
      )
        .send({
          from: accounts[0],
          value: web3.utils.toWei('0.1', 'ether'),
          gas: 10000000,
        }));
    });

    it('should swapExactETHForTokens', async () => {
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.swapExactETHForTokens(
        [
          0,
          ZERO,
        ],
        UNISWAP_FACTORY,
        0,
        [wethAddress, daiAddress],
        accounts[0],
        FUTURE_TIMESTAMP,
      )
        .send({
          from: accounts[0],
          value: web3.utils.toWei('0.1', 'ether'),
          gas: 10000000,
        })
        .then((receipt) => {
          console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is   ${web3.utils.fromWei(result, 'ether')}`);
        });
    });

    it('should not swapExactTokensForETH with path[0] not dai', async () => {
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
        });
      await expectRevert(router.methods.swapExactTokensForETH(
        [
          [
            daiAddress,
            daiAmount,
            AMOUNT_ABSOLUTE,
          ],
          [
            0,
            EMPTY_BYTES,
          ],
        ],
        [
          0,
          ZERO,
        ],
        UNISWAP_FACTORY,
        0,
        [wethAddress, daiAddress],
        accounts[0],
        FUTURE_TIMESTAMP,
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should not swapExactTokensForETH with path[-1] not weth', async () => {
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
        });

      await expectRevert(router.methods.swapExactTokensForETH(
        [
          [
            daiAddress,
            daiAmount,
            AMOUNT_ABSOLUTE,
          ],
          [
            0,
            EMPTY_BYTES,
          ],
        ],
        [
          0,
          ZERO,
        ],
        UNISWAP_FACTORY,
        0,
        [daiAddress, daiAddress],
        accounts[0],
        FUTURE_TIMESTAMP,
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should not swapExactTokensForETH with large expectations', async () => {
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
        });
      await expectRevert(router.methods.swapExactTokensForETH(
        [
          [
            daiAddress,
            daiAmount,
            AMOUNT_ABSOLUTE,
          ],
          [
            0,
            EMPTY_BYTES,
          ],
        ],
        [
          0,
          ZERO,
        ],
        UNISWAP_FACTORY,
        INFINITY,
        [daiAddress, wethAddress],
        accounts[0],
        FUTURE_TIMESTAMP,
      )
        .send({
          from: accounts[0],
          gas: 10000000,
        }));
    });

    it('should swapExactTokensForETH', async () => {
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          daiAmount = result;
          console.log(`dai amount before is  ${web3.utils.fromWei(result, 'ether')}`);
        });
      await router.methods.swapExactTokensForETH(
        [
          [
            daiAddress,
            daiAmount,
            AMOUNT_ABSOLUTE,
          ],
          [
            0,
            EMPTY_BYTES,
          ],
        ],
        [
          0,
          ZERO,
        ],
        UNISWAP_FACTORY,
        0,
        [daiAddress, wethAddress],
        accounts[0],
        FUTURE_TIMESTAMP,
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
          console.log(`dai amount after is   ${web3.utils.fromWei(result, 'ether')}`);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          assert.equal(result, 0);
        });
    });
  });
});
