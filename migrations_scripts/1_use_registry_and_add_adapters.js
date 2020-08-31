const AragonStakingAdapter = artifacts.require('AragonStakingAdapter');
const AaveAssetAdapter = artifacts.require('AaveAssetAdapter');
const AaveDebtAdapter = artifacts.require('AaveDebtAdapter');
const AaveUniswapAssetAdapter = artifacts.require('AaveUniswapAssetAdapter');
const AaveUniswapDebtAdapter = artifacts.require('AaveUniswapDebtAdapter');
const BalancerAdapter = artifacts.require('BalancerAdapter');
const BancorAdapter = artifacts.require('BancorAdapter');
const CompoundAssetAdapter = artifacts.require('CompoundAssetAdapter');
const CompoundDebtAdapter = artifacts.require('CompoundDebtAdapter');
const CurveAdapter = artifacts.require('CurveAdapter');
const CurveStakingAdapter = artifacts.require('CurveStakingAdapter');
const CurveVestingAdapter = artifacts.require('CurveVestingAdapter');
const DdexLendingAssetAdapter = artifacts.require('DdexLendingAssetAdapter');
const DdexMarginAssetAdapter = artifacts.require('DdexMarginAssetAdapter');
const DdexMarginDebtAdapter = artifacts.require('DdexMarginDebtAdapter');
const DdexSpotAssetAdapter = artifacts.require('DdexSpotAssetAdapter');
const DmmAssetAdapter = artifacts.require('DmmAssetAdapter');
const DyDxAssetAdapter = artifacts.require('DyDxAssetAdapter');
const DyDxDebtAdapter = artifacts.require('DyDxDebtAdapter');
const GnosisProtocolAdapter = artifacts.require('GnosisProtocolAdapter');
const IdleAdapter = artifacts.require('IdleAdapter');
const IearnAdapter = artifacts.require('IearnAdapter');
const KeeperDaoAssetAdapter = artifacts.require('KeeperDaoAssetAdapter');
const KyberAdapter = artifacts.require('KyberAdapter');
const ChaiAdapter = artifacts.require('ChaiAdapter');
const DSRAdapter = artifacts.require('DSRAdapter');
const GovernanceAdapter = artifacts.require('GovernanceAdapter');
const MCDAssetAdapter = artifacts.require('MCDAssetAdapter');
const MCDDebtAdapter = artifacts.require('MCDDebtAdapter');
const MaticStakingAdapter = artifacs.require('MaticStakingAdapter');
const MelonAssetAdapter = artifacs.require('MelonAssetAdapter');
const MstableAssetAdapter = artifacts.require('MstableAssetAdapter');
const NexusStakingAdapter = artifacts.require('NexusStakingAdapter');
const MstableStakingAdapter = artifacts.require('MstableStakingAdapter');
const ChiAdapter = artifacts.require('ChiAdapter');
const PieDAOPieAdapter = artifacts.require('PieDAOPieAdapter');
const PoolTogetherAdapter = artifacts.require('PoolTogetherAdapter');
const SushiStakingAdapter = artifacts.require('SushiStakingAdapter');
const SynthetixAssetAdapter = artifacts.require('SynthetixAssetAdapter');
const SynthetixDebtAdapter = artifacts.require('SynthetixDebtAdapter');
const TokenSetsAdapter = artifacts.require('TokenSetsAdapter');
const UniswapV1Adapter = artifacts.require('UniswapV1Adapter');
const UniswapV2Adapter = artifacts.require('UniswapV2Adapter');
const YearnStakingV1Adapter = artifacts.require('YearnStakingV1Adapter');
const YearnStakingV2Adapter = artifacts.require('YearnStakingV2Adapter');
const ZrxAdapter = artifacts.require('ZrxAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');
const AaveTokenAdapter = artifacts.require('AaveTokenAdapter');
const AaveUniswapTokenAdapter = artifacts.require('AaveUniswapTokenAdapter');
const BalancerTokenAdapter = artifacts.require('BalancerTokenAdapter');
const BancorTokenAdapter = artifacts.require('BancorTokenAdapter');
const CompoundTokenAdapter = artifacts.require('CompoundTokenAdapter');
const CurveTokenAdapter = artifacts.require('CurveTokenAdapter');
const DmmTokenAdapter = artifacts.require('DmmTokenAdapter');
const IdleTokenAdapter = artifacts.require('IdleTokenAdapter');
const IearnTokenAdapter = artifacts.require('IearnTokenAdapter');
const KeeperDaoTokenAdapter = artifacts.require('IearnTokenAdapter');
const ChaiTokenAdapter = artifacts.require('ChaiTokenAdapter');
const MelonTokenAdapter = artifacts.require('MelonTokenAdapter');
const MstableTokenAdapter = artifacts.require('MstableTokenAdapter');
const ChiTokenAdapter = artifacts.require('ChiTokenAdapter');
const PieDAOPieTokenAdapter = artifacts.require('PieDAOPieTokenAdapter');
const PoolTogetherTokenAdapter = artifacts.require('PoolTogetherTokenAdapter');
const TokenSetsTokenAdapter = artifacts.require('TokenSetsTokenAdapter');
const UniswapV1TokenAdapter = artifacts.require('UniswapV1TokenAdapter');
const UniswapV2TokenAdapter = artifacts.require('UniswapV2TokenAdapter');
const AdapterRegistry = artifacts.require('AdapterRegistry');

