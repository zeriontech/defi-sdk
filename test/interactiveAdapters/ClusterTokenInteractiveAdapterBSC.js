import expectRevert from '../helpers/expectRevert';
import convertToShare from '../helpers/convertToShare';
import convertToBytes32 from '../helpers/convertToBytes32';

const BN = web3.utils.BN;

const CLUSTER_TOKEN_ADAPTER = convertToBytes32('Cluster Token BSC');

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const EMPTY_BYTES = '0x';

const ZERO = '0x0000000000000000000000000000000000000000';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./ClusterTokenInteractiveAdapterBSC');
const Core = artifacts.require('./Core');
const Router = artifacts.require('./Router');
const ERC20 = artifacts.require('./ERC20');
const ClusterExternalAdapter = artifacts.require('./IExternalAdapter');


contract('ClusterTokenInteractiveAdapter', () => {
    const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const bscClusterAddress = '0x0a684421ef48b431803BFd75F38675EAb1e38Ed5';
    const busdAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56';
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
        encodedData = web3.eth.abi.encodeParameter('address', bscClusterAddress);
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
        await ERC20.at(bscClusterAddress)
          .then((result) => {
            clusterTokenInstance = result.contract;
          });
    });

    describe('ETH <-> BscCluster', async() => {
        it('Should not be correct ETH -> BscCluster if 2 tokens', async() => {
            await clusterTokenInstance.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
              console.log(`BscCluster amount before is ${web3.utils.fromWei(result, 'ether')}`);
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

        it('Should not be correct BUSD -> BscCluster', async() => {
            await clusterTokenInstance.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
              console.log(`BscCluster amount before is ${web3.utils.fromWei(result, 'ether')}`);
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
                  from: accounts[0],
                  value: web3.utils.toWei('1', 'ether'),
                }));
        });

        it('Should be correct ETH -> BscCluster deposit', async() => {
            await clusterTokenInstance.methods['balanceOf(address)'](accounts[0])
            .call()
            .then((result) => {
              console.log(`BscCluster amount before is ${web3.utils.fromWei(result, 'ether')}`);
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
                console.log(`BscCluster amount after is ${web3.utils.fromWei(result, 'ether')}`);
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

        it('Should not be correct ETH <- BscCluster withdraw if 2 tokens', async() => {
            let BscClusterAmount;
            await clusterTokenInstance.methods['balanceOf(address)'](accounts[0])
              .call()
              .then((result) => {
                BscClusterAmount = result;
                console.log(`BscCluster amount before is ${web3.utils.fromWei(result, 'ether')}`);
              });
            await web3.eth.getBalance(accounts[0])
              .then((result) => {
                console.log(` eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
              });
            await clusterTokenInstance.methods.approve(router.options.address, (BscClusterAmount * 2).toString())
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
                    [bscClusterAddress, BscClusterAmount, AMOUNT_ABSOLUTE],
                    [bscClusterAddress, BscClusterAmount, AMOUNT_ABSOLUTE]
                  ],
                  EMPTY_BYTES,
                ],
              ],
              [
                [
                  [bscClusterAddress, BscClusterAmount, AMOUNT_ABSOLUTE],
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

        it('Should be correct ETH <- BscCluster withdraw', async() => {
            let BscClusterAmount;
            await clusterTokenInstance.methods['balanceOf(address)'](accounts[0])
              .call()
              .then((result) => {
                BscClusterAmount = result;
                console.log(`BscCluster amount before is ${web3.utils.fromWei(result, 'ether')}`);
              });
            await web3.eth.getBalance(accounts[0])
              .then((result) => {
                console.log(` eth amount before is ${web3.utils.fromWei(result, 'ether')}`);
              });
            await clusterTokenInstance.methods.approve(router.options.address, (BscClusterAmount * 2).toString())
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
                    [bscClusterAddress, BscClusterAmount, AMOUNT_ABSOLUTE]
                  ],
                  EMPTY_BYTES,
                ],
              ],
              [
                [
                  [bscClusterAddress, BscClusterAmount, AMOUNT_ABSOLUTE],
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
                console.log(`BscCluster amount after is ${web3.utils.fromWei(result, 'ether')}`);
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