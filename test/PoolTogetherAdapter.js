const { BN } = web3.utils;
const AdapterRegistry = artifacts.require('./AdapterRegistry');
const PoolTogetherAdapter = artifacts.require('./PoolTogetherAdapter');

contract('PoolTogetherAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const saiAddress = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359';
  const testAddress = '0x7e5ce10826ee167de897d262fcc9976f609ecd2b';
  const incorrectAsset = '0x1C83501478f1320977047008496DACBD60Bb15ef';

  let accounts;
  let adapterRegistry;
  let poolAdapter;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await PoolTogetherAdapter.new({ from: accounts[0] })
      .then((result) => {
        poolAdapter = result.contract;
      });
    await AdapterRegistry.new(
      [poolAdapter.options.address],
      [[daiAddress, saiAddress]],
      { from: accounts[0] },
    )
      .then((result) => {
        adapterRegistry = result.contract;
      });
  });

  it('should return correct balances and rates', async () => {
    await adapterRegistry.methods['getBalancesAndRates(address)'](testAddress)
      .call()
      .then((result) => {
        const base = new BN(10).pow(new BN(16));
        const daiAmount = new BN(result[0].balances[0].amount).div(base) / 100;
        // eslint-disable-next-line no-console
        console.log(`Deposited DAI amount: ${daiAmount}`);
        assert.equal(result[0].name, 'PoolTogether');
        assert.equal(result[0].balances[0].decimals, 18);
        assert.equal(result[0].balances[0].asset, daiAddress);
        assert.equal(result[0].balances[1].decimals, 18);
        assert.equal(result[0].balances[1].asset, saiAddress);
        assert.equal(result[0].rates[0].asset, daiAddress);
        assert.equal(result[0].rates[0].components[0].underlying, daiAddress);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
        assert.equal(result[0].rates[1].asset, saiAddress);
        assert.equal(result[0].rates[1].components[0].underlying, saiAddress);
        assert.equal(result[0].rates[1].components[0].rate, 1e18);
      });
  });

  it('should return zero balances for incorrect asset', async () => {
    await adapterRegistry.methods['getBalances(address,address,address[])'](
      testAddress,
      poolAdapter.options.address,
      [incorrectAsset],
    )
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(result[0].asset, incorrectAsset);
        assert.equal(result[0].amount, 0);
        assert.equal(result[0].decimals, 18);
      });
  });
});