const antAddress = '0x960b236A07cf122663c4303350609A66A7B288C0';
const uniAntWethAddress = '0xfa19de406e8F5b9100E4dD5CaD8a503a6d686Efe';

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

const aUniUsdcEthAddress = '0x1D0e53A0e524E3CC92C1f0f33Ae268FfF8D7E7a5';
const aUniLinkEthAddress = '0x9548DB8b1cA9b6c757485e7861918b640390169c';
const aUniDaiEthAddress = '0xBbBb7F2aC04484F7F04A2C2C16f20479791BbB44';
const aUniLendEthAddress = '0xc88ebbf7c523f38ef3eb8a151273c0f0da421e63';
const aUniMkrEthAddress = '0x8c69f7A4C9B38F1b48005D216c398Efb2F1Ce3e4';
const aUniSethEthAddress = '0x84BBcaB430717ff832c3904fa6515f97fc63C76F';
const auDaiAddress = '0x048930eec73c91B44b0844aEACdEBADC2F2b6efb';
const auUsdcAddress = '0xe02b2Ad63eFF3Ac1D5827cBd7AB9DD3DaC4f4AD0';
const auUsdtAddress = '0xb977ee318010A5252774171494a1bCB98E7fab65';
const auEthAddress = '0x6179078872605396Ee62960917128F9477a5DdbB';

const cDAIAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
const cBATAddress = '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E';
const cETHAddress = '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5';
const cREPAddress = '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1';
const cSAIAddress = '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC';
const cZRXAddress = '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407';
const cUSDCAddress = '0x39AA39c021dfbaE8faC545936693aC917d5E7563';
const cWBTCAddress = '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4';
const cUSDTAddress = '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9';

const mDAIAddress = '0x06301057D77D54B6e14c7FafFB11Ffc7Cab4eaa7';
const mETHAddress = '0xdF9307DFf0a1B57660F60f9457D32027a55ca0B2';
const mUSDCAddress = '0x3564ad35b9E95340E5Ace2D6251dbfC76098669B';

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

const idleBestYieldDAI = '0x3fE7940616e5Bc47b0775a0dccf6237893353bB4';
const idleBestYieldUSDC = '0x5274891bEC421B39D23760c04A6755eCB444797C';
const idleBestYieldUSDT = '0xF34842d05A1c888Ca02769A633DF37177415C2f8';
const idleBestYieldSUSD = '0xf52cdcd458bf455aed77751743180ec4a595fd3f';
const idleBestYieldTUSD = '0xF34842d05A1c888Ca02769A633DF37177415C2f8';
const idleBestYieldWBTC = '0x8C81121B15197fA0eEaEE1DC75533419DcfD3151';

const idleRiskAdjustedDAI = '0xa14eA0E11121e6E951E87c66AFe460A00BCD6A16';
const idleRiskAdjustedUSDC = '0x3391bc034f2935ef0e1e41619445f998b2680d35';
const idleRiskAdjustedUSDT = '0x28fAc5334C9f7262b3A3Fe707e250E01053e07b5';

const kETHAddress = '0xC4c43C78fb32F2c7F8417AF5af3B85f090F1d327';
const kWETHAddress = '0xac19815455C2c438af8A8b4623F65f091364be10';

const crvAddress = '0xD533a949740bb3306d119CC777fa900bA034cd52';

const cCrvAddress = '0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2';
const tCrvAddress = '0x9fC689CCaDa600B6DF723D9E47D84d76664a1F23';
const yCrvAddress = '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8';
const bCrvAddress = '0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B';
const sCrvAddress = '0xC25a3A3b969415c80451098fa907EC722572917F';
const pCrvAddress = '0xD905e2eaeBe188fc92179b6350807D8bd91Db0D8';
const tbtcCrvAddress = '0x1f2a662FB513441f06b8dB91ebD9a1466462b275';
const renCrvAddress = '0x49849C98ae39Fff122806C06791Fa73784FB3675';
const sbtcCrvAddress = '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3';

