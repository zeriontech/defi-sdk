const AdapterRegistry = artifacts.require('./AdapterRegistry');
const SynthetixAdapter = artifacts.require('./SynthetixAdapter');

contract('SynthetixAdapter', () => {
  const snxAddress = '0xC011A72400E58ecD99Ee497CF89E3775d4bd732F';
  const susdAddress = '0x57Ab1E02fEE23774580C119740129eAC7081e9D3';
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
    await adapterRegistry.methods['getProtocolsBalancesAndRates(address)'](testAddress)
      .call()
      .then((result) => {
        // eslint-disable-next-line no-console
        console.log(`Locked SNX amount: ${result[0].balances[0].balance.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`sUSD debt amount: ${result[0].balances[1].balance.toString()}`);

        const synthetix = [
          'Synthetix',
          '',
          '',
          '1',
        ];
        const snx = [
          snxAddress,
          '18',
          'SNX',
        ];
        const susd = [
          susdAddress,
          '18',
          'sUSD',
        ];

        assert.deepEqual(result[0].protocol, synthetix);
        assert.deepEqual(result[0].balances[0].asset, snx);
        assert.deepEqual(result[0].balances[1].asset, susd);
        assert.deepEqual(result[0].rates[0].asset, snx);
        assert.deepEqual(result[0].rates[0].components[0].underlying, snx);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
        assert.deepEqual(result[0].rates[1].asset, susd);
        assert.deepEqual(result[0].rates[1].components[0].underlying, susd);
        assert.equal(result[0].rates[1].components[0].rate, 1e18);
      });
  });
});
