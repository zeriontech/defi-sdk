const WatcherRegistry = artifacts.require('./WatcherRegistry');
const SynthetixWatcher = artifacts.require('./SynthetixWatcher');

contract('SynthetixWatcher', () => {
  const snxAddress = '0x7cB89c509001D25dA9938999ABFeA6740212E5f0';

  let accounts;
  let watcherRegistry;
  let snxWatcher;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await SynthetixWatcher.new({ from: accounts[0] })
      .then((result) => {
        snxWatcher = result.contract;
      });
    await WatcherRegistry.new(
      [snxWatcher.options.address],
      [[snxAddress]],
      { from: accounts[0] },
    )
      .then((result) => {
        watcherRegistry = result.contract;
      });
  });

  it('should be correct balance', async () => {
    const testAddress = '0xc8c2b727d864cc75199f5118f0943d2087fb543b';
    await watcherRegistry.methods['balanceOf(address)'](testAddress)
      .call()
      .then((result) => {
        // eslint-disable-next-line no-console
        console.log(`Locked SNX amount: ${result[0].balances[0].amount.toString()}`);
        assert.equal(result[0].balances[0].decimals, 18);
        assert.equal(result[0].balances[0].asset, snxAddress);
        assert.equal(result[0].rates[0].asset, snxAddress);
        assert.equal(result[0].rates[0].components[0].underlying, snxAddress);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
        assert.equal(result[0].name, 'Synthetix');
      });
  });
});
