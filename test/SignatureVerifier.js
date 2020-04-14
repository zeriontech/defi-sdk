const SignatureVerifier = artifacts.require('./SignatureVerifier');

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

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await SignatureVerifier.new({ from: accounts[0] })
      .then((result) => {
        signatureVerifier = result.contract;
      });
  });

  it('should be correct signer', async () => {
    // console.log(signatureVerifier.methods);

    let hashApproval;

    await signatureVerifier.methods['hashApproval((address,uint256,uint8,uint256))'](
      ['0x6B175474E89094C44Da98b954EedeAC495271d0F', 1000, 0, 0],
    )
      .call()
      .then((result) => {
        hashApproval = result;
      });
    console.log(`Approval hash to be signed: ${hashApproval}`);

    // sign
    async function signer(token, amount, amountType, nonce) {
      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'verifyingContract', type: 'address' },
          ],
          Approval: [
            { name: 'token', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'amountType', type: 'uint8' },
            { name: 'nonce', type: 'uint256' },
          ],
        },
        domain: {
          verifyingContract: signatureVerifier.options.address,
        },
        primaryType: 'Approval',
        message: {
          token,
          amount,
          amountType,
          nonce,
        },
      };

      return signTypedData(accounts[0], typedData);
    }

    const signature = await signer(
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      1000,
      0,
      0,
    );

    // decode signature
    await signatureVerifier.methods['getUserFromSignatures((address,uint256,uint8,uint256)[],bytes[])'](
      [['0x6B175474E89094C44Da98b954EedeAC495271d0F', 1000, 0, 0]],
      [signature],
    )
      .call()
      .then((result) => {
        assert.equal(accounts[0], result);
      });
  });
});
