const AdapterRegistry = artifacts.require('./AdapterRegistry');
const MCDBorrowAdapter = artifacts.require('./MCDBorrowAdapter');

contract('MCDBorrowAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // for debt
  const testAddress = '0xD5Ef552f5AE424b14E5a726eBf7E56FC4067Cd32'; // MKR proxy
  const incorrectAssetAddress = '0x1C83501478f1320977047008496DACBD60Bb15ef';

  let accounts;
  let adapterRegistry;
  let mcdBorrowAdapter;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await MCDBorrowAdapter.new({ from: accounts[0] })
      .then((result) => {
        mcdBorrowAdapter = result.contract;
      });
    await AdapterRegistry.new(
      [mcdBorrowAdapter.options.address],
      [[daiAddress]],
      { from: accounts[0] },
    )
      .then((result) => {
        adapterRegistry = result.contract;
      });
  });

  it('should return correct balances and rates', async () => {
    await adapterRegistry.methods['getProtocolsBalancesAndRates(address)'](testAddress)
      .call()
      .then((result) => {
        // eslint-disable-next-line no-console
        console.log(`ETH collateral amount: ${result[0].balances[1].balance.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`BAT collateral amount: ${result[0].balances[2].balance.toString()}`);

        const mcd = [
          'Multi-Collateral Dai',
          'Collateralized loans on Maker',
          'Borrow',
          'https://protocol-icons.s3.amazonaws.com/maker.png',
          '1',
        ];
        const dai = [
          daiAddress,
          '18',
          'DAI',
        ];

        assert.deepEqual(result[0].protocol, mcd);
        assert.deepEqual(result[0].balances[0].asset, dai);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
        assert.deepEqual(result[0].rates[0].asset, dai);
        assert.deepEqual(result[0].rates[0].components[0].underlying, dai);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
      });
  });

  it('should return zero balances for incorrect asset', async () => {
    await adapterRegistry.methods['getAssetBalances(address,address,address[])'](
      testAddress,
      mcdBorrowAdapter.options.address,
      [incorrectAssetAddress],
    )
      .call()
      .then((result) => {
        const incorrectAsset = [
          incorrectAssetAddress,
          '18',
          'DGTX',
        ];

        assert.equal(result.length, 1);
        assert.deepEqual(result[0].asset, incorrectAsset);
        assert.equal(result[0].balance, 0);
      });
  });
});
