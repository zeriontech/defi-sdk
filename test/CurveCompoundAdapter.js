const { BN } = web3.utils;
const AdapterRegistry = artifacts.require('./AdapterRegistry');
const CurveAdapter = artifacts.require('./CurveCompoundAdapter');

contract('CurveCompoundAdapter', () => {
  const ssTokenAddress = '0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2';
  const DAIAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const USDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

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
        const base = new BN(10).pow(new BN(18));
        const ssTokenAmount = new BN(result[0].balances[0].amount);
        const DAIRate = new BN(result[0].rates[0].components[0].rate);
        const DAIAmount = DAIRate.mul(ssTokenAmount).div(base).toString();
        const USDCRate = new BN(result[0].rates[0].components[1].rate);
        const USDCAmount = USDCRate.mul(ssTokenAmount).div(base).toString();

        // eslint-disable-next-line no-console
        console.log(`Deposited ssToken amount: ${ssTokenAmount.toString()}`);
        assert.equal(result[0].balances[0].decimals, 18);
        assert.equal(result[0].balances[0].asset, ssTokenAddress);
        assert.equal(result[0].rates[0].asset, ssTokenAddress);
        assert.equal(result[0].rates[0].components[0].underlying, DAIAddress);
        // eslint-disable-next-line no-console
        console.log(`DAI rate: ${DAIRate.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Means its: ${DAIAmount} DAI locked`);
        assert.equal(result[0].rates[0].components[1].underlying, USDCAddress);
        // eslint-disable-next-line no-console
        console.log(`USDC rate: ${USDCRate.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Means its: ${USDCAmount} USDC locked`);
        assert.equal(result[0].name, 'Curve ∙ Compound pool');
      });
  });
});
