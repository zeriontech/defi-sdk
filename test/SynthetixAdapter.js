const AdapterRegistry = artifacts.require('./AdapterRegistry');
const SynthetixAdapter = artifacts.require('./SynthetixAdapter');

contract('SynthetixAdapter', () => {
  const snxAddress = '0x7cB89c509001D25dA9938999ABFeA6740212E5f0';
  const susdAddress = '0x289e9a4674663decEE54f781AaDE5327304A32f8';
  const testAddress = '0xa5f7a39e55d7878bc5bd754ee5d6bd7a7662355b';

  let accounts;
  let adapterRegistry;
  let snxAdapter;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await SynthetixAdapter.new({ from: accounts[0] })
      .then((result) => {
        snxAdapter = result.contract;
      });
    await AdapterRegistry.new(
      [snxAdapter.options.address],
      [[snxAddress, susdAddress]],
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
        // eslint-disable-next-line no-console
        console.log(`Locked SNX amount: ${result[0].balances[0].amount.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`sUSD debt amount: ${result[0].balances[1].amount.toString()}`);
        assert.equal(result[0].name, 'Synthetix');
        assert.equal(result[0].balances[0].asset, snxAddress);
        assert.equal(result[0].balances[0].decimals, 18);
        assert.equal(result[0].balances[1].asset, susdAddress);
        assert.equal(result[0].balances[1].decimals, 18);
        assert.equal(result[0].rates[0].asset, snxAddress);
        assert.equal(result[0].rates[0].components[0].underlying, snxAddress);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
        assert.equal(result[0].rates[1].asset, susdAddress);
        assert.equal(result[0].rates[1].components[0].underlying, susdAddress);
        assert.equal(result[0].rates[1].components[0].rate, 1e18);
      });
  });
});
