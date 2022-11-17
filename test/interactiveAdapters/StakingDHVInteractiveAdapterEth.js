import expectRevert from '../helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';

const BN = web3.utils.BN;

const DHV_STAKING_ADAPTER = convertToBytes32('DHV Staking');

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./StakingDHVInteractiveAdapterEth');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');
const UniswapRouter = artifacts.require('./UniswapV2Router02');
const StakingPools = artifacts.require('./IStakingPools');
const StakingDHVAdapter = artifacts.require('./StakingDHVAdapter');


contract('StakingDHVInteractiveAdapterEth', () => {
    const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const dhvAddress = '0x62Dc4817588d53a056cBbD18231d91ffCcd34b2A';
    const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
    const stakingDHVAddress = '0x04595f9010F79422a9b411ef963e4dd1F7107704';
    const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    let encodedData;

    let accounts;
    let core;
    let router;
    let protocolAdapterRegistry;
    let protocolAdapterAddress;
    let stakingPools;
    let dhvToken;
    let uniSwapRouter;
    let stakingAdapter;

    let protocol;

    before(async () => {
        accounts = await web3.eth.getAccounts();
        encodedData = web3.eth.abi.encodeParameter('address', accounts[0]);

        stakingAdapter = await StakingDHVAdapter.new({from: accounts[0]});

        uniSwapRouter = await UniswapRouter.at("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
        let ethValue = await web3.utils.toWei('1', 'ether');
        await uniSwapRouter.swapExactETHForTokens(0, [weth, dhvAddress], accounts[0], '10000000000', {from: accounts[0], value: ethValue});

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
            DHV_STAKING_ADAPTER,
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

    describe('DHV <-> StakingDHV', async() => {
        it('Should not be correct DHV -> DHV Staking if 2 tokens', async() => {
            let dhvAmount;
            await dhvToken.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
              dhvAmount = result;
              console.log(`dhv amount before is ${web3.utils.fromWei(result, 'ether')}`);
            });
            // let result = await protocol.methods['getBalance(address,address)'](stakingDHVAddress, accounts[0]).call();
            // console.log(`staking dhv amount before is ${web3.utils.fromWei(result, 'ether')}`);

            await dhvToken.methods.approve(router.options.address, dhvAmount)
            .send({
            gas: 10000000,
            from: accounts[0],
            });
            await expectRevert(router.methods.execute(
                [
                  [
                    DHV_STAKING_ADAPTER,
                    ACTION_DEPOSIT,
                    [
                      [dhvAddress, convertToShare(1), AMOUNT_RELATIVE],
                      [ethAddress, convertToShare(1), AMOUNT_RELATIVE],
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

        it('Should not be correct DAI -> DHV Staking', async() => {
          let dhvAmount;
            await dhvToken.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
              dhvAmount = result;
              console.log(`dhv amount before is ${web3.utils.fromWei(result, 'ether')}`);
            });
          await dhvToken.methods.approve(router.options.address, dhvAmount)
          .send({
          gas: 10000000,
          from: accounts[0],
          });
          await expectRevert(router.methods.execute(
              [
                [
                  DHV_STAKING_ADAPTER,
                  ACTION_DEPOSIT,
                  [
                    [daiAddress, convertToShare(1), AMOUNT_RELATIVE]
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

        it('Should be correct DHV -> DHV Staking deposit', async() => {
          let dhvAmount;
            await dhvToken.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
              dhvAmount = result;
              console.log(`dhv amount before is ${web3.utils.fromWei(dhvAmount, 'ether')}`);
            });
          await dhvToken.methods.approve(router.options.address, dhvAmount)
          .send({
          gas: 10000000,
          from: accounts[0],
          });
          await router.methods.execute(
              [
                [
                  DHV_STAKING_ADAPTER,
                  ACTION_DEPOSIT,
                  [
                    [dhvAddress, dhvAmount, AMOUNT_ABSOLUTE]
                  ],
                  encodedData,
                ],
              ],
              [
                [
                  [dhvAddress, dhvAmount, AMOUNT_ABSOLUTE],
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
            await dhvToken.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
              console.log(`dhv amount after is ${web3.utils.fromWei(result, 'ether')}`);
            });
            let result = await protocol.methods['getBalance(address,address)'](stakingDHVAddress, accounts[0]).call();
            console.log(`staking dhv amount after is ${web3.utils.fromWei(result, 'ether')}`);
      });
    });
});