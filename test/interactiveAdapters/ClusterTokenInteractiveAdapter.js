import expectRevert from '../helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';

const BN = web3.utils.BN;

const CLUSTER_TOKEN_ADAPTER = convertToBytes32('Cluster Token');

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./ClusterTokenInteractiveAdapter');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');
const ClusterExternalAdapter = artifacts.require('./IExternalAdapter');


contract('ClusterTokenInteractiveAdapter', () => {
    const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const polyClusterAddress = '0x4964B3B599B82C3FdDC56e3A9Ffd77d48c6AF0f0';
    const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
    let encodedData;

    let accounts;
    let core;
    let router;
    let protocolAdapterRegistry;
    let protocolAdapterAddress;
    let clusterTokenInstance;
    let clusterExternalAdapter;

    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        encodedData = web3.eth.abi.encodeParameter('address', polyClusterAddress);
        await InteractiveAdapter.new({ from: accounts[0] })
          .then((result) => {
            protocolAdapterAddress = result.address;
          });
        await ProtocolAdapterRegistry.new({ from: accounts[0] })
          .then((result) => {
            protocolAdapterRegistry = result.contract;
          });
        await protocolAdapterRegistry.methods.addProtocolAdapters(
          [
            CLUSTER_TOKEN_ADAPTER,
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
        await ERC20.at(polyClusterAddress)
          .then((result) => {
            clusterTokenInstance = result.contract;
          });
    });

    describe('ETH <-> PolyCluster', async() => {
        it('Should not be correct ETH -> PolyCluster if 2 tokens', async() => {
            await clusterTokenInstance.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
              console.log(`polycluster amount before is ${web3.utils.fromWei(result, 'ether')}`);
            });
            await web3.eth.getBalance(accounts[0])
            .then((result) => {
              console.log(` eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
            });
            await expectRevert(router.methods.execute(
                [
                  [
                    CLUSTER_TOKEN_ADAPTER,
                    ACTION_DEPOSIT,
                    [
                      [ethAddress, convertToShare(1), AMOUNT_RELATIVE],
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
                  from: accounts[0],
                  value: web3.utils.toWei('1', 'ether'),
                }));
        });

        it('Should not be correct DAI -> PolyCluster', async() => {
            await clusterTokenInstance.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
              console.log(`polycluster amount before is ${web3.utils.fromWei(result, 'ether')}`);
            });
            await web3.eth.getBalance(accounts[0])
            .then((result) => {
              console.log(` eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
            });
            await expectRevert(router.methods.execute(
                [
                  [
                    CLUSTER_TOKEN_ADAPTER,
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
                  from: accounts[0],
                  value: web3.utils.toWei('1', 'ether'),
                }));
        });

        it('Should be correct ETH -> PolyCluster deposit', async() => {
            await clusterTokenInstance.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
              console.log(`polycluster amount before is ${web3.utils.fromWei(result, 'ether')}`);
            });
            await web3.eth.getBalance(accounts[0])
            .then((result) => {
              console.log(` eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
            });
            await router.methods.execute(
                [
                  [
                    CLUSTER_TOKEN_ADAPTER,
                    ACTION_DEPOSIT,
                    [
                      [ethAddress, convertToShare(1), AMOUNT_RELATIVE]
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
                  from: accounts[0],
                  value: web3.utils.toWei('1', 'ether'),
                })
                .then((receipt) => {
                  console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
                });
            await clusterTokenInstance.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
                console.log(`polycluster amount after is ${web3.utils.fromWei(result, 'ether')}`);
            });
            await web3.eth.getBalance(accounts[0])
            .then((result) => {
                console.log(` eth amount after is ${web3.utils.fromWei(result, 'ether')}`);
            });
            await clusterTokenInstance.methods['balanceOf(address)'](core.options.address)
            .call()
            .then((result) => {
            assert.equal(result, 0);
            });
        await web3.eth.getBalance(core.options.address)
            .then((result) => {
            assert.equal(result, 0);
            });
        });

        it('Should not be correct ETH <- Polycluster withdraw if 2 tokens', async() => {
            let polyClusterAmount;
            await clusterTokenInstance.methods['balanceOf(address)'](accounts[0])
              .call()
              .then((result) => {
                polyClusterAmount = result;
                console.log(`polycluster amount before is ${web3.utils.fromWei(result, 'ether')}`);
              });
            await web3.eth.getBalance(accounts[0])
              .then((result) => {
                console.log(` eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
              });
            await clusterTokenInstance.methods.approve(router.options.address, (polyClusterAmount * 2).toString())
              .send({
                gas: 10000000,
                from: accounts[0],
              });
              await expectRevert(router.methods.execute(
              [
                [
                  CLUSTER_TOKEN_ADAPTER,
                  ACTION_WITHDRAW,
                  [
                    [polyClusterAddress, polyClusterAmount, AMOUNT_ABSOLUTE],
                    [polyClusterAddress, polyClusterAmount, AMOUNT_ABSOLUTE]
                  ],
                  EMPTY_BYTES,
                ],
              ],
              [
                [
                  [polyClusterAddress, polyClusterAmount, AMOUNT_ABSOLUTE],
                  [0, EMPTY_BYTES]
                ]
              ],
              [0, ZERO],
              [],
            )
              .send({
                gas: 10000000,
                from: accounts[0],
                value: web3.utils.toWei('1', 'ether'),
              }));
        });

        it('Should be correct ETH <- PolyCluster withdraw', async() => {
            let polyClusterAmount;
            await clusterTokenInstance.methods['balanceOf(address)'](accounts[0])
              .call()
              .then((result) => {
                polyClusterAmount = result;
                console.log(`polycluster amount before is ${web3.utils.fromWei(result, 'ether')}`);
              });
            await web3.eth.getBalance(accounts[0])
              .then((result) => {
                console.log(` eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
              });
            await clusterTokenInstance.methods.approve(router.options.address, (polyClusterAmount * 2).toString())
              .send({
                gas: 10000000,
                from: accounts[0],
              });
            await router.methods.execute(
              [
                [
                  CLUSTER_TOKEN_ADAPTER,
                  ACTION_WITHDRAW,
                  [
                    [polyClusterAddress, polyClusterAmount, AMOUNT_ABSOLUTE]
                  ],
                  EMPTY_BYTES,
                ],
              ],
              [
                [
                  [polyClusterAddress, polyClusterAmount, AMOUNT_ABSOLUTE],
                  [0, EMPTY_BYTES]
                ]
              ],
              [0, ZERO],
              [],
            )
              .send({
                gas: 10000000,
                from: accounts[0],
                value: web3.utils.toWei('1', 'ether'),
              })
              .then((receipt) => {
                console.log(`called router for ${receipt.cumulativeGasUsed} gas`);
              });
            await clusterTokenInstance.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
                console.log(`polycluster amount after is ${web3.utils.fromWei(result, 'ether')}`);
            });
            await web3.eth.getBalance(accounts[0])
            .then((result) => {
                console.log(` eth amount after is ${web3.utils.fromWei(result, 'ether')}`);
            });
            await clusterTokenInstance.methods['balanceOf(address)'](core.options.address)
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