const sethUniAddress = '0xe9Cf7887b93150D4F2Da7dFc6D502B216438F244';
const curveSnxAddress = '0xC25a3A3b969415c80451098fa907EC722572917F';
const iETHAddress = '0xA9859874e1743A32409f75bB11549892138BBA1E';

const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

const saiPoolAddress = '0xb7896fce748396EcFC240F5a0d3Cc92ca42D7d84';
const daiPoolAddress = '0x29fe7D60DdF151E5b52e5FAB4f1325da6b2bD958';
const usdcPoolAddress = '0x0034Ea9808E620A0EF79261c51AF20614B742B24';

const yfiAddress = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e';
const balancerDai98Yfi2Address = '0x60626db611a9957C1ae4Ac5b7eDE69e24A3B76c5';
const balancerYfi2yCrv98Address = '0x95C4B6C7CfF608c0CA048df8b81a484aA377172B';

const chaiAddress = '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215';

const mUsdAddress = '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5';

const chiAddress = '0x0000000000004946c0e9F43F4Dee607b0eF1fA1c';

const BTCPPAddress = '0x0327112423F3A68efdF1fcF402F6c5CB9f7C33fd';
const USDPPAddress = '0x9A48BD0EC040ea4f1D3147C025cd4076A2e71e3e';

const mtaAddress = '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2';
const balAddress = '0xba100000625a3754423978a60c9317c58a424e3D';
const balancerMusd20Mta80Address = '0x003a70265a3662342010823bEA15Dc84C6f7eD54';
const balancerUsdc50Musd50Address = '0x72Cd8f4504941Bf8c5a21d1Fd83A96499FD71d2C';
const balancerMusd95Mta5Address = '0xa5DA8Cc7167070B62FdCB332EF097A55A68d8824';
const balancerWeth50Musd50Address = '0xe036CCE08cf4E23D33bC6B18e53Caf532AFa8513';
const uniswapMtaWethAddress = '0x0d0d65E7A7dB277d3E0F5E1676325E75f3340455';

const amplAddress = '0xD46bA6D942050d489DBd938a2C909A5d5039A161';
const uniAmplWethAddress = '0xc5be99A02C6857f9Eac67BbCE58DF5572498F40c';

const maticAddress = '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0';

const nxmAddress = '0xd7c49CEE7E9188cCa6AD8FF264C1DA2e69D4Cf3B';

