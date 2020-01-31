const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ZrxAdapter = artifacts.require('./ZrxAdapter');

contract('ZrxAdapter', () => {
  const zrxAddress = '0xE41d2489571d322189246DaFA5ebDe1F4699F498';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let zrxAdapter;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ZrxAdapter.new({ from: accounts[0] })
      .then((result) => {
        zrxAdapter = result.contract;
      });
    await AdapterRegistry.new(
      [zrxAdapter.options.address],
      [[zrxAddress]],
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
        console.log(`Deposited ZRX amount: ${result[0].balances[0].amount.toString()}`);
        assert.equal(result[0].name, '0x');
        assert.equal(result[0].balances[0].decimals, 18);
        assert.equal(result[0].balances[0].asset, zrxAddress);
        assert.equal(result[0].rates[0].asset, zrxAddress);
        assert.equal(result[0].rates[0].components[0].underlying, zrxAddress);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
      });
  });
});
