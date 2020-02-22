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
    await adapterRegistry.methods['getProtocolsBalancesAndRates(address)'](testAddress)
      .call()
      .then((result) => {
        // eslint-disable-next-line no-console
        console.log(`Deposited ZRX amount: ${result[0].balances[0].balance.toString()}`);

        const zrxProtocol = [
          '0x Staking',
          '',
          'https://protocol-icons.s3.amazonaws.com/0x-staking.png',
          '1',
        ];
        const zrx = [
          zrxAddress,
          '18',
          'ZRX',
        ];

        assert.deepEqual(result[0].protocol, zrxProtocol);
        assert.deepEqual(result[0].balances[0].asset, zrx);
        assert.deepEqual(result[0].rates[0].asset, zrx);
        assert.deepEqual(result[0].rates[0].components[0].underlying, zrx);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
      });
  });
});
