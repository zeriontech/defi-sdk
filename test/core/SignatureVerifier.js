import expectRevert from '../helpers/expectRevert';
import convertToBytes32 from '../helpers/convertToBytes32';
import signTypedData from '../helpers/signTypedData';

const SignatureVerifier = artifacts.require('./Router');
const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./MockInteractiveAdapter');
const Core = artifacts.require('./Core');
const ERC20 = artifacts.require('./ERC20');
const WETH9 = artifacts.require('./WETH9');

contract.only('SignatureVerifier', () => {
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const MOCK_ADAPTER = convertToBytes32('Mock');
  const ZERO = '0x0000000000000000000000000000000000000000';

  let sign;
  let accounts;
  let core;
  let signatureVerifier;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;

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
      [
        MOCK_ADAPTER,
      ],
      [
        protocolAdapterAddress,
      ],
      [
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
    await SignatureVerifier.new(
      core.options.address,
      { from: accounts[0] },
    )
      .then((result) => {
        signatureVerifier = result.contract;

        sign = async function (transactionData) {
          const typedData = {
            types: {
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
              ],
              Execute: [
                { name: 'actions', type: 'Action[]' },
                { name: 'inputs', type: 'Input[]' },
                { name: 'fee', type: 'Fee' },
                { name: 'requiredOutputs', type: 'AbsoluteTokenAmount[]' },
                { name: 'account', type: 'address' },
                { name: 'salt', type: 'uint256' },
              ],
              Action: [
                { name: 'protocolAdapterName', type: 'bytes32' },
                { name: 'actionType', type: 'uint8' },
                { name: 'tokenAmounts', type: 'TokenAmount[]' },
                { name: 'data', type: 'bytes' },
              ],
              TokenAmount: [
                { name: 'token', type: 'address' },
                { name: 'amount', type: 'uint256' },
                { name: 'amountType', type: 'uint8' },
              ],
              Input: [
                { name: 'tokenAmount', type: 'TokenAmount' },
                { name: 'permit', type: 'Permit' },
              ],
              Permit: [
                { name: 'permitType', type: 'uint8' },
                { name: 'permitCallData', type: 'bytes' },
              ],
              Fee: [
                { name: 'share', type: 'uint256' },
                { name: 'beneficiary', type: 'address' },
              ],
              AbsoluteTokenAmount: [
                { name: 'token', type: 'address' },
                { name: 'absoluteAmount', type: 'uint256' },
              ],
            },
            domain: {
              name: 'Zerion Router v1.1',
              chainId: 1,
              verifyingContract: signatureVerifier.options.address,
            },
            primaryType: 'Execute',
            message: transactionData,
          };

          return signTypedData(accounts[0], typedData);
        };
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
    await ERC20.at(wethAddress)
      .then((result) => {
        result.contract.methods.approve(
          signatureVerifier.options.address,
          web3.utils.toWei('1', 'ether'),
        )
          .send({
            from: accounts[0],
            gas: 1000000,
          });
      });
  });

  it('should not be correct signer for data with wrong account', async () => {
    const signature = await sign(
      {
        actions: [
          {
            protocolAdapterName: MOCK_ADAPTER,
            actionType: 1,
            tokenAmounts: [
              {
                token: ethAddress,
                amount: web3.utils.toWei('1', 'ether'),
                amountType: 2,
              },
            ],
            data: web3.eth.abi.encodeParameter(
              'address[]',
              [
                daiAddress,
                wethAddress,
              ],
            ),
          },
        ],
        inputs: [],
        fee: {
          share: 0,
          beneficiary: ZERO,
        },
        requiredOutputs: [
          {
            token: ethAddress,
            absoluteAmount: web3.utils.toWei('1', 'ether'),
          },
        ],
        account: accounts[1],
        salt: 0,
      },
    );

    const data = [
      [
        [
          MOCK_ADAPTER,
          1,
          [
            [ethAddress, web3.utils.toWei('1', 'ether'), 2],
          ],
          web3.eth.abi.encodeParameter(
            'address[]',
            [
              daiAddress,
              wethAddress,
            ],
          ),
        ],
      ],
      [],
      [0, ZERO],
      [
        [ethAddress, web3.utils.toWei('1', 'ether')],
      ],
      accounts[1],
      0,
    ];

    await signatureVerifier.methods.hashData(
      data[0], data[1], data[2], data[3], data[4], data[5],
    )
      .call()
      .then(async (hash) => {
        await signatureVerifier.methods.getAccountFromSignature(
          hash,
          signature,
        )
          .call()
          .then((result) => {
            assert.equal(result, accounts[0]);
          });
        await signatureVerifier.methods.isHashUsed(
          hash,
          accounts[0],
        )
          .call()
          .then((result) => {
            assert.equal(result, false);
          });
      });

    await expectRevert(signatureVerifier.methods.execute(
      data[0], data[1], data[2], data[3], data[4], data[5],
      signature,
    )
      .send({
        from: accounts[0],
        gas: 10000000,
        value: web3.utils.toWei('1', 'ether'),
      }));
  });

  it('should not be correct signer for data with wrong account with CHI', async () => {
    const signature = await sign(
      {
        actions: [
          {
            protocolAdapterName: MOCK_ADAPTER,
            actionType: 1,
            tokenAmounts: [
              {
                token: ethAddress,
                amount: web3.utils.toWei('1', 'ether'),
                amountType: 2,
              },
            ],
            data: web3.eth.abi.encodeParameter(
              'address[]',
              [
                daiAddress,
                wethAddress,
              ],
            ),
          },
        ],
        inputs: [],
        fee: {
          share: 0,
          beneficiary: ZERO,
        },
        requiredOutputs: [
          {
            token: ethAddress,
            absoluteAmount: web3.utils.toWei('1', 'ether'),
          },
        ],
        account: accounts[1],
        salt: 0,
      },
    );

    const data = [
      [
        [
          MOCK_ADAPTER,
          1,
          [
            [ethAddress, web3.utils.toWei('1', 'ether'), 2],
          ],
          web3.eth.abi.encodeParameter(
            'address[]',
            [
              daiAddress,
              wethAddress,
            ],
          ),
        ],
      ],
      [],
      [0, ZERO],
      [
        [ethAddress, web3.utils.toWei('1', 'ether')],
      ],
      accounts[1],
      0,
    ];

    await signatureVerifier.methods.hashData(
      data[0], data[1], data[2], data[3], data[4], data[5],
    )
      .call()
      .then(async (hash) => {
        await signatureVerifier.methods.getAccountFromSignature(
          hash,
          signature,
        )
          .call()
          .then((result) => {
            assert.equal(result, accounts[0]);
          });
        await signatureVerifier.methods.isHashUsed(
          hash,
          accounts[0],
        )
          .call()
          .then((result) => {
            assert.equal(result, false);
          });
      });

    await expectRevert(signatureVerifier.methods.executeWithCHI(
      data[0], data[1], data[2], data[3], data[4], data[5],
      signature,
    )
      .send({
        from: accounts[0],
        gas: 10000000,
        value: web3.utils.toWei('1', 'ether'),
      }));
  });

  it('should be correct signer for execute', async () => {
    const signature = await sign(
      {
        actions: [
          {
            protocolAdapterName: MOCK_ADAPTER,
            actionType: 1,
            tokenAmounts: [
              {
                token: ethAddress,
                amount: web3.utils.toWei('1', 'ether'),
                amountType: 2,
              },
            ],
            data: web3.eth.abi.encodeParameter(
              'address[]',
              [
                daiAddress,
                wethAddress,
              ],
            ),
          },
        ],
        inputs: [],
        fee: {
          share: 0,
          beneficiary: ZERO,
        },
        requiredOutputs: [
          {
            token: ethAddress,
            absoluteAmount: web3.utils.toWei('1', 'ether'),
          },
        ],
        account: accounts[0],
        salt: 0,
      },
    );

    const data = [
      [
        [
          MOCK_ADAPTER,
          1,
          [
            [ethAddress, web3.utils.toWei('1', 'ether'), 2],
          ],
          web3.eth.abi.encodeParameter(
            'address[]',
            [
              daiAddress,
              wethAddress,
            ],
          ),
        ],
      ],
      [],
      [0, ZERO],
      [
        [ethAddress, web3.utils.toWei('1', 'ether')],
      ],
      accounts[0],
      0,
    ];

    await signatureVerifier.methods.hashData(
      data[0], data[1], data[2], data[3], data[4], data[5],
    )
      .call()
      .then(async (hash) => {
        await signatureVerifier.methods.getAccountFromSignature(
          hash,
          signature,
        )
          .call()
          .then((result) => {
            assert.equal(result, accounts[0]);
          });
        await signatureVerifier.methods.isHashUsed(
          hash,
          accounts[0],
        )
          .call()
          .then((result) => {
            assert.equal(result, false);
          });
      });

    await signatureVerifier.methods.execute(
      data[0], data[1], data[2], data[3], data[4], data[5],
      signature,
    )
      .send({
        from: accounts[0],
        gas: 10000000,
        value: web3.utils.toWei('1', 'ether'),
      });

    await signatureVerifier.methods.hashData(
      data[0], data[1], data[2], data[3], data[4], data[5],
    )
      .call()
      .then(async (hash) => {
        await signatureVerifier.methods.isHashUsed(
          hash,
          accounts[0],
        )
          .call()
          .then((result) => {
            assert.equal(result, true);
          });
      });

    await expectRevert(signatureVerifier.methods.execute(
      data[0], data[1], data[2], data[3], data[4], data[5],
      signature,
    )
      .send({
        from: accounts[0],
        gas: 10000000,
        value: web3.utils.toWei('1', 'ether'),
      }));
  });

  it('should be correct signer for execute with chi', async () => {
    const signature = await sign(
      {
        actions: [
          {
            protocolAdapterName: MOCK_ADAPTER,
            actionType: 1,
            tokenAmounts: [
              {
                token: ethAddress,
                amount: web3.utils.toWei('1', 'ether'),
                amountType: 2,
              },
            ],
            data: web3.eth.abi.encodeParameter(
              'address[]',
              [
                daiAddress,
                wethAddress,
              ],
            ),
          },
        ],
        inputs: [
          {
            tokenAmount: {
              token: wethAddress,
              amount: 1,
              amountType: 2,
            },
            permit: {
              permitType: 0,
              permitCallData: '0x',
            },
          },
        ],
        fee: {
          share: 0,
          beneficiary: ZERO,
        },
        requiredOutputs: [
          {
            token: ethAddress,
            absoluteAmount: web3.utils.toWei('1', 'ether'),
          },
        ],
        account: accounts[0],
        salt: 1,
      },
    );

    const data = [
      [
        [
          MOCK_ADAPTER,
          1,
          [
            [ethAddress, web3.utils.toWei('1', 'ether'), 2],
          ],
          web3.eth.abi.encodeParameter(
            'address[]',
            [
              daiAddress,
              wethAddress,
            ],
          ),
        ],
      ],
      [
        [
          [wethAddress, 1, 2],
          [0, '0x'],
        ],
      ],
      [0, ZERO],
      [
        [ethAddress, web3.utils.toWei('1', 'ether')],
      ],
      accounts[0],
      1,
    ];

    await signatureVerifier.methods.hashData(
      data[0], data[1], data[2], data[3], data[4], data[5],
    )
      .call()
      .then(async (hash) => {
        await signatureVerifier.methods.getAccountFromSignature(
          hash,
          signature,
        )
          .call()
          .then((result) => {
            assert.equal(result, accounts[0]);
          });
        await signatureVerifier.methods.isHashUsed(
          hash,
          accounts[0],
        )
          .call()
          .then((result) => {
            assert.equal(result, false);
          });
      });

    await signatureVerifier.methods.executeWithCHI(
      data[0], data[1], data[2], data[3], data[4], data[5],
      signature,
    )
      .send({
        from: accounts[0],
        gas: 10000000,
        value: web3.utils.toWei('1', 'ether'),
      });

    await signatureVerifier.methods.hashData(
      data[0], data[1], data[2], data[3], data[4], data[5],
    )
      .call()
      .then(async (hash) => {
        await signatureVerifier.methods.isHashUsed(
          hash,
          accounts[0],
        )
          .call()
          .then((result) => {
            assert.equal(result, true);
          });
      });

    await expectRevert(signatureVerifier.methods.execute(
      data[0], data[1], data[2], data[3], data[4], data[5],
      signature,
    )
      .send({
        from: accounts[0],
        gas: 10000000,
        value: web3.utils.toWei('1', 'ether'),
      }));
  });

  it('should not recover with too long signature', async () => {
    const signature = await sign(
      {
        actions: [
          {
            protocolAdapterName: MOCK_ADAPTER,
            actionType: 1,
            tokenAmounts: [
              {
                token: ethAddress,
                amount: web3.utils.toWei('1', 'ether'),
                amountType: 2,
              },
            ],
            data: web3.eth.abi.encodeParameter(
              'address[]',
              [
                daiAddress,
                wethAddress,
              ],
            ),
          },
        ],
        inputs: [],
        fee: {
          share: 0,
          beneficiary: ZERO,
        },
        requiredOutputs: [
          {
            token: wethAddress,
            absoluteAmount: web3.utils.toWei('1', 'ether'),
          },
        ],
        account: accounts[0],
        salt: 0,
      },
    );

    const data = [
      [
        [
          MOCK_ADAPTER,
          1,
          [
            [ethAddress, web3.utils.toWei('1', 'ether'), 2],
          ],
          web3.eth.abi.encodeParameter(
            'address[]',
            [
              daiAddress,
              wethAddress,
            ],
          ),
        ],
      ],
      [],
      [0, ZERO],
      [
        [wethAddress, web3.utils.toWei('1', 'ether')],
      ],
      accounts[0],
      0,
    ];

    await expectRevert(signatureVerifier.methods.hashData(
      data[0], data[1], data[2], data[3], data[4], data[5],
    )
      .call()
      .then(async (hash) => {
        await signatureVerifier.methods.getAccountFromSignature(
          hash,
          `${signature}01`,
        )
          .call()
          .then((result) => {
            assert.equal(result, accounts[0]);
          });
      }));
  });
});
