const AdapterRegistry = artifacts.require('./AdapterRegistry');
const SynthetixBorrowAdapter = artifacts.require('./SynthetixBorrowAdapter');

contract('SynthetixBorrowAdapter', () => {
  const susdAddress = '0x57Ab1E02fEE23774580C119740129eAC7081e9D3';
  const testAddress = '0xa5f7a39e55d7878bc5bd754ee5d6bd7a7662355b';

  let accounts;
  let adapterRegistry;
  let snxBorrowAdapter;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await SynthetixBorrowAdapter.new({ from: accounts[0] })
      .then((result) => {
        snxBorrowAdapter = result.contract;
      });
    await AdapterRegistry.new(
      [snxBorrowAdapter.options.address],
      [[susdAddress]],
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
        console.log(`sUSD debt amount: ${result[0].balances[0].balance.toString()}`);

        const synthetix = [
          'Synthetix',
          'Synthetic assets protocol',
          'Borrow',
          'https://protocol-icons.s3.amazonaws.com/synthetix.png',
          '1',
        ];
        const susd = [
          susdAddress,
          '18',
          'sUSD',
        ];

        assert.deepEqual(result[0].protocol, synthetix);
        assert.deepEqual(result[0].balances[0].asset, susd);
        assert.deepEqual(result[0].rates[0].asset, susd);
        assert.deepEqual(result[0].rates[0].components[0].underlying, susd);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
      });
  });
});
