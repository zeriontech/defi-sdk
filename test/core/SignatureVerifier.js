import expectRevert from '../helpers/expectRevert';

const SignatureVerifier = artifacts.require('./Router');

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

contract('SignatureVerifier', () => {
  let accounts;
  let signatureVerifier;
  let sign;

  const EXCHANGE_ADAPTER = '03';
  const ZERO = '0x0000000000000000000000000000000000000000';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const UNISWAP_EXCHANGE_ADAPTER = `${
    web3.eth.abi.encodeParameter(
      'bytes32',
      web3.utils.toHex('Uniswap V2'),
    )
      .slice(0, -2)
  }${EXCHANGE_ADAPTER}`;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await SignatureVerifier.new('0x0000000000000000000000000000000000000001', { from: accounts[0] })
      .then((result) => {
        signatureVerifier = result.contract;
        sign = async function(transactionData) {
  const typedData = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'verifyingContract', type: 'address' },
      ],
      TransactionData: [
        { name: 'actions', type: 'Action[]' },
        { name: 'inputs', type: 'TokenAmount[]' },
        { name: 'fee', type: 'Fee' },
        { name: 'requiredOutputs', type: 'AbsoluteTokenAmount[]' },
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
      name: 'Zerion Router',
      verifyingContract: signatureVerifier.options.address,
    },
    primaryType: 'TransactionData',
    message: transactionData,
  };

  return signTypedData(accounts[0], typedData);
}
      });
  });

  it('should be correct signer', async () => {
    const signature = await sign(
    {
      actions: [
        {
          protocolAdapterName: UNISWAP_EXCHANGE_ADAPTER,
          actionType: 1,
          tokenAmounts: [
            {
              token: daiAddress,
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
          token: daiAddress,
          amount: web3.utils.toWei('1', 'ether'),
          amountType: 2,
        },
      ],
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
      salt: 0,
    },
  );
    await signatureVerifier.methods.hashData(
      [
        [
          [
            UNISWAP_EXCHANGE_ADAPTER,
            1,
            [
              [daiAddress, web3.utils.toWei('1', 'ether'), 2],
            ],
            web3.eth.abi.encodeParameter('address[]', [daiAddress, wethAddress]),
          ],
        ],
        [
          [daiAddress, web3.utils.toWei('1', 'ether'), 2],
        ],
        [0, ZERO],
        [
          [wethAddress, web3.utils.toWei('1', 'ether')],
        ],
        0,
      ],
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
        )
          .call()
          .then((result) => {
            assert.equal('false', result);
          });
      });
  });

  it('should not recover with too long signature', async () => {
    const signature = await sign(
      {
        actions: [
          {
            protocolAdapterName: UNISWAP_EXCHANGE_ADAPTER,
            actionType: 1,
            tokenAmounts: [
              {
                token: daiAddress,
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
            token: daiAddress,
            amount: web3.utils.toWei('1', 'ether'),
            amountType: 2,
          },
        ],
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
        salt: 0,
      },
    );
    await expectRevert(signatureVerifier.methods.hashData(
      [
        [
          [
            UNISWAP_EXCHANGE_ADAPTER,
            1,
            [
              [daiAddress, web3.utils.toWei('1', 'ether'), 2],
            ],
            web3.eth.abi.encodeParameter('address[]', [daiAddress, wethAddress]),
          ],
        ],
        [
          [daiAddress, web3.utils.toWei('1', 'ether'), 2],
        ],
        [0, ZERO],
        [
          [wethAddress, web3.utils.toWei('1', 'ether')],
        ],
        0,
      ],
    )
      .call()
      .then(async (hash) => {
        await signatureVerifier.methods.getAccountFromSignature(
          hash,
          signature + '01',
        )
          .call()
          .then((result) => {
            assert.equal(accounts[0], result);
          });
      }));
  });
});