const sushiAddress = '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2';
const uniSushiWethAddress = '0xCE84867c3c02B05dc570d0135103d3fB9CC19433';
const uniUsdtWethAddress = '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852';
const uniUsdcWethAddress = '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc';
const uniDaiWethAddress = '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11';
const uniSusdWethAddress = '0xf80758aB42C3B07dA84053Fd88804bCB6BAA4b5c';
const uniUmaWethAddress = '0x88d97d199b9ed37c29d846d00d443de980832a22';
const uniBandWethAddress = '0xf421c3f2e695c2d4c0765379ccace8ade4a480d9';
const uniLinkWethAddress = '0xa2107FA5B38d9bbd2C461D6EDf11B11A50F6b974';
const uniAmplWethAddress = '0xc5be99A02C6857f9Eac67BbCE58DF5572498F40c';
const uniCompWethAddress = '0xCFfDdeD873554F362Ac02f8Fb1f02E5ada10516f';
const uniLendWethAddress = '0xaB3F9bF1D81ddb224a2014e98B238638824bCf20';
const uniSnxWethAddress = '0x43AE24960e5534731Fc831386c07755A2dc33D47';
const uniYfiWethAddress = '0x2fDbAdf3C4D5A8666Bc06645B8358ab803996E28';

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
const aaveUniswapAssetAdapterTokens = [
  aUniUsdcEthAddress,
  aUniLinkEthAddress,
  aUniDaiEthAddress,
  aUniLendEthAddress,
  aUniMkrEthAddress,
  aUniSethEthAddress,
  auDaiAddress,
  auUsdcAddress,
  auUsdtAddress,
  auEthAddress,
];
const aaveUniswapDebtAdapterTokens = [
  daiAddress,
  usdcAddress,
  usdtAddress,
  ethAddress,
];
const ampleforthAdapterTokens = [
  amplAddress,
  uniAmplWethAddress,
];
const aragonStakingAdapterTokens = [
  antAddress,
  uniAntWethAddress,
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
  cUSDTAddress,
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
  usdtAddress,
];
const curveAdapterTokens = [
  cCrvAddress,
  tCrvAddress,
  yCrvAddress,
  bCrvAddress,
  sCrvAddress,
  pCrvAddress,
  tbtcCrvAddress,
  renCrvAddress,
  sbtcCrvAddress,
];
const curveStakingAdapterTokens = [
  crvAddress,
  cCrvAddress,
  yCrvAddress,
  bCrvAddress,
  sCrvAddress,
  pCrvAddress,
  renCrvAddress,
  sbtcCrvAddress,
];
const CurveVestingAdapterTokens = [
  crvAddress,
];
const ddexAdapterTokens = [
  busdAddress,
  daiAddress,
  ethAddress,
  usdcAddress,
  usdtAddress,
  wbtcAddress,
];
const dmmAssetAdapterTokens = [
  mDAIAddress,
  mETHAddress,
  mUSDCAddress,
];
const dydxAdapterTokens = [
  wethAddress,
  saiAddress,
  usdcAddress,
  daiAddress,
];
const gnosisProtocolAdapterTokens = [
];
const idleBestYieldAdapterTokens = [
  idleBestYieldDAI,
  idleBestYieldUSDC,
  idleBestYieldUSDT,
  idleBestYieldSUSD,
  idleBestYieldTUSD,
  idleBestYieldWBTC,
];
const idleRiskAdjustedAdapterTokens = [
  idleRiskAdjustedDAI,
  idleRiskAdjustedUSDC,
  idleRiskAdjustedUSDT,
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
const keeperDaoAdapterTokens = [
  kETHAddress,
  kWETHAddress,
];
const kyberAdapterTokens = [
  kncAddress,
  ethAddress,
];
const dsrAdapterTokens = [
  daiAddress,
];
const governanceAdapterTokens = [
  mkrAddress,
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
const maticStakingAdapterTokens = [
  maticAddress,
];
const mstableAssetAdapterTokens = [
  mUsdAddress,
];
const nexusStakingAdapterTokens = [
  nxmAddress,
];
const mstableStakingAdapterTokens = [
  mtaAddress,
  balAddress,
  balancerMusd20Mta80Address,
  balancerUsdc50Musd50Address,
  balancerMusd95Mta5Address,
  balancerWeth50Musd50Address,
  uniswapMtaWethAddress,
];
const chiAdapterTokens = [
  chiAddress,
];
const pieDAOPieAdapterTokens = [
  BTCPPAddress,
  USDPPAddress,
];
const poolTogetherAdapterTokens = [
  saiPoolAddress,
  daiPoolAddress,
  usdcPoolAddress,
];
const sushiStakingAdapterTokens = [
  uniSushiWethAddress,
  uniUsdtWethAddress,
  uniUsdcWethAddress,
  uniDaiWethAddress,
  uniSusdWethAddress,
  uniUmaWethAddress,
  uniBandWethAddress,
  uniLinkWethAddress,
  uniAmplWethAddress,
  uniCompWethAddress,
  uniLendWethAddress,
  uniSnxWethAddress,
  uniYfiWethAddress,
];
const synthetixAssetAdapterTokens = [
  snxAddress,
  sethUniAddress,
  curveSnxAddress,
  iETHAddress,
];
const synthetixDebtAdapterTokens = [
  susdAddress,
];
const yearnStakingV1AdapterTokens = [
  yfiAddress,
  yCrvAddress,
  balancerDai98Yfi2Address,
  balancerYfi2yCrv98Address,
];
const yearnStakingV2AdapterTokens = [
  yfiAddress,
  yCrvAddress,
];
const zrxAdapterTokens = [
  zrxAddress,
];

let protocolNames = [];
let metadata = [];
let adapters = [];
let tokens = [];
let tokenAdapters = [];

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(AaveAssetAdapter, { from: accounts[0] });
  await deployer.deploy(AaveDebtAdapter, { from: accounts[0] });
  adapters.push([AaveAssetAdapter.address, AaveDebtAdapter.address]);
  tokens.push([aaveAssetAdapterTokens, aaveDebtAdapterTokens]);
  protocolNames.push('Aave');
  metadata.push([
    'Aave',
    'Decentralized lending & borrowing protocol',
    'aave.com',
    'protocol-icons.s3.amazonaws.com/aave.png',
    '0',
  ]);

  await deployer.deploy(AaveUniswapAssetAdapter, { from: accounts[0] });
  await deployer.deploy(AaveUniswapDebtAdapter, { from: accounts[0] });
  adapters.push([AaveUniswapAssetAdapter.address, AaveUniswapDebtAdapter.address]);
  tokens.push([aaveUniswapAssetAdapterTokens, aaveUniswapDebtAdapterTokens]);
  protocolNames.push('Aave • Uniswap Market');
  metadata.push([
    'Aave • Uniswap Market',
    'Decentralized lending & borrowing protocol',
    'aave.com',
    'protocol-icons.s3.amazonaws.com/aave.png',
    '0',
  ]);

  await deployer.deploy(AmpleforthAdapter, { from: accounts[0] });
  adapters.push([AmpleforthAdapter.address]);
  tokens.push([ampleforthAdapterTokens]);
  protocolNames.push('Ampleforth');
  metadata.push([
    'Ampleforth',
    'An adaptive money built on sound economics',
    'ampleforth.org',
    'protocol-icons.s3.amazonaws.com/ampl.png',
    '0',
  ]);

  await deployer.deploy(AragonStakingAdapter, { from: accounts[0] });
  adapters.push([AragonStakingAdapter.address]);
  tokens.push([aragonStakingAdapterTokens]);
  protocolNames.push('Aragon');
  metadata.push([
    'Aragon',
    'ANT liquidity rewards',
    'liquidity.aragon.org',
    'protocol-icons.s3.amazonaws.com/aragon.png',
    '0',
  ]);

  await deployer.deploy(BalancerAdapter, { from: accounts[0] });
  adapters.push([BalancerAdapter.address]);
  tokens.push([[]]);
  protocolNames.push('Balancer');
  metadata.push([
    'Balancer',
    'Non-custodial portfolio manager, liquidity provider, and price sensor',
    'pools.balancer.exchange',
    'protocol-icons.s3.amazonaws.com/balancer.png',
    '0',
  ]);

  await deployer.deploy(BancorAdapter, { from: accounts[0] });
  adapters.push([BancorAdapter.address]);
  tokens.push([[]]);
  protocolNames.push('Bancor');
  metadata.push([
    'Bancor',
    'Automated liquidity protocol',
    'bancor.network',
    'protocol-icons.s3.amazonaws.com/bancor.png',
    '0',
  ]);

  await deployer.deploy(CompoundAssetAdapter, { from: accounts[0] });
  await deployer.deploy(CompoundDebtAdapter, { from: accounts[0] });
  adapters.push([CompoundAssetAdapter.address, CompoundDebtAdapter.address]);
  tokens.push([compoundAssetAdapterTokens, compoundDebtAdapterTokens]);
  protocolNames.push('Compound');
  metadata.push([
    'Compound',
    'Decentralized lending & borrowing protocol',
    'compound.finance',
    'protocol-icons.s3.amazonaws.com/compound.png',
    '0',
  ]);

  await deployer.deploy(CurveAdapter, { from: accounts[0] });
  await deployer.deploy(CurveStakingAdapter, { from: accounts[0] });
  await deployer.deploy(CurveVestingAdapter, { from: accounts[0] });
  adapters.push([CurveAdapter.address, CurveStakingAdapter.address, CurveVestingAdapter.address]);
  tokens.push([curveAdapterTokens, curveStakingAdapterTokens, CurveVestingAdapterTokens]);
  protocolNames.push('Curve');
  metadata.push([
    'Curve',
    'Exchange liquidity pool for stablecoin trading',
    'curve.fi',
    'protocol-icons.s3.amazonaws.com/curve.fi.png',
    '0',
  ]);

  await deployer.deploy(DdexLendingAssetAdapter, { from: accounts[0] });
  adapters.push([DdexLendingAssetAdapter.address]);
  tokens.push([ddexAdapterTokens]);
  protocolNames.push('DDEX • Lending');
  metadata.push([
    'DDEX • Lending',
    'Decentralized margin trading',
    'ddex.io',
    'protocol-icons.s3.amazonaws.com/ddex.png',
    '0',
  ]);

  await deployer.deploy(DdexMarginAssetAdapter, { from: accounts[0] });
  await deployer.deploy(DdexMarginDebtAdapter, { from: accounts[0] });
  adapters.push([DdexMarginAssetAdapter.address, DdexMarginDebtAdapter.address]);
  tokens.push([ddexAdapterTokens, ddexAdapterTokens]);
  protocolNames.push('DDEX • Margin');
  metadata.push([
    'DDEX • Margin',
    'Decentralized margin trading',
    'ddex.io',
    'protocol-icons.s3.amazonaws.com/ddex.png',
    '0',
  ]);

  await deployer.deploy(DdexSpotAssetAdapter, { from: accounts[0] });
  adapters.push([DdexSpotAssetAdapter.address]);
  tokens.push([ddexAdapterTokens]);
  protocolNames.push('DDEX • Spot');
  metadata.push([
    'DDEX • Spot',
    'Decentralized margin trading',
    'ddex.io',
    'protocol-icons.s3.amazonaws.com/ddex.png',
    '0',
  ]);

  await deployer.deploy(DmmAssetAdapter, { from: accounts[0] });
  adapters.push([DmmAssetAdapter.address]);
  tokens.push([dmmAssetAdapterTokens]);
  protocolNames.push('DeFi Money Market');
  metadata.push([
    'DeFi Money Market',
    'Earn interest on crypto through revenue-producing real world assets',
    'defimoneymarket.com',
    'protocol-icons.s3.amazonaws.com/DMM.png',
    '0',
  ]);

  await deployer.deploy(DyDxAssetAdapter, { from: accounts[0] });
  await deployer.deploy(DyDxDebtAdapter, { from: accounts[0] });
  adapters.push([DyDxAssetAdapter.address, DyDxDebtAdapter.address]);
  tokens.push([dydxAdapterTokens, dydxAdapterTokens]);
  protocolNames.push('dYdX');
  metadata.push([
    'dYdX',
    'Decentralized trading platform',
    'dydx.exchange',
    'protocol-icons.s3.amazonaws.com/dYdX.png',
    '0',
  ]);

  await deployer.deploy(GnosisProtocolAdapter, { from: accounts[0] });
  adapters.push([GnosisProtocolAdapter.address]);
  tokens.push([gnosisProtocolAdapterTokens]);
  protocolNames.push('Gnosis Protocol');
  metadata.push([
    'Gnosis Protocol',
    'A DEX that enables ring trades to maximize liquidity',
    'gnosis.io',
    'protocol-icons.s3.amazonaws.com/gnosis.png',
    '0',
  ]);

  await deployer.deploy(IdleAdapter, { from: accounts[0] });
  adapters.push([IdleAdapter.address]);
  tokens.push([idleBestYieldAdapterTokens]);
  protocolNames.push('Idle • Best-Yield');
  metadata.push([
    'Idle • Best-Yield',
    'Maximize your returns across DeFi lending protocols',
    'idle.finance',
    'protocol-icons.s3.amazonaws.com/idle.png',
    '0',
  ]);

  await deployer.deploy(IdleAdapter, { from: accounts[0] });
  adapters.push([IdleAdapter.address]);
  tokens.push([idleRiskAdjustedAdapterTokens]);
  protocolNames.push('Idle • Risk-Adjusted');
  metadata.push([
    'Idle • Risk-Adjusted',
    'Optimize your risk exposure across DeFi lending protocols',
    'idle.finance',
    'protocol-icons.s3.amazonaws.com/idle.png',
    '0',
  ]);

  await deployer.deploy(IearnAdapter, { from: accounts[0] });
  await deployer.deploy(YearnStakingV1Adapter, { from: accounts[0] });
  await deployer.deploy(YearnStakingV2Adapter, { from: accounts[0] });
  adapters.push(
    [IearnAdapter.address, YearnStakingV1Adapter.address, YearnStakingV2Adapter.address],
  );
  tokens.push([iearn2AdapterTokens, yearnStakingV1AdapterTokens, yearnStakingV2AdapterTokens]);
  protocolNames.push('iearn.finance (v2)');
  metadata.push([
    'iearn.finance (v2)',
    'Yield aggregator for lending platforms',
    'iearn.finance',
    'protocol-icons.s3.amazonaws.com/iearn.png',
    '0',
  ]);

  await deployer.deploy(IearnAdapter, { from: accounts[0] });
  adapters.push([IearnAdapter.address]);
  tokens.push([iearn3AdapterTokens]);
  protocolNames.push('iearn.finance (v3)');
  metadata.push([
    'iearn.finance (v3)',
    'Yield aggregator for lending platforms',
    'iearn.finance',
    'protocol-icons.s3.amazonaws.com/iearn.png',
    '0',
  ]);

  await deployer.deploy(KeeperDaoAssetAdapter, { from: accounts[0] });
  adapters.push([KeeperDaoAssetAdapter.address]);
  tokens.push([keeperDaoAdapterTokens]);
  protocolNames.push('KeeperDAO');
  metadata.push([
    'KeeperDAO',
    'An on-chain liquidity underwriter for DeFi',
    'keeperdao.com',
    'protocol-icons.s3.amazonaws.com/keeperDAO.png',
    '0',
  ]);

  await deployer.deploy(KyberAdapter, { from: accounts[0] });
  adapters.push([KyberAdapter.address]);
  tokens.push([kyberAdapterTokens]);
  protocolNames.push('KyberDAO');
  metadata.push([
    'KyberDAO',
    'Platform that allows KNC token holders to participate in governance',
    'kyber.network',
    'protocol-icons.s3.amazonaws.com/kyber.png',
    '0',
  ]);

  await deployer.deploy(ChaiAdapter, { from: accounts[0] });
  adapters.push([ChaiAdapter.address]);
  tokens.push([chaiAdapterTokens]);
  protocolNames.push('Chai');
  metadata.push([
    'Chai',
    'A simple ERC20 wrapper over the Dai Savings Protocol',
    'chai.money',
    'protocol-icons.s3.amazonaws.com/chai.png',
    '0',
  ]);

  await deployer.deploy(DSRAdapter, { from: accounts[0] });
  adapters.push([DSRAdapter.address]);
  tokens.push([dsrAdapterTokens]);
  protocolNames.push('Dai Savings Protocol');
  metadata.push([
    'Dai Savings Protocol',
    'Decentralized lending protocol',
    'makerdao.com',
    'protocol-icons.s3.amazonaws.com/dai.png',
    '0',
  ]);

  await deployer.deploy(GovernanceAdapter, { from: accounts[0] });
  adapters.push([GovernanceAdapter.address]);
  tokens.push([governanceAdapterTokens]);
  protocolNames.push('Maker Governance');
  metadata.push([
    'Maker Governance',
    'MKR tokens locked on the MakerDAO governance contracts',
    'vote.makerdao.com',
    'protocol-icons.s3.amazonaws.com/maker.png',
    '0',
  ]);

  await deployer.deploy(MCDAssetAdapter, { from: accounts[0] });
  await deployer.deploy(MCDDebtAdapter, { from: accounts[0] });
  adapters.push([MCDAssetAdapter.address, MCDDebtAdapter.address]);
  tokens.push([mcdAssetAdapterTokens, mcdDebtAdapterTokens]);
  protocolNames.push('Multi-Collateral Dai');
  metadata.push([
    'Multi-Collateral Dai',
    'Collateralized loans on Maker',
    'makerdao.com',
    'protocol-icons.s3.amazonaws.com/maker.png',
    '0',
  ]);

  await deployer.deploy(MelonAssetAdapter, { from: accounts[0] });
  adapters.push([MelonAssetAdapter.address]);
  tokens.push([]);
  protocolNames.push('Melon');
  metadata.push([
    'Melon',
    'A protocol for decentralized on-chain asset management',
    'melonport.com',
    'protocol-icons.s3.amazonaws.com/melon.png',
    '0',
  ]);

  await deployer.deploy(MaticStakingAdapter, { from: accounts[0] });
  adapters.push([MaticStakingAdapter.address]);
  tokens.push([maticStakingAdapterTokens]);
  protocolNames.push('Matic');
  metadata.push([
    'Matic',
    'A scaling solution for public blockchains',
    'matic.network',
    'protocol-icons.s3.amazonaws.com/matic.png',
    '0',
  ]);

  await deployer.deploy(MstableAssetAdapter, { from: accounts[0] });
  await deployer.deploy(MstableStakingAdapter, { from: accounts[0] });
  adapters.push([MstableAssetAdapter.address, MstableStakingAdapter.address]);
  tokens.push([mstableAssetAdapterTokens, mstableStakingAdapterTokens]);
  protocolNames.push('mStable');
  metadata.push([
    'mStable',
    'mStable unifies stablecoins, lending and swapping into one standard',
    'mstable.org',
    'protocol-icons.s3.amazonaws.com/mstable.png',
    '0',
  ]);

  await deployer.deploy(NexusStakingAdapter, { from: accounts[0] });
  adapters.push([NexusStakingAdapter.address]);
  tokens.push([nexusStakingAdapterTokens]);
  protocolNames.push('Nexus Mutual');
  metadata.push([
    'Nexus Mutual',
    'A people-powered alternative to insurance',
    'nexusmutual.io',
    'protocol-icons.s3.amazonaws.com/nexusmutual.png',
    '0',
  ]);

  await deployer.deploy(ChiAdapter, { from: accounts[0] });
  adapters.push([ChiAdapter.address]);
  tokens.push([chiAdapterTokens]);
  protocolNames.push('Chi Gastoken by 1inch');
  metadata.push([
    'Chi Gastoken by 1inch',
    'Next-generation Gastoken',
    '1inch.exchange',
    'protocol-icons.s3.amazonaws.com/chi_token.png',
    '0',
  ]);

  await deployer.deploy(PieDAOPieAdapter, { from: accounts[0] });
  adapters.push([PieDAOPieAdapter.address]);
  tokens.push([pieDAOPieAdapterTokens]);
  protocolNames.push('PieDAO');
  metadata.push([
    'PieDAO',
    'The Asset Allocation DAO',
    'piedao.org',
    'protocol-icons.s3.us-east-1.amazonaws.com/piedao.png',
    '0',
  ]);

  await deployer.deploy(PoolTogetherAdapter, { from: accounts[0] });
  adapters.push([PoolTogetherAdapter.address]);
  tokens.push([poolTogetherAdapterTokens]);
  protocolNames.push('PoolTogether');
  metadata.push([
    'PoolTogether',
    'Decentralized no-loss lottery',
    'pooltogether.com',
    'protocol-icons.s3.amazonaws.com/pooltogether.png',
    '0',
  ]);

  await deployer.deploy(SushiStakingAdapter, { from: accounts[0] });
  adapters.push([SushiStakingAdapter.address]);
  tokens.push([[sushiStakingAdapterTokens]]);
  protocolNames.push('SushiSwap');
  metadata.push([
    'SushiSwap',
    'Stake Uniswap LP tokens to claim your very own yummy SUSHI!',
    'sushiswap.org',
    'protocol-icons.s3.amazonaws.com/sushi.png',
    '0',
  ]);

  await deployer.deploy(SynthetixAssetAdapter, { from: accounts[0] });
  await deployer.deploy(SynthetixDebtAdapter, { from: accounts[0] });
  adapters.push([SynthetixAssetAdapter.address, SynthetixDebtAdapter.address]);
  tokens.push([synthetixAssetAdapterTokens, synthetixDebtAdapterTokens]);
  protocolNames.push('Synthetix');
  metadata.push([
    'Synthetix',
    'Synthetic assets protocol',
    'synthetix.io',
    'protocol-icons.s3.amazonaws.com/synthetix.png',
    '0',
  ]);

  await deployer.deploy(TokenSetsAdapter, { from: accounts[0] });
  adapters.push([TokenSetsAdapter.address]);
  tokens.push([[]]);
  protocolNames.push('TokenSets');
  metadata.push([
    'TokenSets',
    'Automated asset management strategies',
    'tokensets.com',
    'protocol-icons.s3.amazonaws.com/SET.png',
    '0',
  ]);

  await deployer.deploy(UniswapV1Adapter, { from: accounts[0] });
  adapters.push([UniswapV1Adapter.address]);
  tokens.push([[]]);
  protocolNames.push('Uniswap V1');
  metadata.push([
    'Uniswap V1',
    'Automated liquidity protocol',
    'uniswap.org',
    'protocol-icons.s3.amazonaws.com/Uniswap.png',
    '0',
  ]);

  await deployer.deploy(UniswapV2Adapter, { from: accounts[0] });
  adapters.push([UniswapV2Adapter.address]);
  tokens.push([[]]);
  protocolNames.push('Uniswap V2');
  metadata.push([
    'Uniswap V2',
    'Automated liquidity protocol',
    'uniswap.org',
    'protocol-icons.s3.amazonaws.com/Uniswap.png',
    '0',
  ]);

  await deployer.deploy(ZrxAdapter, { from: accounts[0] });
  adapters.push([ZrxAdapter.address]);
  tokens.push([zrxAdapterTokens]);
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
  await deployer.deploy(AaveUniswapTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        AaveUniswapTokenAdapter.address,
      );
    });
  await deployer.deploy(BalancerTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        BalancerTokenAdapter.address,
      );
    });
  await deployer.deploy(BancorTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        BancorTokenAdapter.address,
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
  await deployer.deploy(DmmTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        DmmTokenAdapter.address,
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
  await deployer.deploy(KeeperDaoTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        KeeperDaoTokenAdapter.address,
      );
    });
  await deployer.deploy(ChaiTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        ChaiTokenAdapter.address,
      );
    });
  await deployer.deploy(MelonTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        MelonTokenAdapter.address,
      );
    });
  await deployer.deploy(MstableTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        MstableTokenAdapter.address,
      );
    });
  await deployer.deploy(ChiTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        ChiTokenAdapter.address,
      );
    });
  await deployer.deploy(PieDAOPieTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        PieDAOPieTokenAdapter.address,
      );
    });
  await deployer.deploy(PoolTogetherTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        PoolTogetherTokenAdapter.address,
      );
    });
  await deployer.deploy(TokenSetsTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        TokenSetsTokenAdapter.address,
      );
    });
  await deployer.deploy(UniswapV1TokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        UniswapV1TokenAdapter.address,
      );
    });
  await deployer.deploy(UniswapV2TokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        UniswapV2TokenAdapter.address,
      );
    });
  await AdapterRegistry.at('0x06FE76B2f432fdfEcAEf1a7d4f6C3d41B5861672')
    .then(async (registry) => {
      await registry.contract.methods.addProtocols(
        protocolNames,
        metadata,
        adapters,
        tokens,
      )
        .send({
          from: accounts[0],
          gas: '5000000',
        });
      await registry.contract.methods.addTokenAdapters(
        [
          'ERC20',
          'AToken',
          'AToken Uniswap Market',
          'Balancer pool token',
          'SmartToken',
          'CToken',
          'Curve pool token',
          'MToken',
          'IdleToken',
          'YToken',
          'KToken',
          'Chai token',
          'MelonToken',
          'Masset',
          'Chi token',
          'PieDAO Pie Token',
          'PoolTogether pool',
          'SetToken',
          'Uniswap V1 pool token',
          'Uniswap V2 pool token',
        ],
        tokenAdapters,
      )
        .send({
          from: accounts[0],
          gas: '5000000',
        });
    });
};
