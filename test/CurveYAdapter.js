const { BN } = web3.utils;
const AdapterRegistry = artifacts.require('./AdapterRegistry');
const CurveAdapter = artifacts.require('./CurveYAdapter');

contract('CurveYAdapter', () => {
  const ssTokenAddress = '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8';
  const DAIAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const USDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const USDTAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const TUSDAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
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
        const USDTRate = new BN(result[0].rates[0].components[2].rate);
        const USDTAmount = USDTRate.mul(ssTokenAmount).div(base).toString();
        const TUSDRate = new BN(result[0].rates[0].components[3].rate);
        const TUSDAmount = TUSDRate.mul(ssTokenAmount).div(base).toString();

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
        assert.equal(result[0].rates[0].components[2].underlying, USDTAddress);
        // eslint-disable-next-line no-console
        console.log(`USDT rate: ${USDTRate.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Means its: ${USDTAmount} USDT locked`);
        assert.equal(result[0].rates[0].components[3].underlying, TUSDAddress);
        // eslint-disable-next-line no-console
        console.log(`TUSD rate: ${TUSDRate.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Means its: ${TUSDAmount} TUSD locked`);
        assert.equal(result[0].name, 'Curve ∙ Y pool');
      });
  });
});
