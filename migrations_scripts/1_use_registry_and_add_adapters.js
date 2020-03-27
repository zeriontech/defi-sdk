const AaveAssetAdapter = artifacts.require('AaveAssetAdapter');
const AaveDebtAdapter = artifacts.require('AaveDebtAdapter');
const CompoundAssetAdapter = artifacts.require('CompoundAssetAdapter');
const CompoundDebtAdapter = artifacts.require('CompoundDebtAdapter');
const CurveAdapter = artifacts.require('CurveAdapter');
const DyDxAssetAdapter = artifacts.require('DyDxAssetAdapter');
const DyDxDebtAdapter = artifacts.require('DyDxDebtAdapter');
const IdleAdapter = artifacts.require('IdleAdapter');
const IearnAdapter = artifacts.require('IearnAdapter');
const ChaiAdapter = artifacts.require('ChaiAdapter');
const DSRAdapter = artifacts.require('DSRAdapter');
const MCDAssetAdapter = artifacts.require('MCDAssetAdapter');
const MCDDebtAdapter = artifacts.require('MCDDebtAdapter');
const PoolTogetherAdapter = artifacts.require('PoolTogetherAdapter');
const SynthetixAssetAdapter = artifacts.require('SynthetixAssetAdapter');
const SynthetixDebtAdapter = artifacts.require('SynthetixDebtAdapter');
const UniswapV1Adapter = artifacts.require('UniswapV1Adapter');
const ZrxAdapter = artifacts.require('ZrxAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');
const AaveTokenAdapter = artifacts.require('AaveTokenAdapter');
const CompoundTokenAdapter = artifacts.require('CompoundTokenAdapter');
const CurveTokenAdapter = artifacts.require('CurveTokenAdapter');
const IdleTokenAdapter = artifacts.require('IdleTokenAdapter');
const IearnTokenAdapter = artifacts.require('IearnTokenAdapter');
const ChaiTokenAdapter = artifacts.require('ChaiTokenAdapter');
const PoolTogetherTokenAdapter = artifacts.require('PoolTogetherTokenAdapter');
const UniswapV1TokenAdapter = artifacts.require('UniswapV1TokenAdapter');
const AdapterRegistry = artifacts.require('AdapterRegistry');

const aDaiAddress = '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d';
const aTusdAddress = '0x4DA9b813057D04BAef4e5800E36083717b4a0341';
const aUsdcAddress = '0x9bA00D6856a4eDF4665BcA2C2309936572473B7E';
const aUsdtAddress = '0x71fc860F7D3A592A4a98740e39dB31d25db65ae8';
const aSusdAddress = '0x625aE63000f46200499120B906716420bd059240';
const aBusdAddress = '0x6Ee0f7BB50a54AB5253dA0667B0Dc2ee526C30a8';
const aLendAddress = '0x7D2D3688Df45Ce7C552E19c27e007673da9204B8';
const aBatAddress = '0xE1BA0FB44CCb0D11b80F92f4f8Ed94CA3fF51D00';
const aEthAddress = '0x3a3A65aAb0dd2A17E3F1947bA16138cd37d08c04';
const aLinkAddress = '0xA64BD6C70Cb9051F6A9ba1F163Fdc07E0DfB5F84';
const aKncAddress = '0x9D91BE44C06d373a8a226E1f3b146956083803eB';
const aRepAddress = '0x71010A9D003445aC60C4e6A7017c1E89A477B438';
const aMkrAddress = '0x7deB5e830be29F91E298ba5FF1356BB7f8146998';
const aManaAddress = '0x6FCE4A401B6B80ACe52baAefE4421Bd188e76F6f';
const aZrxAddress = '0x6Fb0855c404E09c47C3fBCA25f08d4E41f9F062f';
const aSnxAddress = '0x328C4c80BC7aCa0834Db37e6600A6c49E12Da4DE';
const aWbtcAddress = '0xFC4B8ED459e00e5400be803A9BB3954234FD50e3';

