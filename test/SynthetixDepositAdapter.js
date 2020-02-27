const AdapterRegistry = artifacts.require('./AdapterRegistry');
const SynthetixDepositAdapter = artifacts.require('./SynthetixDepositAdapter');

contract('SynthetixDepositAdapter', () => {
  const snxAddress = '0xC011A72400E58ecD99Ee497CF89E3775d4bd732F';
  const testAddress = '0xa5f7a39e55d7878bc5bd754ee5d6bd7a7662355b';

  let accounts;
  let adapterRegistry;
  let snxDepositAdapter;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await SynthetixDepositAdapter.new({ from: accounts[0] })
      .then((result) => {
        snxDepositAdapter = result.contract;
      });
    await AdapterRegistry.new(
      [snxDepositAdapter.options.address],
      [[snxAddress]],
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

        const synthetix = [
          'Synthetix',
          'Synthetic assets protocol',
          'Lock',
          'https://protocol-icons.s3.amazonaws.com/synthetix.png',
          '1',
        ];
        const snx = [
          snxAddress,
          '18',
          'SNX',
        ];

        assert.deepEqual(result[0].protocol, synthetix);
        assert.deepEqual(result[0].balances[0].asset, snx);
        assert.deepEqual(result[0].rates[0].asset, snx);
        assert.deepEqual(result[0].rates[0].components[0].underlying, snx);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
      });
  });
});
