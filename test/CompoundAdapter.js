const { BN } = web3.utils;
const AdapterRegistry = artifacts.require('./AdapterRegistry');
const CompoundAdapter = artifacts.require('./CompoundAdapter');

contract('CompoundAdapter', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const cDAIAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
  const cBATAddress = '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E';
  const cETHAddress = '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5';
  const cREPAddress = '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1';
  const cSAIAddress = '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC';
  const cZRXAddress = '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407';
  const cUSDCAddress = '0x39AA39c021dfbaE8faC545936693aC917d5E7563';
  const cWBTCAddress = '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4';
  const saiAddress = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let compoundAdapter;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await CompoundAdapter.new({ from: accounts[0] })
      .then((result) => {
        compoundAdapter = result.contract;
      });
    await AdapterRegistry.new(
      [compoundAdapter.options.address],
      [[cDAIAddress,
        cBATAddress,
        cETHAddress,
        cREPAddress,
        cSAIAddress,
        cZRXAddress,
        cUSDCAddress,
        cWBTCAddress,
      ]],
      { from: accounts[0] },
    )
      .then((result) => {
        adapterRegistry = result.contract;
      });
  });

  it('should be correct balances and rates', async () => {
    await adapterRegistry.methods['getProtocolsBalancesAndRates(address)'](testAddress)
      .call()
      .then((result) => {
        const base = new BN(10).pow(new BN(34));
        const cDAIAmount = new BN(result[0].balances[0].balance);
        const cDAIRate = new BN(result[0].rates[0].components[0].rate);
        const daiAmount = cDAIRate.mul(cDAIAmount).div(base).toNumber() / 100;
        // eslint-disable-next-line no-console
        console.log(`Deposited cDAI amount: ${cDAIAmount.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`cDAI rate: ${cDAIRate.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Means its: ${daiAmount} DAI locked`);
        // eslint-disable-next-line no-console
        console.log(`Deposited cREP amount: ${result[0].balances[3].balance.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Deposited cSAI amount: ${result[0].balances[4].balance.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Deposited cUSDC amount: ${result[0].balances[6].balance.toString()}`);

        const compound = [
          'Compound',
          '',
          '',
          '1',
        ];
        const cDAI = [
          cDAIAddress,
          '8',
          'cDAI',
        ];
        const DAI = [
          daiAddress,
          '18',
          'DAI',
        ];
        const SAI = [
          saiAddress,
          '18',
          'SAI',
        ];

        assert.deepEqual(result[0].protocol, compound);
        assert.deepEqual(result[0].balances[0].asset, cDAI);
        assert.deepEqual(result[0].rates[0].asset, cDAI);
        assert.deepEqual(result[0].rates[0].components[0].underlying, DAI);
        assert.deepEqual(result[0].rates[4].components[0].underlying, SAI);
      });
  });
});
