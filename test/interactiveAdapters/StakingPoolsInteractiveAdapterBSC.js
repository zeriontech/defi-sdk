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
const InteractiveAdapter = artifacts.require('./StakingPoolsInteractiveAdapterBSC');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');
const UniswapRouter = artifacts.require('./UniswapV2Router02');
const WETH = artifacts.require('./WETH9');



contract('StakingPoolsInteractiveAdapterBSC', () => {
    const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const busdAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56';
    const busdDhvAddress = '0x72ba008b631d9fd5a8e8013023cb3c05e19a7ca9';
    const wbnb = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
    const dhv = '0x58759dd469ae5631c42cf8a473992335575b58d7';
    const uniswapRouterAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
    const stakingPoolsAddress = '0xF2e8CD1c40C766FEe73f56607fDffa526Ba8fa6c';
    const WETH_DHV_PID = 0;
    let encodedData;

    let accounts;
    let core;
    let router;
    let protocolAdapterRegistry;
    let protocolAdapterAddress;
    let dhvToken;
    let uniSwapRouter;
    let busdERC20;
    let busdDhvLp;

    let protocol;

    before(async () => {
        accounts = await web3.eth.getAccounts();
        encodedData = web3.eth.abi.encodeParameters(['uint', 'address'], [WETH_DHV_PID, accounts[0]);

        uniSwapRouter = await UniswapRouter.at(uniswapRouterAddress);
        busdDhvLp = await ERC20.at(busdDhvAddress);
        dhvToken = await ERC20.at(dhv);
        busdERC20 = await ERC20.at(busdAddress);
        let ethValue = await web3.utils.toWei('1', 'ether');
        await uniSwapRouter.swapExactETHForTokens(0, [wbnb, busdAddress, dhv], accounts[0], '10000000000', {from: accounts[0], value: ethValue});
        await uniSwapRouter.swapExactETHForTokens(0, [wbnb, busdAddress], accounts[0], '10000000000', {from: accounts[0], value: ethValue});
        let dhv_bal = await dhvToken.balanceOf(accounts[0]);
        let busd_bal = await busdERC20.balanceOf(accounts[0]);
        await dhvToken.approve(uniswapRouterAddress, dhv_bal, {from: accounts[0]});
        await busdERC20.approve(uniswapRouterAddress, busd_bal, {from: accounts[0]});
        await uniSwapRouter.addLiquidity(busdAddress, dhv, busd_bal, dhv_bal, 0, 0, accounts[0], '10000000000', {from: accounts[0]});

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
        await ERC20.at(dhv)
          .then((result) => {
            dhvToken = result.contract;
          });
    });

    describe('DHV-BUSD LP <-> StakingPools', async() => {
        it('Should not be correct DHV-BUSD LP -> StakingPools if 2 tokens', async() => {
          let dhvAmount = await busdDhvLp.balanceOf(accounts[0]);
          console.log(`DHV-BUSD lp amount before is ${web3.utils.fromWei(dhvAmount, 'ether')}`);

          await busdDhvLp.approve(router.options.address, dhvAmount, {from: accounts[0]});
            await expectRevert(router.methods.execute(
                [
                  [
                    STAKING_POOLS_ADAPTER,
                    ACTION_DEPOSIT,
                    [
                      [busdDhvAddress, convertToShare(1), AMOUNT_ABSOLUTE],
                      [wbnb, convertToShare(1), AMOUNT_ABSOLUTE],
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

        it('Should be correct DHV-BUSD LP -> StakingPools deposit', async() => {
          let dhvAmount = await busdDhvLp.balanceOf(accounts[0]);
          console.log(`DHV-BUSD lp amount before is ${web3.utils.fromWei(dhvAmount, 'ether')}`);

          await busdDhvLp.approve(router.options.address, dhvAmount, {from: accounts[0]});
          await router.methods.execute(
              [
                [
                  STAKING_POOLS_ADAPTER,
                  ACTION_DEPOSIT,
                  [
                    [busdDhvAddress, dhvAmount, AMOUNT_ABSOLUTE]
                  ],
                  encodedData,
                ],
              ],
              [
                [
                  [busdDhvAddress, dhvAmount, AMOUNT_ABSOLUTE],
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
            dhvAmount = await busdDhvLp.balanceOf(accounts[0]);
            console.log(`DHV-BUSD lp amount after is ${web3.utils.fromWei(dhvAmount, 'ether')}`);
            let result = await protocol.methods['getBalance(address,address)'](stakingPoolsAddress, accounts[0]).call();
            console.log(`staking pools busd-dhv lp amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    });
});