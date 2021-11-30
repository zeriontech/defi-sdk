import expectRevert from '../helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';

const BN = web3.utils.BN;

const STAKING_POOLS_ADAPTER = convertToBytes32('Staking pools');

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./StakingPoolsInteractiveAdapterEth');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');
const UniswapRouter = artifacts.require('./UniswapV2Router02');
const WETH = artifacts.require('./WETH9');



contract('StakingPoolsInteractiveAdapterEth', () => {
    const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
    const wethDhvLpAddress = '0x60c5BF43140d6341bebFE13293567FafBe01D65b';
    const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const dhv = '0x62Dc4817588d53a056cBbD18231d91ffCcd34b2A';
    const uniswapRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const stakingPoolsAddress = '0x4964B3B599B82C3FdDC56e3A9Ffd77d48c6AF0f0';
    const WETH_DHV_PID = 0;
    let encodedData;

    let accounts;
    let core;
    let router;
    let protocolAdapterRegistry;
    let protocolAdapterAddress;
    let dhvToken;
    let uniSwapRouter;
    let wethProtocol, wethERC20;
    let wethDhvLp;

    let protocol;

    before(async () => {
        accounts = await web3.eth.getAccounts();
        encodedData = web3.eth.abi.encodeParameters(['uint', 'address', 'address[]'], [WETH_DHV_PID, accounts[0], [dhv]]);

        uniSwapRouter = await UniswapRouter.at(uniswapRouterAddress);
        wethProtocol = await WETH.at(weth);
        wethERC20 = await ERC20.at(weth);
        wethDhvLp = await ERC20.at(wethDhvLpAddress);
        dhvToken = ERC20.at(dhv);
        let ethValue = await web3.utils.toWei('1', 'ether');
        await uniSwapRouter.swapExactETHForTokens(0, [weth, dhv], accounts[0], '10000000000', {from: accounts[0], value: ethValue});
        await wethProtocol.deposit({from: accounts[0], value: ethValue});
        let dhv_bal = await dhvToken.balanceOf(accounts[0]);
        let weth_bal = await wethERC20.balanceOf(accounts[0]);
        await dhvToken.approve(uniswapRouterAddress, dhv_bal, {from: accounts[0]});
        await wethERC20.approve(uniswapRouterAddress, weth_bal, {from: accounts[0]});
        await uniSwapRouter.addLiquidity(weth, dhv, await weth_bal, dhv_bal, 0, 0, accounts[0], '10000000000', {from: accounts[0]});

        await InteractiveAdapter.new({ from: accounts[0] })
          .then((result) => {
            protocolAdapterAddress = result.address;
            protocol = result.contract;
          });
        await ProtocolAdapterRegistry.new({ from: accounts[0] })
          .then((result) => {
            protocolAdapterRegistry = result.contract;
          });
        await protocolAdapterRegistry.methods.addProtocolAdapters(
          [
            STAKING_POOLS_ADAPTER,
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
        await ERC20.at(dhvAddress)
          .then((result) => {
            dhvToken = result.contract;
          });
    });

    describe('DHV-WETH LP <-> StakingPools', async() => {
        it('Should not be correct DHV-WETH LP -> StakingPools if 2 tokens', async() => {
            let dhvAmount;
            await wethDhvLp.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
              dhvAmount = result;
              console.log(`dhv-weth lp amount before is ${web3.utils.fromWei(result, 'ether')}`);
            });
            // let result = await protocol.methods['getBalance(address,address)'](stakingDHVAddress, accounts[0]).call();
            // console.log(`staking dhv amount before is ${web3.utils.fromWei(result, 'ether')}`);

            await wethDhvLp.methods.approve(router.options.address, dhvAmount)
            .send({
            gas: 10000000,
            from: accounts[0],
            });
            await expectRevert(router.methods.execute(
                [
                  [
                    STAKING_POOLS_ADAPTER,
                    ACTION_DEPOSIT,
                    [
                      [wethDhvLpAddress, convertToShare(1), AMOUNT_RELATIVE],
                      [weth, convertToShare(1), AMOUNT_RELATIVE],
                    ],
                    encodedData,
                  ],
                ],
                [],
                [0, ZERO],
                [],
              )
                .send({
                  gas: 10000000,
                  from: accounts[0]
                }));
        });

        it('Should be correct DHV-WETH LP -> StakingPools deposit', async() => {
          let dhvAmount;
            await wethDhvLp.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
              dhvAmount = result;
              console.log(`dhv-weth lp amount before is ${web3.utils.fromWei(dhvAmount, 'ether')}`);
            });
          await wethDhvLp.methods.approve(router.options.address, dhvAmount)
          .send({
          gas: 10000000,
          from: accounts[0],
          });
          await router.methods.execute(
              [
                [
                  STAKING_POOLS_ADAPTER,
                  ACTION_DEPOSIT,
                  [
                    [wethDhvLp, dhvAmount, AMOUNT_ABSOLUTE]
                  ],
                  encodedData,
                ],
              ],
              [
                [
                  [wethDhvLp, dhvAmount, AMOUNT_ABSOLUTE],
                  [0, EMPTY_BYTES]
                ]
              ],
              [0, ZERO],
              [],
            )
              .send({
                gas: 10000000,
                from: accounts[0]
              })
              .then((receipt) => {
                console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
              });
            await wethDhvLp.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
              console.log(`dhv-weth lp amount after is ${web3.utils.fromWei(result, 'ether')}`);
            });
            let result = await protocol.methods['getBalance(address,address)'](stakingPoolsAddress, accounts[0]).call();
            console.log(`staking pools weth-dhv lp amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    });
});