const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const tusdAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const susdAddress = '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51';
const busdAddress = '0x4Fabb145d64652a948d72533023f6E7A623C7C53';
const lendAddress = '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03';
const batAddress = '0x0D8775F648430679A709E98d2b0Cb6250d2887EF';
const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const linkAddress = '0x514910771AF9Ca656af840dff83E8264EcF986CA';
const kncAddress = '0xdd974D5C2e2928deA5F71b9825b8b646686BD200';
const repAddress = '0x1985365e9f78359a9B6AD760e32412f4a445E862';
const mkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
const manaAddress = '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942';
const zrxAddress = '0xE41d2489571d322189246DaFA5ebDe1F4699F498';
const snxAddress = '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F';
const wbtcAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

const cDAIAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
const cBATAddress = '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E';
const cETHAddress = '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5';
const cREPAddress = '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1';
const cSAIAddress = '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC';
const cZRXAddress = '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407';
const cUSDCAddress = '0x39AA39c021dfbaE8faC545936693aC917d5E7563';
const cWBTCAddress = '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4';

const saiAddress = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359';

const yDAIv2 = '0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01';
const yUSDCv2 = '0xd6aD7a6750A7593E092a9B218d66C0A814a3436e';
const yUSDTv2 = '0x83f798e925BcD4017Eb265844FDDAbb448f1707D';
const ySUSDv2 = '0xF61718057901F84C4eEC4339EF8f0D86D2B45600';
const yTUSDv2 = '0x73a052500105205d34Daf004eAb301916DA8190f';
const yWBTCv2 = '0x04Aa51bbcB46541455cCF1B8bef2ebc5d3787EC9';

const yDAIv3 = '0xC2cB1040220768554cf699b0d863A3cd4324ce32';
const yUSDCv3 = '0x26EA744E5B887E5205727f55dFBE8685e3b21951';
const yUSDTv3 = '0xE6354ed5bC4b393a5Aad09f21c46E101e692d447';
const yBUSDv3 = '0x04bC0Ab673d88aE9dbC9DA2380cB6B79C4BCa9aE';

const idleDAI = '0x10eC0D497824e342bCB0EDcE00959142aAa766dD';
const idleUSDC = '0xeB66ACc3d011056B00ea521F8203580C2E5d3991';

const ssCompoundTokenAddress = '0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2';
const ssYTokenAddress = '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8';
const ssBusdTokenAddress = '0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B';

const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

const saiPoolAddress = '0xb7896fce748396EcFC240F5a0d3Cc92ca42D7d84';
const daiPoolAddress = '0x29fe7D60DdF151E5b52e5FAB4f1325da6b2bD958';
const usdcPoolAddress = '0x0034Ea9808E620A0EF79261c51AF20614B742B24';

const chaiAddress = '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215';

