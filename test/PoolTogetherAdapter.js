const { BN } = web3.utils;
const AdapterRegistry = artifacts.require('./AdapterRegistry');
const PoolTogetherAdapter = artifacts.require('./PoolTogetherAdapter');

contract('PoolTogetherAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const saiAddress = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359';
  const testAddress = '0x7e5ce10826ee167de897d262fcc9976f609ecd2b';

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
    await adapterRegistry.methods['getProtocolsBalancesAndRates(address)'](testAddress)
      .call()
      .then((result) => {
        const base = new BN(10).pow(new BN(16));
        const daiAmount = new BN(result[0].balances[0].balance).div(base) / 100;
        // eslint-disable-next-line no-console
        console.log(`Deposited DAI amount: ${daiAmount}`);

        const poolTogether = [
          'PoolTogether',
          'Decentralized no-loss lottery',
          'https://protocol-icons.s3.amazonaws.com/pooltogether.png',
          '1',
        ];
        const dai = [
          daiAddress,
          '18',
          'DAI',
        ];
        const sai = [
          saiAddress,
          '18',
          'SAI',
        ];

        assert.deepEqual(result[0].protocol, poolTogether);
        assert.deepEqual(result[0].balances[0].asset, dai);
        assert.deepEqual(result[0].balances[1].asset, sai);
        assert.deepEqual(result[0].rates[0].asset, dai);
        assert.deepEqual(result[0].rates[0].components[0].underlying, dai);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
        assert.deepEqual(result[0].rates[1].asset, sai);
        assert.deepEqual(result[0].rates[1].components[0].underlying, sai);
        assert.equal(result[0].rates[1].components[0].rate, 1e18);
      });
  });
});
