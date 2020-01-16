const WatcherRegistry = artifacts.require('./WatcherRegistry');
const DSRWatcher = artifacts.require('./DSRWatcher');

contract('DSRWatcher', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

  let accounts;
  let watcherRegistry;
  let dsrWatcher;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await DSRWatcher.new({ from: accounts[0] })
      .then((result) => {
        dsrWatcher = result.contract;
      });
    await WatcherRegistry.new(
      [dsrWatcher.options.address],
      [[daiAddress]],
      { from: accounts[0] },
    )
      .then((result) => {
        watcherRegistry = result.contract;
      });
  });

  it('should be correct balance', async () => {
    const testAddress = '0x5DbC6c9Bf22f78eecDb74275810403416C4F2CA0';
    await watcherRegistry.methods['balanceOf(address)'](testAddress)
      .call()
      .then((result) => {
        // eslint-disable-next-line no-console
        console.log(`Deposited DAI amount: ${result[0].balances[0].amount.toString()}`);
        assert.equal(result[0].balances[0].decimals, 18);
        assert.equal(result[0].balances[0].asset, daiAddress);
        assert.equal(result[0].rates[0].asset, daiAddress);
        assert.equal(result[0].rates[0].components[0].underlying, daiAddress);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
        assert.equal(result[0].name, 'DSR');
      });
  });
});
