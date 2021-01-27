const { assert } = require("console");

const TokenAdapter = artifacts.require('CurveVoteEscrowTokenAdapter');

contract.only('CurveVoteEscrowTokenAdapter', () => {
    const CRV_ADDRESS = 0xD533a949740bb3306d119CC777fa900bA034cd52;
    
    let accounts;
    let tokenAdapter;
    let tokenAdapterAddress;

    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();

        await TokenAdapter.new({ from: accounts[0] })
          .then((result) => {
            tokenAdapter = result.contract
            tokenAdapterAddress = tokenAdapter.address;
          });
    });

    describe('TokenAdapter required functions', async () => {
        it('returns the correct metadata', async () => {
            const expectedMetadata = {
                token: tokenAdapterAddress,
                name: "veCRV",
                symbol: "veCRV",
                decimals: '18'
            };
            await tokenAdapter.methods['getMetadata(address)'](tokenAdapterAddress)
              .call()
              .then((result) => {
                assert.deepEqual(result, expectedMetadata, 'the metadata should match');
              });
        });

        it('returns the correct underlying components', async () => {
            await tokenAdapter.methods['getComponents(address)'](tokenAdapterAddress)
              .call()
              .then((result) => {
                assert.equal(result[0][0], CRV_ADDRESS);
              });
        });
    });
});