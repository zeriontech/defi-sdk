import expectRevert from '../helpers/expectRevert';
import convertToBytes32 from '../helpers/convertToBytes32';

const SignatureVerifier = artifacts.require('./Router');
const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const InteractiveAdapter = artifacts.require('./MockInteractiveAdapter');
const Core = artifacts.require('./Core');

async function signTypedData(account, data) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'eth_signTypedData',
      params: [account, data],
      id: new Date().getTime(),
    }, (err, response) => {
      if (err) {
        return reject(err);
      }
      return resolve(response.result);
    });
  });
}

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
              TransactionData: [
                { name: 'actions', type: 'Action[]' },
                { name: 'inputs', type: 'TokenAmount[]' },
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
              Fee: [
                { name: 'share', type: 'uint256' },
                { name: 'beneficiary', type: 'address' },
              ],
              AbsoluteTokenAmount: [
                { name: 'token', type: 'address' },
                { name: 'amount', type: 'uint256' },
              ],
            },
            domain: {
              name: 'Zerion Router v1.1',
              chainId: 1,
              verifyingContract: signatureVerifier.options.address,
            },
            primaryType: 'TransactionData',
            message: transactionData,
          };

          return signTypedData(accounts[0], typedData);
        };
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
            amount: web3.utils.toWei('1', 'ether'),
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
      data,
    )
      .call()
      .then(async (hash) => {
        await signatureVerifier.methods.getAccountFromSignature(
          hash,
          signature,
        )
          .call()
          .then((result) => {
            assert.equal(accounts[0], result);
          });
        await signatureVerifier.methods.isHashUsed(
          hash,
          accounts[0],
        )
          .call()
          .then((result) => {
            assert.equal(false, result);
          });
      });

    await expectRevert(signatureVerifier.methods.execute(
      data,
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
            amount: web3.utils.toWei('1', 'ether'),
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
      data,
    )
      .call()
      .then(async (hash) => {
        await signatureVerifier.methods.getAccountFromSignature(
          hash,
          signature,
        )
          .call()
          .then((result) => {
            assert.equal(accounts[0], result);
          });
        await signatureVerifier.methods.isHashUsed(
          hash,
          accounts[0],
        )
          .call()
          .then((result) => {
            assert.equal(false, result);
          });
      });

    await signatureVerifier.methods.execute(
      data,
      signature,
    )
      .send({
        from: accounts[0],
        gas: 10000000,
        value: web3.utils.toWei('1', 'ether'),
      });
    await signatureVerifier.methods.hashData(
      data,
    )
      .call()
      .then(async (hash) => {
        await signatureVerifier.methods.isHashUsed(
          hash,
          accounts[0],
        )
          .call()
          .then((result) => {
            assert.equal(true, result);
          });
      });
    await expectRevert(signatureVerifier.methods.execute(
      data,
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
        inputs: [],
        fee: {
          share: 0,
          beneficiary: ZERO,
        },
        requiredOutputs: [
          {
            token: ethAddress,
            amount: web3.utils.toWei('1', 'ether'),
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
      [],
      [0, ZERO],
      [
        [ethAddress, web3.utils.toWei('1', 'ether')],
      ],
      accounts[0],
      1,
    ];
    await signatureVerifier.methods.hashData(
      data,
    )
      .call()
      .then(async (hash) => {
        await signatureVerifier.methods.getAccountFromSignature(
          hash,
          signature,
        )
          .call()
          .then((result) => {
            assert.equal(accounts[0], result);
          });
        await signatureVerifier.methods.isHashUsed(
          hash,
          accounts[0],
        )
          .call()
          .then((result) => {
            assert.equal(false, result);
          });
      });

    await signatureVerifier.methods.executeWithCHI(
      data,
      signature,
    )
      .send({
        from: accounts[0],
        gas: 10000000,
        value: web3.utils.toWei('1', 'ether'),
      });
    await signatureVerifier.methods.hashData(
      data,
    )
      .call()
      .then(async (hash) => {
        await signatureVerifier.methods.isHashUsed(
          hash,
          accounts[0],
        )
          .call()
          .then((result) => {
            assert.equal(true, result);
          });
      });
    await expectRevert(signatureVerifier.methods.execute(
      data,
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
            amount: web3.utils.toWei('1', 'ether'),
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
      data,
    )
      .call()
      .then(async (hash) => {
        await signatureVerifier.methods.getAccountFromSignature(
          hash,
          `${signature}01`,
        )
          .call()
          .then((result) => {
            assert.equal(accounts[0], result);
          });
      }));
  });
});