const aaveAssetAdapterTokens = [
  aDaiAddress,
  aTusdAddress,
  aUsdcAddress,
  aUsdtAddress,
  aSusdAddress,
  aBusdAddress,
  aLendAddress,
  aBatAddress,
  aEthAddress,
  aLinkAddress,
  aKncAddress,
  aRepAddress,
  aMkrAddress,
  aManaAddress,
  aZrxAddress,
  aSnxAddress,
  aWbtcAddress,
];
const aaveDebtAdapterTokens = [
  daiAddress,
  tusdAddress,
  usdcAddress,
  usdtAddress,
  susdAddress,
  busdAddress,
  lendAddress,
  batAddress,
  ethAddress,
  linkAddress,
  kncAddress,
  repAddress,
  mkrAddress,
  manaAddress,
  zrxAddress,
  snxAddress,
  wbtcAddress,
];
const compoundAssetAdapterTokens = [
  cDAIAddress,
  cBATAddress,
  cETHAddress,
  cREPAddress,
  cSAIAddress,
  cZRXAddress,
  cUSDCAddress,
  cWBTCAddress,
];
const compoundDebtAdapterTokens = [
  daiAddress,
  batAddress,
  ethAddress,
  repAddress,
  saiAddress,
  zrxAddress,
  usdcAddress,
  wbtcAddress,
];
const curveAdapterTokens = [
  ssCompoundTokenAddress,
  ssYTokenAddress,
  ssBusdTokenAddress,
];
const dydxAdapterTokens = [
  wethAddress,
  saiAddress,
  usdcAddress,
  daiAddress,
];
const idleAdapterTokens = [
  idleDAI,
  idleUSDC,
];
const iearn2AdapterTokens = [
  yDAIv2,
  yUSDCv2,
  yUSDTv2,
  ySUSDv2,
  yTUSDv2,
  yWBTCv2,
];
const iearn3AdapterTokens = [
  yDAIv3,
  yUSDCv3,
  yUSDTv3,
  yBUSDv3,
];
const dsrAdapterTokens = [
  daiAddress,
];
const chaiAdapterTokens = [
  chaiAddress,
];
const mcdAssetAdapterTokens = [
  wethAddress,
  batAddress,
];
const mcdDebtAdapterTokens = [
  daiAddress,
];
const poolTogetherAdapterTokens = [
  saiPoolAddress,
  daiPoolAddress,
  usdcPoolAddress,
];
const synthetixAssetAdapterTokens = [
  snxAddress,
];
const synthetixDebtAdapterTokens = [
  susdAddress,
];
const uniswapV1AdapterTokens = [ // top 30 pools
  '0xe9cf7887b93150d4f2da7dfc6d502b216438f244',
  '0x05cde89ccfa0ada8c88d5a23caaa79ef129e7883',
  '0x2a1530c4c41db0b0b2bb646cb5eb1a67b7158667',
  '0x97dec872013f6b5fb443861090ad931542878126',
  '0x2c4bd064b998838076fa341a83d007fc2fa50957',
  '0xa2881a90bf33f03e7a3f803765cd2ed5c8928dfb',
  '0x3958b4ec427f8fa24eb60f42821760e88d485f7f',
  '0x4d2f5cfba55ae412221182d8475bc85799a5644b',
  '0x2e642b8d59b45a1d8c5aef716a84ff44ea665914',
  '0xf173214c720f58e03e194085b1db28b50acdeead',
  '0x93a8515d674c3d3235beea0de7ae3099aa34b1a5',
  '0x49c4f9bc14884f6210f28342ced592a633801a8b',
  '0xf506828b166de88ca2edb2a98d960abba0d2402a',
  '0xb944d13b2f4047fc7bd3f7013bcf01b115fb260d',
  '0x077d52b047735976dfda76fef74d4d988ac25196',
  '0x80324ec8d64425b37f8603a97097da7d493dbc79',
  '0x09cabec1ead1c0ba254b09efb3ee13841712be14',
  '0xa539baaa3aca455c986bb1e25301cef936ce1b65',
  '0x3fb2f18065926ddb33e7571475c509541d15da0e',
  '0x48b04d2a05b6b604d8d5223fd1984f191ded51af',
  '0xffcf45b540e6c9f094ae656d2e34ad11cdfdb187',
  '0xb6cfbf322db47d39331e306005dc7e5e6549942b',
  '0x8de0d002dc83478f479dc31f76cb0a8aa7ccea17',
  '0x4e395304655f0796bc3bc63709db72173b9ddf98',
  '0xae76c84c9262cdb9abc0c2c8888e62db8e22a0bf',
  '0x43892992b0b102459e895b88601bb2c76736942c',
  '0xf79cb3bea83bd502737586a6e8b133c378fd1ff2',
  '0xd91ff16ef92568fc27f466c3c5613e43313ab1dc',
  '0x2bf5a5ba29e60682fc56b2fcf9ce07bef4f6196f',
  '0xe8e45431b93215566ba923a7e611b7342ea954df',
];
const zrxAdapterTokens = [
  zrxAddress,
];

