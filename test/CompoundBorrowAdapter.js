const AdapterRegistry = artifacts.require('./AdapterRegistry');
const CompoundBorrowAdapter = artifacts.require('./CompoundBorrowAdapter');

contract('CompoundBorrowAdapter', () => {
  const DAIAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const BATAddress = '0x0D8775F648430679A709E98d2b0Cb6250d2887EF';
  const ETHAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const REPAddress = '0x1985365e9f78359a9B6AD760e32412f4a445E862';
  const ZRXAddress = '0xE41d2489571d322189246DaFA5ebDe1F4699F498';
  const USDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const WBTCAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
  const SAIAddress = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let compoundBorrowAdapter;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await CompoundBorrowAdapter.new({ from: accounts[0] })
      .then((result) => {
        compoundBorrowAdapter = result.contract;
      });
    await AdapterRegistry.new(
      [compoundBorrowAdapter.options.address],
      [[DAIAddress,
        BATAddress,
        ETHAddress,
        REPAddress,
        SAIAddress,
        ZRXAddress,
        USDCAddress,
        WBTCAddress,
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
        // eslint-disable-next-line no-console
        console.log(`Owed DAI amount: ${result[0].balances[0].balance.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Owed REP amount: ${result[0].balances[3].balance.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Owed SAI amount: ${result[0].balances[4].balance.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Owed USDC amount: ${result[0].balances[6].balance.toString()}`);

        const compound = [
          'Compound',
          '',
          'Borrow',
          'https://protocol-icons.s3.amazonaws.com/compound.png',
          '1',
        ];

        const DAI = [
          DAIAddress,
          '18',
          'DAI',
        ];
        const SAI = [
          SAIAddress,
          '18',
          'SAI',
        ];

        assert.deepEqual(result[0].protocol, compound);
        assert.deepEqual(result[0].balances[0].asset, DAI);
        assert.deepEqual(result[0].rates[0].asset, DAI);
        assert.deepEqual(result[0].rates[0].components[0].underlying, DAI);
        assert.deepEqual(result[0].rates[4].components[0].underlying, SAI);
      });
  });
});
