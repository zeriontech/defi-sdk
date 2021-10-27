const TokenAdapter = artifacts.require('CurveMetapoolTokenAdapter');

contract('CurveMetapoolTokenAdapter', () => {
  const alUSD3CrvAddress = '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c';
  const alUSDAddress = '0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9';

  let accounts;
  let tokenAdapter;
  const alUSD3Crv = [
    alUSD3CrvAddress,
    'Curve.fi Factory USD Metapool: Alchemix USD',
    'alUSD3CRV-f',
    '18',
  ];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    await TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapter = result.contract;
      });
  });

  it('should return correct components', async () => {
    await tokenAdapter.methods['getComponents(address)'](alUSD3CrvAddress)
      .call()
      .then((result) => {
        assert.equal(result[0][0], alUSDAddress);
      });
  });

  it('should return correct metadata', async () => {
    await tokenAdapter.methods['getMetadata(address)'](alUSD3CrvAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, alUSD3Crv);
      });
  });

  it('should return correct 3 components', async () => {
    await tokenAdapter.methods['getComponents(address)']('0xBaaa1F5DbA42C3389bDbc2c9D2dE134F5cD0Dc89')
      .call()
      .then((result) => {
        assert.equal(result[0][0], '0x853d955aCEf822Db058eb8505911ED77F175b99e');
        assert.equal(result[1][0], '0x956F47F50A910163D8BF957Cf5846D573E7f87CA');
        assert.equal(result[2][0], '0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9');
      });
  });

  it('should return correct 4 components', async () => {
    await tokenAdapter.methods['getComponents(address)']('0xDa5B670CcD418a187a3066674A8002Adc9356Ad1')
      .call()
      .then((result) => {
        assert.equal(result[0][0], '0xD533a949740bb3306d119CC777fa900bA034cd52');
        assert.equal(result[1][0], '0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a');
        assert.equal(result[2][0], '0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7');
        assert.equal(result[3][0], '0xD38aEb759891882e78E957c80656572503D8c1B1');
      });
  });
});
