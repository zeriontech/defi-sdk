const { BN } = web3.utils;
const AdapterRegistry = artifacts.require('./AdapterRegistry');
const PoolTogetherAdapter = artifacts.require('./PoolTogetherAdapter');

contract('PoolTogetherAdapter', () => {
  const daiAddress = '0x29fe7D60DdF151E5b52e5FAB4f1325da6b2bD958';
  const saiAddress = '0xb7896fce748396EcFC240F5a0d3Cc92ca42D7d84';
  const testAddress = '0xE10Fcdba98afebd0F2296a2c451034d4CA6D9079';

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
      [[daiPool, saiPool]],
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
        const cDAIAmount = new BN(result[0].balances[0].amount);
        const daiAmount = cDAIAmount.div(base).toNumber() / 100;
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
});
