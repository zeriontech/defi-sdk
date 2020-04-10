import displayToken from './helpers/displayToken';

const { BN } = web3.utils;

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ChaiAdapter = artifacts.require('./ChaiInteractiveAdapter');
const UniswapV1Adapter = artifacts.require('./UniswapV1InteractiveAdapter');
const CompoundAssetAdapter = artifacts.require('./CompoundAssetInteractiveAdapter');
const OneSplitAdapter = artifacts.require('./OneSplitInteractiveAdapter');
const ChaiTokenAdapter = artifacts.require('./ChaiTokenAdapter');
const CompoundTokenAdapter = artifacts.require('./CompoundTokenAdapter');
const UniswapV1TokenAdapter = artifacts.require('./UniswapV1TokenAdapter');
const ERC20TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const Logic = artifacts.require('./Logic');
const ERC20 = artifacts.require('./ERC20');

contract('Logic', () => {
  const chaiAddress = '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215';
  const cDAIAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const daiUniAddress = '0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667';
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
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
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  const dai = [
    daiAddress,
    'Dai Stablecoin',
    'DAI',
    '18',
  ];
  const daiUni = [
    daiUniAddress,
    'DAI pool',
    'UNI-V1',
    '18',
  ];
  const eth = [
    ethAddress,
    'Ether',
    'ETH',
    '18',
  ];

  describe('Chai <-> DSR transfer', () => {
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

  describe('Uniswap add/removeLiquidity', () => {
    beforeEach(async () => {
      accounts = await web3.eth.getAccounts();
      await UniswapV1Adapter.new({ from: accounts[0] })
        .then((result) => {
          protocolAdapterAddress = result.address;
        });
      await UniswapV1TokenAdapter.new({ from: accounts[0] })
        .then((result) => {
          tokenAdapterAddress = result.address;
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
        ['Uniswap V1'],
        [[
          'Mock Protocol Name',
          'Mock protocol description',
          'Mock website',
          'Mock icon',
          '0',
        ]],
        [[
          protocolAdapterAddress,
        ]],
        [[[
          daiUniAddress,
        ]]],
      )
        .send({
          from: accounts[0],
          gas: '1000000',
        });
      await adapterRegistry.methods.addTokenAdapters(
        ['ERC20', 'Uniswap V1 pool token'],
        [erc20TokenAdapterAddress, tokenAdapterAddress],
      )
        .send({
          from: accounts[0],
          gas: '1000000',
        });
      await Logic.new(
        adapterRegistry.options.address,
        { from: accounts[0] },
      )
        .then((result) => {
          logic = result.contract;
        });
      await logic.methods.tokenSpender()
        .call()
        .then((result) => {
          tokenSpender = result;
        });
    });

    it('should be correct addLiquidity call transfer', async () => {
      let DAI;
      let daiAmount;
      await ERC20.at(daiAddress)
        .then((result) => {
          DAI = result.contract;
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount is ${new BN(result).div(new BN('10000000000000000')).toNumber() / 100}`);
          daiAmount = result;
        });
      await DAI.methods['approve(address,uint256)'](tokenSpender, daiAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      console.log('calling logic with action...');
      await logic.methods['0x73cd452c']( // executeActions function call
        [
          [1, 'Uniswap V1', 'Asset', [ethAddress, daiAddress], [1000000000000000, 100], [2, 1], '0x'],
        ],
        [
          [daiAddress, 1000, 1, 0],
        ],
      )
        .send({
          from: accounts[0],
          value: '1000000000000000',
          gas: 1000000,
        });
      await adapterRegistry.methods['getBalances(address)'](accounts[0])
        .call()
        .then((result) => {
          displayToken(result[0].adapterBalances[0].balances[0].base);
          displayToken(result[0].adapterBalances[0].balances[0].underlying[0]);
          displayToken(result[0].adapterBalances[0].balances[0].underlying[1]);
          assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, eth);
          assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, daiUni);
          assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[1].metadata, dai);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount is ${new BN(result).div(new BN('10000000000000000')).toNumber() / 100}`);
        });
    });
    it('should be correct removeLiquidity call transfer', async () => {
      let DAI;
      let DAIUNI;
      let daiUniAmount;
      await ERC20.at(daiAddress)
        .then((result) => {
          DAI = result.contract;
        });
      await ERC20.at(daiUniAddress)
        .then((result) => {
          DAIUNI = result.contract;
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is ${new BN(result).div(new BN('10000000000000000'))
            .toNumber() / 100}`);
        });
      await adapterRegistry.methods['getBalances(address)'](accounts[0])
        .call()
        .then((result) => {
          displayToken(result[0].adapterBalances[0].balances[0].base);
          daiUniAmount = result[0].adapterBalances[0].balances[0].base.amount;
          displayToken(result[0].adapterBalances[0].balances[0].underlying[0]);
          displayToken(result[0].adapterBalances[0].balances[0].underlying[1]);
          assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, eth);
          assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, daiUni);
          assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[1].metadata, dai);
        });
      await DAIUNI.methods['approve(address,uint256)'](tokenSpender, daiUniAmount.toString())
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      console.log('calling logic with action...');
      await logic.methods['0x73cd452c']( // executeActions function call
        [
          [2, 'Uniswap V1', 'Asset', [daiUniAddress], [1000], [1], '0x'],
        ],
        [
          [daiUniAddress, 1000, 1, 0],
        ],
      )
        .send({
          from: accounts[0],
          gas: 1000000,
        });
      await adapterRegistry.methods['getBalances(address)'](testAddress)
        .call()
        .then((result) => {
          assert.equal(result.length, 0);
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is ${new BN(result).div(new BN('10000000000000000'))
            .toNumber() / 100}`);
        });
      await DAIUNI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai uni amount after is ${new BN(result).div(new BN('10000000000000000'))
            .toNumber() / 100}`);
        });
    });
  });

  describe('1split tests', () => {
    beforeEach(async () => {
      accounts = await web3.eth.getAccounts();
      await OneSplitAdapter.new({ from: accounts[0] })
        .then((result) => {
          protocolAdapterAddress = result.address;
        });
      await AdapterRegistry.new({ from: accounts[0] })
        .then((result) => {
          adapterRegistry = result.contract;
        });
      await adapterRegistry.methods.addProtocols(
        ['OneSplit'],
        [[
          'Mock Protocol Name',
          'Mock protocol description',
          'Mock website',
          'Mock icon',
          '0',
        ]],
        [[
          protocolAdapterAddress,
        ]],
        [[[]]],
      )
        .send({
          from: accounts[0],
          gas: '1000000',
        });
      await Logic.new(
        adapterRegistry.options.address,
        { from: accounts[0] },
      )
        .then((result) => {
          logic = result.contract;
        });
      await logic.methods.tokenSpender()
        .call()
        .then((result) => {
          tokenSpender = result;
        });
    });
    it.only('should be correct 1split exchange (eth->dai)', async () => {
      let DAI;
      await ERC20.at(daiAddress)
        .then((result) => {
          DAI = result.contract;
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount before is ${new BN(result).div(new BN('10000000000000000')).toNumber() / 100}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is ${new BN(result).div(new BN('10000000000000000')).toNumber() / 100}`);
        });
      console.log('calling logic with action...');
      await logic.methods['0x73cd452c']( // executeActions function call
        [
          [
            1,
            'OneSplit',
            'Exchange',
            [ethAddress],
            ['100000000000000000'],
            [2],
            web3.eth.abi.encodeParameter('address', daiAddress),
          ],
        ],
        [],
      )
        .send({
          from: accounts[0],
          value: 100000000000000000,
        });
      await DAI.methods['balanceOf(address)'](accounts[0])
        .call()
        .then((result) => {
          console.log(`dai amount after is ${new BN(result).div(new BN('10000000000000000')).toNumber() / 100}`);
        });
      await web3.eth.getBalance(accounts[0])
        .then((result) => {
          console.log(`eth amount before is ${new BN(result).div(new BN('10000000000000000')).toNumber() / 100}`);
        });
    });
  });
});
