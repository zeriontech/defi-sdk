const TokenAdapter = artifacts.require('StakeDaoTokenAdapter');

contract('StakeDaoTokenAdapter', () => {
  const sbtcVaultAddress = '0x24129B935AfF071c4f0554882C0D9573F4975fEd';
  const sbtcCrv = '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3';

  const sdveCrvAddress = '0x478bBC744811eE8310B461514BDc29D03739084D';
  const CRV = '0xD533a949740bb3306d119CC777fa900bA034cd52';

  let accounts;
  let tokenAdapter;
  const sbtcVault = [
    sbtcVaultAddress,
    'stake dao Curve.fi renBTC/wBTC/sBTC',
    'sdcrvRenWSBTC',
    '18',
  ];

  const sdveCrvVault = [sdveCrvAddress, 'veCRV Stake DAO', 'sdveCRV-DAO', '18'];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    await TokenAdapter.new({ from: accounts[0] }).then((result) => {
      tokenAdapter = result.contract;
    });
  });

  it('should return correct components for sBTC, 3Pool, Eurs vaults', async () => {
    await tokenAdapter.methods['getComponents(address)'](sbtcVaultAddress)
      .call()
      .then((result) => {
        assert.equal(result[0][0], sbtcCrv);
        assert.equal(result[0][1], 'ERC20');
      });
  });

  it('should return correct metadata for sBTC, 3Pool, Eurs vaults', async () => {
    await tokenAdapter.methods['getMetadata(address)'](sbtcVaultAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, sbtcVault);
      });
  });

  it('should return correct components for perpetual passive strategy vault', async () => {
    await tokenAdapter.methods['getComponents(address)'](sdveCrvAddress)
      .call()
      .then((result) => {
        assert.equal(result[0][0], CRV);
        assert.equal(result[0][1], 'ERC20');
        assert.equal(result[0][2], '1000000000000000000');
      });
  });

  it('should return correct metadata for perpetual passive strategy vaults', async () => {
    await tokenAdapter.methods['getMetadata(address)'](sdveCrvAddress)
      .call()
      .then((result) => {
        assert.deepEqual(result, sdveCrvVault);
      });
  });
});
