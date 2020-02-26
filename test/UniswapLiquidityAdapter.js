const { BN } = web3.utils;
const AdapterRegistry = artifacts.require('./AdapterRegistry');
const UniswapLiquidityAdapter = artifacts.require('./UniswapLiquidityAdapter');

contract('UniswapLiquidityAdapter', () => {
  const batUniAddress = '0x2E642b8D59B45a1D8c5aEf716A84FF44ea665914';
  const mkrUniAddress = '0x2C4Bd064b998838076fa341A83d007FC2FA50957';
  const daiUniAddress = '0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667';
  const usdcUniAddress = '0x97deC872013f6B5fB443861090ad931542878126';
  const batAddress = '0x0D8775F648430679A709E98d2b0Cb6250d2887EF';
  const mkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let uniswapLiquidityAdapter;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await UniswapLiquidityAdapter.new({ from: accounts[0] })
      .then((result) => {
        uniswapLiquidityAdapter = result.contract;
      });
    await AdapterRegistry.new(
      [uniswapLiquidityAdapter.options.address],
      [[batUniAddress,
        mkrUniAddress,
        daiUniAddress,
        usdcUniAddress,
      ]],
      { from: accounts[0] },
    )
      .then((result) => {
        adapterRegistry = result.contract;
      });
  });

  it.only('should be correct balances and rates', async () => {
    await adapterRegistry.methods['getProtocolsBalancesAndRates(address)'](testAddress)
      .call()
      .then((result) => {
        // eslint-disable-next-line no-console
        console.log(`Deposited BAT-uni amount: ${result[0].balances[0].balance.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Deposited MKR-uni amount: ${result[0].balances[1].balance.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Deposited DAI-uni amount: ${result[0].balances[2].balance.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Deposited USDC-uni amount: ${result[0].balances[3].balance.toString()}`);

        const uni = [
          'Uniswap Liquidity',
          'Exchange liquidity pool for tokens trading',
          'https://protocol-icons.s3.amazonaws.com/uniswap.png',
          '1',
        ];
        const batUni = [
          batUniAddress,
          '18',
          'UNI-V1',
        ];
        const mkrUni = [
          mkrUniAddress,
          '18',
          'UNI-V1',
        ];
        const daiUni = [
          daiUniAddress,
          '18',
          'UNI-V1',
        ];
        const usdcUni = [
          usdcUniAddress,
          '18',
          'UNI-V1',
        ];

        const ETH = [
          ethAddress,
          '18',
          'ETH',
        ];
        const BAT = [
          batAddress,
          '18',
          'BAT',
        ];
        const MKR = [
          mkrAddress,
          '18',
          'MKR',
        ];
        const DAI = [
          daiAddress,
          '18',
          'DAI',
        ];
        const USDC = [
          usdcAddress,
          '6',
          'USDC',
        ];

        assert.deepEqual(result[0].protocol, uni);
        assert.deepEqual(result[0].balances[0].asset, batUni);
        assert.deepEqual(result[0].rates[0].asset, batUni);
        assert.deepEqual(result[0].balances[1].asset, mkrUni);
        assert.deepEqual(result[0].rates[1].asset, mkrUni);
        assert.deepEqual(result[0].balances[2].asset, daiUni);
        assert.deepEqual(result[0].rates[2].asset, daiUni);
        assert.deepEqual(result[0].balances[3].asset, usdcUni);
        assert.deepEqual(result[0].rates[3].asset, usdcUni);
        assert.deepEqual(result[0].rates[0].components[0].underlying, ETH);
        assert.deepEqual(result[0].rates[0].components[1].underlying, BAT);
        assert.deepEqual(result[0].rates[1].components[0].underlying, ETH);
        assert.deepEqual(result[0].rates[1].components[1].underlying, MKR);
        assert.deepEqual(result[0].rates[2].components[0].underlying, ETH);
        assert.deepEqual(result[0].rates[2].components[1].underlying, DAI);
        assert.deepEqual(result[0].rates[3].components[0].underlying, ETH);
        assert.deepEqual(result[0].rates[3].components[1].underlying, USDC);
        const base = new BN(10).pow(new BN(32));
        const daiUniAmount = new BN(result[0].balances[2].balance);
        const ethRate = new BN(result[0].rates[2].components[0].rate);
        const daiRate = new BN(result[0].rates[2].components[1].rate);
        const ethAmount = ethRate.mul(daiUniAmount).div(base).toNumber() / 10000;
        const daiAmount = daiRate.mul(daiUniAmount).div(base).toNumber() / 10000;
        // eslint-disable-next-line no-console
        console.log(`Rates are: ${ethRate.toString()}, ${daiRate.toString()}`);
        // eslint-disable-next-line no-console
        console.log(`Means its: ${ethAmount} ETH and ${daiAmount} DAI deposited to the pool`);
      });
  });
});
