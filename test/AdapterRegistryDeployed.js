const AdapterRegistry = artifacts.require('./AdapterRegistry');

contract.skip('AdapterRegistry deployed', () => {
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
            'Uniswap V1',
            'TokenSets',
            'Synthetix',
            'PoolTogether',
            'Multi-Collateral Dai',
            'Dai Savings Protocol',
            'Chai',
            'iearn.finance (v3)',
            'iearn.finance (v2)',
            'Idle',
            'dYdX',
            'DeFi Money Market',
            'Curve',
            'Compound',
            'Bancor',
            'Balancer',
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
            'Uniswap V1 pool token',
            'SmartToken',
            'SetToken',
            'PoolTogether pool',
            'Chai token',
            'YToken',
            'IdleToken',
            'MToken',
            'Curve pool token',
            'CToken',
            'Balancer pool token',
            'AToken',
            'ERC20',
          ],
        );
      });
    await adapterRegistry.methods.getBalances('0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990')
      .estimateGas()
      .then((estimatedGas) => console.log(`Estimated gas for getBalances() call is ${estimatedGas}`));
  });
});
