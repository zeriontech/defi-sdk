import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ChaiAdapter = artifacts.require('./ChaiInteractiveAdapter');
const CompoundAssetAdapter = artifacts.require('./CompoundAssetInteractiveAdapter');
const ChaiTokenAdapter = artifacts.require('./ChaiTokenAdapter');
const CompoundTokenAdapter = artifacts.require('./CompoundTokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const Logic = artifacts.require('./Logic');
const ERC20 = artifacts.require('./ERC20');

contract.only('Logic', () => {
  const chaiAddress = '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215';
  const cDAIAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let logic;
  let tokenSpender;
  let adapterRegistry;
  let compoundAssetAdapterAddress;
  let chaiAdapterAddress;
  let chaiTokenAdapterAddress;
  let compoundTokenAdapterAddress;
  let erc20TokenAdapterAddress;
  // const chai = [
  //   chaiAddress,
  //   'Chai',
  //   'CHAI',
  //   '18',
  // ];
  // const dai = [
  //   daiAddress,
  //   'Dai Stablecoin',
  //   'DAI',
  //   '18',
  // ];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ChaiAdapter.new({ from: accounts[0] })
      .then((result) => {
        chaiAdapterAddress = result.address;
      });
    await ChaiTokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        chaiTokenAdapterAddress = result.address;
      });
    await ERC20TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        erc20TokenAdapterAddress = result.address;
      });
    await AdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        adapterRegistry = result.contract;
      });
    await adapterRegistry.methods.addProtocols(
      ['Chai'],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        chaiAdapterAddress,
      ]],
      [[[chaiAddress]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20', 'Chai token'],
      [erc20TokenAdapterAddress, chaiTokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await CompoundAssetAdapter.new({ from: accounts[0] })
      .then((result) => {
        compoundAssetAdapterAddress = result.address;
      });
    await CompoundTokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        compoundTokenAdapterAddress = result.address;
      });
    await adapterRegistry.methods.addProtocols(
      ['Compound'],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        compoundAssetAdapterAddress,
      ]],
      [[[
        cDAIAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['CToken'],
      [compoundTokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await Logic.new(
      adapterRegistry.options.address,
      { from: accounts[0] },
    )
      .then((result) => {
        logic = result.contract;
      });
    await logic.methods.tokenSpender().call().then((result) => {
      tokenSpender = result;
    });
  });

  it('should be correct lend transfer', async () => {
    let cDAIAmount;
    await adapterRegistry.methods['getBalances(address)'](accounts[0])
      .call()
      .then((result) => {
        displayToken(result[0].adapterBalances[0].balances[0].underlying[0]);
        displayToken(result[1].adapterBalances[0].balances[0].underlying[0]);
        cDAIAmount = result[0].adapterBalances[0].balances[0].base.amount;
      });
    // transfer cDAI directly on logic contract
    let cDAI;
    await ERC20.at(cDAIAddress)
      .then((result) => {
        cDAI = result.contract;
      });
    await cDAI.methods['approve(address,uint256)'](tokenSpender, cDAIAmount.toString())
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    // call logic with two actions
    await logic.methods['0x73cd452c']( // executeActions function call
      [
        [2, 'Compound', 'Asset', [cDAIAddress], [1000], [1], '0x'],
        [1, 'Chai', 'Asset', [daiAddress], [1000], [1], '0x'],
      ],
      [
        [cDAIAddress, 1000, 1, 0],
      ],
    )
      .send({
        from: accounts[0],
        gas: 1000000,
      });
    await adapterRegistry.methods['getBalances(address)'](testAddress)
      .call()
      .then((result) => {
        displayToken(result[1].adapterBalances[0].balances[0].underlying[0]);
      });
  });
});
