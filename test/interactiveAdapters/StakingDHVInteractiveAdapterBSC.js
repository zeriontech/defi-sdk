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
const InteractiveAdapter = artifacts.require('./StakingDHVInteractiveAdapterBSC');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');
const UniswapRouter = artifacts.require('./UniswapV2Router02');
const StakingPools = artifacts.require('./IStakingPools');
const StakingDHVAdapter = artifacts.require('./StakingDHVAdapter');


contract('StakingDHVInteractiveAdapterEth', () => {
    const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const dhvAddress = '0x58759dd469ae5631c42cf8a473992335575b58d7';
    const busdAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56';
    const stakingDHVAddress = '0x35f28aA0B2F34eFF17d2830135312ab2a777De36';
    const wbnb = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
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

        uniSwapRouter = await UniswapRouter.at("0x10ED43C718714eb63d5aA57B78B54704E256024E");
        let ethValue = await web3.utils.toWei('1', 'ether');
        await uniSwapRouter.swapExactETHForTokens(0, [wbnb, busdAddress, dhvAddress], accounts[0], '10000000000', {from: accounts[0], value: ethValue});

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

        it('Should not be correct BUSD -> DHV Staking', async() => {
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
                    [busdAddress, convertToShare(1), AMOUNT_RELATIVE]
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