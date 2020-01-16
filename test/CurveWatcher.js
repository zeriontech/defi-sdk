const { BN } = web3.utils;
const WatcherRegistry = artifacts.require('./WatcherRegistry');
const CurveWatcher = artifacts.require('./CurveWatcher');

contract('CurveWatcher', () => {
  const ssTokenAddress = '0xDBe281E17540Da5305Eb2AeFB8CeF70E6dB1A0A9';
  const cDAIAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
  const cUSDCAddress = '0x39AA39c021dfbaE8faC545936693aC917d5E7563';

  let accounts;
  let watcherRegistry;
  let curveWatcher;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await CurveWatcher.new({ from: accounts[0] })
      .then((result) => {
        curveWatcher = result.contract;
      });
    await WatcherRegistry.new(
      [curveWatcher.options.address],
      [[ssTokenAddress]],
      { from: accounts[0] },
    )
      .then((result) => {
        watcherRegistry = result.contract;
      });
  });

  it('should be correct balance', async () => {
    const testAddress = '0x98f365b8215189f547E0f77d84aF1A2Cb0820c72';
    await watcherRegistry.methods['balanceOf(address)'](testAddress)
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
