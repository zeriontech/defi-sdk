const AdapterRegistry = artifacts.require('./AdapterRegistry');
const MCDDepositAdapter = artifacts.require('./MCDDepositAdapter');

contract('MCDDepositAdapter', () => {
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const batAddress = '0x0D8775F648430679A709E98d2b0Cb6250d2887EF';
  const testAddress = '0xD5Ef552f5AE424b14E5a726eBf7E56FC4067Cd32'; // MKR proxy
  const incorrectAssetAddress = '0x1C83501478f1320977047008496DACBD60Bb15ef';

  let accounts;
  let adapterRegistry;
  let mcdDepositAdapter;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await MCDDepositAdapter.new({ from: accounts[0] })
      .then((result) => {
        mcdDepositAdapter = result.contract;
      });
    await AdapterRegistry.new(
      [mcdDepositAdapter.options.address],
      [[wethAddress, batAddress]],
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
          'Deposit',
          'https://protocol-icons.s3.amazonaws.com/maker.png',
          '1',
        ];
        const weth = [
          wethAddress,
          '18',
          'WETH',
        ];
        const bat = [
          batAddress,
          '18',
          'BAT',
        ];

        assert.deepEqual(result[0].protocol, mcd);
        assert.deepEqual(result[0].balances[0].asset, weth);
        assert.deepEqual(result[0].balances[1].asset, bat);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
        assert.deepEqual(result[0].rates[0].asset, weth);
        assert.deepEqual(result[0].rates[0].components[0].underlying, weth);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
        assert.deepEqual(result[0].rates[1].asset, bat);
        assert.deepEqual(result[0].rates[1].components[0].underlying, bat);
        assert.equal(result[0].rates[1].components[0].rate, 1e18);
      });
  });

  it('should return zero balances for incorrect asset', async () => {
    await adapterRegistry.methods['getAssetBalances(address,address,address[])'](
      testAddress,
      mcdDepositAdapter.options.address,
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
