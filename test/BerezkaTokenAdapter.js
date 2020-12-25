const AdapterRegistry = artifacts.require('./AdapterRegistry.sol');
const BerezkaTokenAdapter = artifacts.require('./BerezkaTokenAdapter.sol');
const BerezkaTokenAdapterGovernance = artifacts.require('./BerezkaTokenAdapterGovernance.sol');
const BerezkaTokenAdapterStakingGovernance = artifacts.require('./BerezkaTokenAdapterStakingGovernance.sol');

const FLEX_TOKEN = '0x0D7DeA5922535087078dd3D7c554EA9f2655d4cB';
const FLEX_VAULTS = [
  '0xf8a8d25049ebfaf36cf1dd7ff51ebd0777fc9b32',
  '0xc6f7cB66f28954D1EB265d3aE3E24FF20D45d433',
];

const dai = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const uniswapPool = '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852';
const uniswapPool2 = '0xbb2b8038a1640196fbe3e38816f3e67cba72d940';
const uniswapProtocolAdapterAddress = '0x4EdBac5c8cb92878DD3fd165e43bBb8472f34c3f';
const uniswapTokenAdapterAddress = '0xdaF03192B788deEb47beA62769f65e514c5da708';
const erc20TokenAdapterAddress = '0x85609AfE45eE16e52aCB33b8AD103531fC959647';
const uniswapStakingAdapterAddress = '0x2cf372984a2e3c8b2a021d0889b65d590f00d646';

contract('BerezkaTokenAdapter', () => {
  it('...should return corrent amount of tokens when called via adapter registry', async () => {
    const adapterRegistry = await AdapterRegistry.new({ gas: '6000000' });
    // Add Curve adapter
    //
    await adapterRegistry.addProtocols(
      ['Uniswap V2'],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        uniswapProtocolAdapterAddress,
      ]],
      [[[
        uniswapPool,
        uniswapPool2,
      ]]],
    );

    await adapterRegistry.addTokenAdapters(
      ['ERC20', 'Uniswap V2 pool token'],
      [erc20TokenAdapterAddress, uniswapTokenAdapterAddress],
    );

    // Deploy governance
    //
    const governance = await BerezkaTokenAdapterGovernance.new([], []);
    const stakingGovernance = await BerezkaTokenAdapterStakingGovernance.new([]);

    // Add Flex token
    //
    await governance.setProductVaults(FLEX_TOKEN, FLEX_VAULTS);
    // Add curve token to governance
    //
    await governance.addTokens('Uniswap V2 pool token', [uniswapPool, uniswapPool2]);
    await governance.addTokens('ERC20', [dai]);

    // Deploy berezka adapter with governance
    //
    const berezkaTokenAdapter = await BerezkaTokenAdapter.new(
      governance.address,
      stakingGovernance.address,
    );
    await adapterRegistry.addTokenAdapters(
      ['Berezka DAO'],
      [berezkaTokenAdapter.address],
    );

    // Call adapter to get token balances
    //
    const result = await adapterRegistry.getFinalFullTokenBalance('Berezka DAO', FLEX_TOKEN);

    // Expect it to return split balances and Eth.
    // It should also NOT contain 'raw' token (i.e.) uniswapPool address
    //
    const data = JSON.parse(JSON.stringify(result, true, 2));
    const parts = data[1];
    const tokens = parts.map((part) => part[0][0]);

    console.log(JSON.stringify(parts));

    expect(tokens).to.contain('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'); // ETH
    expect(tokens).to.contain('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'); // WETH
    expect(tokens).to.contain('0xdAC17F958D2ee523a2206206994597C13D831ec7'); // USDT
    expect(tokens).to.contain(dai); // DAI

    // Uniswap pool is devided by it's parts
    //
    expect(tokens).to.not.contain(uniswapPool);
    expect(tokens).to.not.contain(uniswapPool2);

    // Add Uniswap staking to governance
    //
    await stakingGovernance.addStakings([uniswapStakingAdapterAddress]);

    // Get balances after enabling staking
    //
    const result2 = await adapterRegistry.getFinalFullTokenBalance('Berezka DAO', FLEX_TOKEN);

    const data2 = JSON.parse(JSON.stringify(result2, true, 2));
    const parts2 = data2[1];

    console.log(JSON.stringify(parts2));

    // Expect to have more WETH after enabling staking
    expect(Number.parseInt(parts[3][1], 10)).to.lt(Number.parseInt(parts2[3][1], 10));
  });
});
