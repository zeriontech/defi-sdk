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
            '0x3078205374616b696e67',
            web3.utils.toHex('Weth'),
            web3.utils.toHex('Uniswap V1'),
            web3.utils.toHex('TokenSets'),
            web3.utils.toHex('Synthetix'),
            web3.utils.toHex('PoolTogether'),
            web3.utils.toHex('Multi-Collateral Dai'),
            web3.utils.toHex('Dai Savings Protocol'),
            web3.utils.toHex('Chai'),
            web3.utils.toHex('iearn.finance (v3)'),
            web3.utils.toHex('iearn.finance (v2)'),
            web3.utils.toHex('Idle'),
            web3.utils.toHex('dYdX'),
            web3.utils.toHex('DeFi Money Market'),
            web3.utils.toHex('Curve'),
            web3.utils.toHex('Compound'),
            web3.utils.toHex('Bancor'),
            web3.utils.toHex('Balancer'),
            web3.utils.toHex('Aave'),
          ],
        );
      });
    await adapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.deepEqual(
          result,
          [
            web3.utils.toHex('Weth'),
            web3.utils.toHex('Uniswap V1 pool token'),
            web3.utils.toHex('SmartToken'),
            web3.utils.toHex('SetToken'),
            web3.utils.toHex('PoolTogether pool'),
            web3.utils.toHex('Chai token'),
            web3.utils.toHex('YToken'),
            web3.utils.toHex('IdleToken'),
            web3.utils.toHex('MToken'),
            web3.utils.toHex('Curve pool token'),
            web3.utils.toHex('CToken'),
            web3.utils.toHex('Balancer pool token'),
            web3.utils.toHex('AToken'),
            web3.utils.toHex('ERC20'),
          ],
        );
      });
    await adapterRegistry.methods.getBalances('0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990')
      .estimateGas()
      .then((estimatedGas) => console.log(`Estimated gas for getBalances() call is ${estimatedGas}`));
  });
});
