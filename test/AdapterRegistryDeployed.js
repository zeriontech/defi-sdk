const AdapterRegistry = artifacts.require('./AdapterRegistry');
const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

contract('AdapterRegistry deployed', () => {
  let adapterRegistry;

  beforeEach(async () => {
    await AdapterRegistry.deployed()
      .then((result) => {
        adapterRegistry = result.contract;
      });
  });

  it('should be correct return values from getters', async () => {
    await adapterRegistry.methods.getProtocolNames()
      .call()
      .then((result) => {
        assert.deepEqual(
          result,
          [
            '0x Staking',
            'Uniswap',
            'Synthetix',
            'PoolTogether',
            'Multi-Collateral Dai',
            'Dai Savings Rate',
            'Chai',
            'iearn.finance (v3)',
            'iearn.finance (v2)',
            'dYdX',
            'Curve',
            'Compound',
            'Aave',
          ],
        );
      });
    await adapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.deepEqual(
          result,
          [
            'Uniswap pool token',
            'PoolTogether pool',
            'Chai token',
            'YToken',
            'Curve pool token',
            'CToken',
            'AToken',
            'ERC20',
          ],
        );
      });
    await adapterRegistry.methods['getBalances(address)'](testAddress)
      .call()
      .then((result) => {
        // eslint-disable-next-line no-console
        console.dir(result, { depth: null });
      });
  });
});