let protocolNames = [];
let metadata = [];
let adapters = [[], [], [], [], [], [], [], [], [], [], [], [], [], []];
let tokens = [[], [], [], [], [], [], [], [], [], [], [], [], [], []];
let tokenAdapters = [];

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(AaveAssetAdapter, { from: accounts[0] })
    .then(() => {
      adapters[0].push(AaveAssetAdapter.address);
      tokens[0].push(aaveAssetAdapterTokens);
    });
  await deployer.deploy(AaveDebtAdapter, { from: accounts[0] })
    .then(() => {
      adapters[0].push(AaveDebtAdapter.address);
      tokens[0].push(aaveDebtAdapterTokens);
    });
  protocolNames.push('Aave');
  metadata.push([
    'Aave',
    'Decentralized lending & borrowing protocol',
    'aave.com',
    'protocol-icons.s3.amazonaws.com/aave.png',
    '0',
  ]);
  await deployer.deploy(CompoundAssetAdapter, { from: accounts[0] })
    .then(() => {
      adapters[1].push(CompoundAssetAdapter.address);
      tokens[1].push(compoundAssetAdapterTokens);
    });
  await deployer.deploy(CompoundDebtAdapter, { from: accounts[0] })
    .then(() => {
      adapters[1].push(CompoundDebtAdapter.address);
      tokens[1].push(compoundDebtAdapterTokens);
    });
  protocolNames.push('Compound');
  metadata.push([
    'Compound',
    'Decentralized lending & borrowing protocol',
    'compound.finance',
    'protocol-icons.s3.amazonaws.com/compound.png',
    '0',
  ]);
  await deployer.deploy(CurveAdapter, { from: accounts[0] })
    .then(() => {
      adapters[2].push(CurveAdapter.address);
      tokens[2].push(curveAdapterTokens);
    });
  protocolNames.push('Curve');
  metadata.push([
    'Curve',
    'Exchange liquidity pool for stablecoin trading',
    'curve.fi',
    'protocol-icons.s3.amazonaws.com/curve.fi.png',
    '0',
  ]);
  await deployer.deploy(DyDxAssetAdapter, { from: accounts[0] })
    .then(() => {
      adapters[3].push(DyDxAssetAdapter.address);
      tokens[3].push(dydxAdapterTokens);
    });
  await deployer.deploy(DyDxDebtAdapter, { from: accounts[0] })
    .then(() => {
      adapters[3].push(DyDxDebtAdapter.address);
      tokens[3].push(dydxAdapterTokens);
    });
  protocolNames.push('dYdX');
  metadata.push([
    'dYdX',
    'Decentralized trading platform',
    'dydx.exchange',
    'protocol-icons.s3.amazonaws.com/dYdX.png',
    '0',
  ]);
  await deployer.deploy(IdleAdapter, { from: accounts[0] })
    .then(() => {
      adapters[4].push(IdleAdapter.address);
      tokens[4].push(idleAdapterTokens);
    });
  protocolNames.push('Idle');
  metadata.push([
    'Idle',
    'Yield aggregator for lending platforms',
    'idle.finance',
    'protocol-icons.s3.amazonaws.com/idle.png',
    '0',
  ]);
  await deployer.deploy(IearnAdapter, { from: accounts[0] })
    .then(() => {
      adapters[5].push(IearnAdapter.address);
      tokens[5].push(iearn2AdapterTokens);
    });
  protocolNames.push('iearn.finance (v2)');
  metadata.push([
    'iearn.finance (v2)',
    'Yield aggregator for lending platforms',
    'iearn.finance',
    'protocol-icons.s3.amazonaws.com/iearn.png',
    '0',
  ]);
  await deployer.deploy(IearnAdapter, { from: accounts[0] })
    .then(() => {
      adapters[6].push(IearnAdapter.address);
      tokens[6].push(iearn3AdapterTokens);
    });
  protocolNames.push('iearn.finance (v3)');
  metadata.push([
    'iearn.finance (v3)',
    'Yield aggregator for lending platforms',
    'iearn.finance',
    'protocol-icons.s3.amazonaws.com/iearn.png',
    '0',
  ]);
  await deployer.deploy(ChaiAdapter, { from: accounts[0] })
    .then(() => {
      adapters[7].push(ChaiAdapter.address);
      tokens[7].push(chaiAdapterTokens);
    });
  protocolNames.push('Chai');
  metadata.push([
    'Chai',
    'A simple ERC20 wrapper over the Dai Savings Rate',
    'chai.money',
    'protocol-icons.s3.amazonaws.com/chai.png',
    '0',
  ]);
  await deployer.deploy(DSRAdapter, { from: accounts[0] })
    .then(() => {
      adapters[8].push(DSRAdapter.address);
      tokens[8].push(dsrAdapterTokens);
    });
  protocolNames.push('Dai Savings Rate');
  metadata.push([
    'Dai Savings Rate',
    'Decentralized lending protocol',
    'makerdao.com',
    'protocol-icons.s3.amazonaws.com/dai.png',
    '0',
  ]);
  await deployer.deploy(MCDAssetAdapter, { from: accounts[0] })
    .then(() => {
      adapters[9].push(MCDAssetAdapter.address);
      tokens[9].push(mcdAssetAdapterTokens);
    });
  await deployer.deploy(MCDDebtAdapter, { from: accounts[0] })
    .then(() => {
      adapters[9].push(MCDDebtAdapter.address);
      tokens[9].push(mcdDebtAdapterTokens);
    });
  protocolNames.push('Multi-Collateral Dai');
  metadata.push([
    'Multi-Collateral Dai',
    'Collateralized loans on Maker',
    'makerdao.com',
    'protocol-icons.s3.amazonaws.com/maker.png',
    '0',
  ]);
  await deployer.deploy(PoolTogetherAdapter, { from: accounts[0] })
    .then(() => {
      adapters[10].push(PoolTogetherAdapter.address);
      tokens[10].push(poolTogetherAdapterTokens);
    });
  protocolNames.push('PoolTogether');
  metadata.push([
    'PoolTogether',
    'Decentralized no-loss lottery',
    'pooltogether.com',
    'protocol-icons.s3.amazonaws.com/pooltogether.png',
    '0',
  ]);
  await deployer.deploy(SynthetixAssetAdapter, { from: accounts[0] })
    .then(() => {
      adapters[11].push(SynthetixAssetAdapter.address);
      tokens[11].push(synthetixAssetAdapterTokens);
    });
  await deployer.deploy(SynthetixDebtAdapter, { from: accounts[0] })
    .then(() => {
      adapters[11].push(SynthetixDebtAdapter.address);
      tokens[11].push(synthetixDebtAdapterTokens);
    });
  protocolNames.push('Synthetix');
  metadata.push([
    'Synthetix',
    'Synthetic assets protocol',
    'synthetix.io',
    'protocol-icons.s3.amazonaws.com/synthetix.png',
    '0',
  ]);
  await deployer.deploy(UniswapV1Adapter, { from: accounts[0] })
    .then(() => {
      adapters[12].push(UniswapV1Adapter.address);
      tokens[12].push(uniswapV1AdapterTokens);
    });
  protocolNames.push('Uniswap V1');
  metadata.push([
    'Uniswap V1',
    'Automated liquidity protocol',
    'uniswap.org',
    'protocol-icons.s3.amazonaws.com/Uniswap.png',
    '0',
  ]);
  await deployer.deploy(ZrxAdapter, { from: accounts[0] })
    .then(() => {
      adapters[13].push(ZrxAdapter.address);
      tokens[13].push(zrxAdapterTokens);
    });
  protocolNames.push('0x Staking');
  metadata.push([
    '0x Staking',
    'Liquidity rewards with ZRX',
    '0x.org/zrx/staking',
    'protocol-icons.s3.amazonaws.com/0x-staking.png',
    '0',
  ]);

  await deployer.deploy(ERC20TokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        ERC20TokenAdapter.address,
      );
    });
  await deployer.deploy(AaveTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        AaveTokenAdapter.address,
      );
    });
  await deployer.deploy(CompoundTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        CompoundTokenAdapter.address,
      );
    });
  await deployer.deploy(CurveTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        CurveTokenAdapter.address,
      );
    });
  await deployer.deploy(IdleTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        IdleTokenAdapter.address,
      );
    });
  await deployer.deploy(IearnTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        IearnTokenAdapter.address,
      );
    });
  await deployer.deploy(ChaiTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        ChaiTokenAdapter.address,
      );
    });
  await deployer.deploy(PoolTogetherTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        PoolTogetherTokenAdapter.address,
      );
    });
  await deployer.deploy(UniswapV1TokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        UniswapV1TokenAdapter.address,
      );
    });
  await AdapterRegistry.at('0x9A2FB998c6bd001B8D4f235a260640136159e496') // kovan
    .then(async (registry) => {
      await registry.contract.methods.addProtocols(
        protocolNames,
        metadata,
        adapters,
        tokens,
      )
        .send({
          from: accounts[0],
          gasLimit: '5000000',
        });
      await registry.contract.methods.addTokenAdapters(
        [
          'ERC20',
          'AToken',
          'CToken',
          'Curve pool token',
          'IdleToken',
          'YToken',
          'Chai token',
          'PoolTogether pool',
          'Uniswap V1 pool token',
        ],
        tokenAdapters,
      )
        .send({
          from: accounts[0],
          gasLimit: '5000000',
        });
    });
};
