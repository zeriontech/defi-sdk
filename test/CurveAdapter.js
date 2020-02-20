const { BN } = web3.utils;
const AdapterRegistry = artifacts.require('./AdapterRegistry');
const CurveAdapter = artifacts.require('./CurveAdapter');

contract('CurveAdapter', () => {
  const ssTokenAddress = '0x3740fb63ab7a09891d7c0d4299442A551D06F5fD';
  const cDAIAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
  const cUSDCAddress = '0x39AA39c021dfbaE8faC545936693aC917d5E7563';
  const testAddress = '0x98f365b8215189f547E0f77d84aF1A2Cb0820c72';

  let accounts;
  let adapterRegistry;
  let curveAdapter;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await CurveAdapter.new({ from: accounts[0] })
      .then((result) => {
        curveAdapter = result.contract;
      });
    await AdapterRegistry.new(
      [curveAdapter.options.address],
      [[ssTokenAddress]],
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
        const base = new BN(10).pow(new BN(24));
        const ssTokenAmount = new BN(result[0].balances[0].amount);
        const cDAIRate = new BN(result[0].rates[0].components[0].rate);
        const cDAIAmount = cDAIRate.mul(ssTokenAmount).div(base).toNumber() / 100;
        const cUSDCRate = new BN(result[0].rates[0].components[1].rate);
        const cUSDCAmount = cUSDCRate.mul(ssTokenAmount).div(base).toNumber() / 100;

        // eslint-disable-next-line no-console
        console.log(`Deposited ssToken amount: ${ssTokenAmount.toString()}`);
        assert.equal(result[0].balances[0].decimals, 18);
        assert.equal(result[0].balances[0].asset, ssTokenAddress);
        assert.equal(result[0].rates[0].asset, ssTokenAddress);
        assert.equal(result[0].rates[0].components[0].underlying, cDAIAddress);
        // eslint-disable-next-line no-console
        console.log(`cDAI rate: ${cDAIRate.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Means its: ${cDAIAmount} DAI locked`);
        assert.equal(result[0].rates[0].components[1].underlying, cUSDCAddress);
        // eslint-disable-next-line no-console
        console.log(`cUSDC rate: ${cUSDCRate.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Means its: ${cUSDCAmount} USDC locked`);
        assert.equal(result[0].name, 'Curve.fi');
      });
  });
});
