const { BN } = web3.utils;
const AdapterRegistry = artifacts.require('./AdapterRegistry');
const IearnAdapter = artifacts.require('./IearnAdapter');

contract('IearnAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const yDAIAddress = '0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01';
  const yUSDCAddress = '0xd6aD7a6750A7593E092a9B218d66C0A814a3436e';
  const yUSDTAddress = '0x83f798e925BcD4017Eb265844FDDAbb448f1707D';
  const ySUSDAddress = '0xF61718057901F84C4eEC4339EF8f0D86D2B45600';
  const yTUSDAddress = '0x73a052500105205d34Daf004eAb301916DA8190f';
  const yWBTCAddress = '0x04Aa51bbcB46541455cCF1B8bef2ebc5d3787EC9';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let iearnAdapter;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await IearnAdapter.new({ from: accounts[0] })
      .then((result) => {
        iearnAdapter = result.contract;
      });
    await AdapterRegistry.new(
      [iearnAdapter.options.address],
      [[yDAIAddress,
        yUSDCAddress,
        yUSDTAddress,
        ySUSDAddress,
        yTUSDAddress,
        yWBTCAddress,
      ]],
      { from: accounts[0] },
    )
      .then((result) => {
        adapterRegistry = result.contract;
      });
  });

  it('should be correct balances and rates', async () => {
    await adapterRegistry.methods['getBalancesAndRates(address)'](testAddress)
      .call()
      .then((result) => {
        const base = new BN(10).pow(new BN(34));
        const yDAIAmount = new BN(result[0].balances[0].amount);
        const yDAIRate = new BN(result[0].rates[0].components[0].rate);
        const daiAmount = yDAIRate.mul(yDAIAmount).div(base).toNumber() / 100;
        // eslint-disable-next-line no-console
        console.log(`Deposited yDAI amount: ${yDAIAmount.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`yDAI rate: ${yDAIRate.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Means its: ${daiAmount} DAI locked`);
        // eslint-disable-next-line no-console
        console.log(`Deposited yUSDC amount: ${result[0].balances[1].amount.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Deposited yUSDT amount: ${result[0].balances[2].amount.toString()}`);

        assert.equal(result[0].balances[0].decimals, 18);
        assert.equal(result[0].balances[0].asset, yDAIAddress);
        assert.equal(result[0].rates[0].asset, yDAIAddress);
        assert.equal(result[0].rates[0].components[0].underlying, daiAddress);
        assert.equal(result[0].name, 'iearn.finance');
      });
  });
});
