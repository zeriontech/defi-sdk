const AragonStakingAdapter = artifacts.require('AragonStakingAdapter');
const AaveAssetAdapter = artifacts.require('AaveAssetAdapter');
const BzxAssetAdapter = artifacts.require('BzxAssetAdapter');
const BzxDebtAdapter = artifacts.require('BzxDebtAdapter');
const AaveDebtAdapter = artifacts.require('AaveDebtAdapter');
const AaveUniswapAssetAdapter = artifacts.require('AaveUniswapAssetAdapter');
const AaveUniswapDebtAdapter = artifacts.require('AaveUniswapDebtAdapter');
const AaveStakingAdapter = artifacts.require('AaveStakingAdapter');
const BalancerAdapter = artifacts.require('BalancerAdapter');
const BancorAdapter = artifacts.require('BancorAdapter');
const CompoundAssetAdapter = artifacts.require('CompoundAssetAdapter');
const CompoundDebtAdapter = artifacts.require('CompoundDebtAdapter');
const CreamAssetAdapter = artifacts.require('CreamAssetAdapter');
const CreamDebtAdapter = artifacts.require('CreamDebtAdapter');
const CreamStakingAdapter = artifacts.require('CreamStakingAdapter');
const CurveAdapter = artifacts.require('CurveAdapter');
const CurveStakingAdapter = artifacts.require('CurveStakingAdapter');
const CurveVestingAdapter = artifacts.require('CurveVestingAdapter');
const DdexLendingAssetAdapter = artifacts.require('DdexLendingAssetAdapter');
const DdexMarginAssetAdapter = artifacts.require('DdexMarginAssetAdapter');
const DdexMarginDebtAdapter = artifacts.require('DdexMarginDebtAdapter');
const DdexSpotAssetAdapter = artifacts.require('DdexSpotAssetAdapter');
const DmmAssetAdapter = artifacts.require('DmmAssetAdapter');
const DodoAdapter = artifacts.require('DodoAdapter');
const DodoStakingAdapter = artifacts.require('DodoStakingAdapter');
const DyDxAssetAdapter = artifacts.require('DyDxAssetAdapter');
const DyDxDebtAdapter = artifacts.require('DyDxDebtAdapter');
const GnosisProtocolAdapter = artifacts.require('GnosisProtocolAdapter');
const HarvestStakingAdapter = artifacts.require('HarvestStakingAdapter');
const HarvestStakingV2Adapter = artifacts.require('HarvestStakingV2Adapter');
const IdleAdapter = artifacts.require('IdleAdapter');
const IearnAdapter = artifacts.require('IearnAdapter');
const KeeperDaoAssetAdapter = artifacts.require('KeeperDaoAssetAdapter');
const KimchiStakingAdapter = artifacts.require('KimchiStakingAdapter');
const KyberAdapter = artifacts.require('KyberAdapter');
const LinkswapAdapter = artifacs.require('LinkswapAdapter');
const LinkswapStakingAdapter = artifacs.require('LinkswapStakingAdapter');
const LivepeerStakingAdapter = artifacts.require('LivepeerStakingAdapter');
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
const PickleAssetAdapter = artifacts.require('PickleAssetAdapter');
const PickleStakingV1Adapter = artifacts.require('PickleStakingV1Adapter');
const PickleStakingV2Adapter = artifacts.require('PickleStakingV2Adapter');
const PieDAOPieAdapter = artifacts.require('PieDAOPieAdapter');
const PieDAOStakingAdapter = artifacts.require('PieDAOStakingAdapter');
const PoolTogetherAdapter = artifacts.require('PoolTogetherAdapter');
const SashimiStakingAdapter = artifacts.require('SashimiStakingAdapter');
const SushiStakingAdapter = artifacts.require('SushiStakingAdapter');
const SwerveAdapter = artifacts.require('SwerveAdapter');
const SwerveStakingAdapter = artifacts.require('SwerveStakingAdapter');
const SynthetixAssetAdapter = artifacts.require('SynthetixAssetAdapter');
const SynthetixDebtAdapter = artifacts.require('SynthetixDebtAdapter');
const TokenSetsAdapter = artifacts.require('TokenSetsAdapter');
const TokenSetsV2Adapter = artifacts.require('TokenSetsV2Adapter');
const UniswapV1Adapter = artifacts.require('UniswapV1Adapter');
const UniswapV2Adapter = artifacts.require('UniswapV2Adapter');
const UniswapV2StakingAdapter = artifacts.require('UniswapV2StakingAdapter');
const YearnStakingV1Adapter = artifacts.require('YearnStakingV1Adapter');
const YearnStakingV2Adapter = artifacts.require('YearnStakingV2Adapter');
const ZrxAdapter = artifacts.require('ZrxAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');
const AaveTokenAdapter = artifacts.require('AaveTokenAdapter');
const BzxTokenAdapter = artifacts.require('BzxTokenAdapter');
const AaveUniswapTokenAdapter = artifacts.require('AaveUniswapTokenAdapter');
const BalancerTokenAdapter = artifacts.require('BalancerTokenAdapter');
const BancorTokenAdapter = artifacts.require('BancorTokenAdapter');
const CompoundTokenAdapter = artifacts.require('CompoundTokenAdapter');
const CurveTokenAdapter = artifacts.require('CurveTokenAdapter');
const DmmTokenAdapter = artifacts.require('DmmTokenAdapter');
const DodoTokenAdapter = artifacts.require('DodoTokenAdapter');
const IdleTokenAdapter = artifacts.require('IdleTokenAdapter');
const IearnTokenAdapter = artifacts.require('IearnTokenAdapter');
const KeeperDaoTokenAdapter = artifacts.require('IearnTokenAdapter');
const LinkswapTokenAdapter = artifacs.require('LinkswapTokenAdapter');
const ChaiTokenAdapter = artifacts.require('ChaiTokenAdapter');
const MelonTokenAdapter = artifacts.require('MelonTokenAdapter');
const MstableTokenAdapter = artifacts.require('MstableTokenAdapter');
const ChiTokenAdapter = artifacts.require('ChiTokenAdapter');
const PickleTokenAdapter = artifacts.require('PickleTokenAdapter');
const PieDAOPieTokenAdapter = artifacts.require('PieDAOPieTokenAdapter');
const PoolTogetherTokenAdapter = artifacts.require('PoolTogetherTokenAdapter');
const TokenSetsTokenAdapter = artifacts.require('TokenSetsTokenAdapter');
const TokenSetsV2TokenAdapter = artifacts.require('TokenSetsV2TokenAdapter');
const TubeProtocolAdapter = artifacs.require('TubeProtocolAdapter');
const MustStakingAdapter = artifacs.require('MustStakingAdapter');
const UniswapV1TokenAdapter = artifacts.require('UniswapV1TokenAdapter');
const UniswapV2TokenAdapter = artifacts.require('UniswapV2TokenAdapter');
const AdapterRegistry = artifacts.require('AdapterRegistry');

const antAddress = '0x960b236A07cf122663c4303350609A66A7B288C0';
const uniAntWethAddress = '0xfa19de406e8F5b9100E4dD5CaD8a503a6d686Efe';

const iDaiAddress = '0x6b093998d36f2c7f0cc359441fbb24cc629d5ff0';
const iEthAddress = '0xb983e01458529665007ff7e0cddecdb74b967eb6';
const iUSDCAddress = '0x32e4c68b3a4a813b710595aeba7f6b7604ab9c15';
const iWBTCAddress = '0x2ffa85f655752fb2acb210287c60b9ef335f5b6e';
const iLENDAddress = '0xab45bf58c6482b87da85d6688c4d9640e093be98';
const iKNCAddress = '0x687642347a9282be8fd809d8309910a3f984ac5a';
const iMKRAddress = '0x9189c499727f88f8ecc7dc4eea22c828e6aac015';
const iLINKAddress = '0x463538705e7d22aa7f03ebf8ab09b067e1001b54';
const iYFIAddress = '0x7f3fe9d492a9a60aebb06d82cba23c6f32cad10b';
const iUSDTAddress = '0x7e9997a38a439b2be7ed9c9c4628391d3e055d48';

const bzxDaiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
const bzxEthAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const bzxUSDCAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const bzxWBTCAddress = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
const bzxLENDAddress = '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03';
const bzxKNCAddress = '0xdd974d5c2e2928dea5f71b9825b8b646686bd200';
const bzxMKRAddress = '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2';
const bzxLINKAddress = '0x514910771AF9Ca656af840dff83E8264EcF986CA';
const bzxYFIAddress = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e';
const bzxUSDTAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';

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
const lptAddress = '0x58b6a8a3302369daec383334672404ee733ab239';
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
const cUNIAddress = '0x35a18000230da775cac24873d00ff85bccded550';

const crEthAddress = '0xD06527D5e56A3495252A528C4987003b712860eE';
const crUsdtAddress = '0x797AAB1ce7c01eB727ab980762bA88e7133d2157';
const crUsdcAddress = '0x44fbeBd2F576670a6C33f6Fc0B00aA8c5753b322';
const crCompAddress = '0x19D1666f543D42ef17F66E376944A22aEa1a8E46';
const crBalAddress = '0xcE4Fe9b4b8Ff61949DCfeB7e03bc9FAca59D2Eb3';
const crYfiAddress = '0xCbaE0A83f4f9926997c8339545fb8eE32eDc6b76';
const crYCrvAddress = '0x9baF8a5236d44AC410c0186Fe39178d5AAD0Bb87';
const crLinkAddress = '0x697256CAA3cCaFD62BB6d3Aa1C7C5671786A5fD9';
const crCreamAddress = '0x892B14321a4FCba80669aE30Bd0cd99a7ECF6aC0';
const crLendAddress = '0x8B86e0598616a8d4F1fdAE8b59E55FB5Bc33D0d6';
const crCrvAddress = '0xc7Fd8Dcee4697ceef5a2fd4608a7BD6A94C77480';
const crRenBtcAddress = '0x17107f40d70f4470d20CB3f138a052cAE8EbD4bE';
const crBusdAddress = '0x1FF8CDB51219a8838b52E9cAc09b71e591BC998e';
const crMtaAddress = '0x3623387773010d9214B10C551d6e7fc375D31F58';
const crYYCrvAddress = '0x4EE15f44c6F0d8d1136c83EfD2e8E4AC768954c6';
const crSushiAddress = '0x338286C0BC081891A4Bda39C7667ae150bf5D206';
const crFttAddress = '0x10FDBD1e48eE2fD9336a482D746138AE19e649Db';
const crYEthAddress = '0x01da76DEa59703578040012357b81ffE62015C2d';
const crSrmAddress = '0xef58b2d5A1b8D3cDE67b8aB054dC5C831E9Bc025';

const balancerCream80Weth20Address = '0x5a82503652d05B21780f33178FDF53d31c29B916';
const uniCreamWethAddress = '0xddF9b7a31b32EBAF5c064C80900046C9e5b7C65F';
const creamCreamUsdcAddress = '0x4Fd2d9d6eF05E13Bf0B167509151A4EC3D4d4b93';
const creamCreamWethAddress = '0xa49b3c7C260ce8A7C665e20Af8aA6E099A86cf8A';
const creamCrCreamCrYfiAddress = '0xA65405e0dD378C65308deAE51dA9e3BcEBb81261';
const creamCrYEthCrYYCrvAddress = '0xB3284F2F22563F27cEF2912637b6A00F162317c4';
const creamCrYEthWethAddrvess = '0x6a3B875854f5518E85Ef97620c5e7de75bbc3fA0';
const creamYYCrvUsdcAddress = '0x661b94d96ADb18646e791A06576F7905a8d1BEF6';
const creamYfiUsdcAddress = '0x7350c6D00D63AB5988250aea347f277c19BEA785';
const creamAddress = '0x2ba592F78dB6436527729929AAf6c908497cB200';

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
const idleBestYieldTUSD = '0xc278041fDD8249FE4c1Aad1193876857EEa3D68c';
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

const yflAddress = '0x28cb7e841ee97947a86B06fA4090C8451f64c0be';
const yflusdAddress = '0x7b760d06e401f85545f3b50c44bf5b05308b7b62';
const syflAddress = '0x8282df223ac402d04b2097d16f758af4f70e7db0';
const cfiAddress = '0x63b4f3e3fa4e438698ce330e365e831f7ccd1ef4';
const masqAddress = '0x06F3C323f0238c72BF35011071f2b5B7F43A054c';
const dpiAddress = '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b';
const celAddress = '0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d';
const yaxAddress = '0xb1dc9124c395c1e97773ab855d66e879f053a289';
const gswapAddress = '0xaac41EC512808d64625576EDdd580e7Ea40ef8B2';

const lslpYflLink = '0x189a730921550314934019d184ec05726881d481';
const lslpLinkYflusd = '0x6cd7817e6f3f52123df529e1edf5830240ce48c1';
const lslpYflusdWeth = '0x195734d862dfb5380eeda0acd8acf697ea95d370';
const lslpLinkSyfl = '0x74c89f297b1dc87f927d9432a4eeea697e6f89a5';
const lslpSyflWeth = '0x3315351f0b20595777a28054ef3d514bdc37463d';
const lslpDpiLink = '0x017fad4b7a54c1ace95ca614954e4d0d12cdb27e';
const lslpLinkGswap = '0xdef0cef53e0d4c6a5e568c53edcf45ceb33dbe46';
const lslpLinkCel = '0x639916bb4b29859fadf7a272185a3212157f8ce1';
const lslpMasqWeth = '0x37cee65899da4b1738412814155540c98dfd752c';
const lslpBusdLink = '0x983c9a1bcf0eb980a232d1b17bffd6bbf68fe4ce';
const lslpLinkYax = '0x626b88542495d2e341d285969f8678b99cd91da7';
const lslpYaxWeth = '0x21dee38170F1e1F26baFf2C30C0fc8F8362b6961';
const lslpLinkCfi = '0xf68c01198cddeafb9d2ea43368fc9fa509a339fa';
const lslpLinkUsdc = '0x9d996bDD1F65C835EE92Cd0b94E15d886EF14D63';
const lslpLinkUsdt = '0xf36c9fc3c2abe4132019444aff914fc8dc9785a9';
const lslpYflWeth = '0x7e5A536F3d79791E283940ec379CEE10C9C40e86';
const lslpLinkAzuki = '0xB7Cd446a2a80d4770C6bECde661B659cFC55acf5';
const lslpLinkDoki = '0xbe755C548D585dbc4e3Fe4bcD712a32Fd81e5Ba0';

const chaiAddress = '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215';

const mUsdAddress = '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5';

const chiAddress = '0x0000000000004946c0e9F43F4Dee607b0eF1fA1c';

const BTCPPAddress = '0x0327112423F3A68efdF1fcF402F6c5CB9f7C33fd';
const USDPPAddress = '0x9A48BD0EC040ea4f1D3147C025cd4076A2e71e3e';
const DEFIPLAddress = '0x24d1917c1ae6c085e6b68b6c1a41b8f9de5bd441';
const DEFIPSAddress = '0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c';
const DEFIPPAddress = '0x880873a96ce38c7fd39dc714592902b069bde048';

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

const sashimiAddress = '0xC28E27870558cF22ADD83540d2126da2e4b464c2';
const uniSashimiWethAddress = '0x4b618087DaE7765823BC47fFbF38C8Ee8489F5CA';
const uniSashimiElfAddress = '0x1629B0259E6E5c315B8Eea09fd1a4D0A26291F98';
const uniElfWethAddress = '0xA6be7F7C6c454B364cDA446ea39Be9e5E4369DE8';
const uniWbtcWethAddress = '0xBb2b8038a1640196FbE3e38816F3e67Cba72D940';

const sushiAddress = '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2';
const uniUsdtWethAddress = '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852';
const uniUsdcWethAddress = '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc';
const uniDaiWethAddress = '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11';
const uniSusdWethAddress = '0xf80758aB42C3B07dA84053Fd88804bCB6BAA4b5c';
const uniBandWethAddress = '0xf421c3f2e695c2d4c0765379ccace8ade4a480d9';
const uniLinkWethAddress = '0xa2107FA5B38d9bbd2C461D6EDf11B11A50F6b974';
const uniLendWethAddress = '0xaB3F9bF1D81ddb224a2014e98B238638824bCf20';
const uniSnxWethAddress = '0x43AE24960e5534731Fc831386c07755A2dc33D47';
const uniYfiWethAddress = '0x2fDbAdf3C4D5A8666Bc06645B8358ab803996E28';

const sushiSushiWethAddress = '0x795065dCc9f64b5614C407a6EFDC400DA6221FB0';
const sushiUsdtWethAddress = '0x06da0fd433C1A5d7a4faa01111c044910A184553';
const sushiUsdcWethAddress = '0x397FF1542f962076d0BFE58eA045FfA2d347ACa0';
const sushiDaiWethAddress = '0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f';
const sushiSusdWethAddress = '0xF1F85b2C54a2bD284B1cf4141D64fD171Bd85539';
const sushiUmaWethAddress = '0x001b6450083e531a5a7bf310bd2c1af4247e23d4';
const sushiBandWethAddress = '0xA75F7c2F025f470355515482BdE9EFA8153536A8';
const sushiLinkWethAddress = '0xC40D16476380e4037e6b1A2594cAF6a6cc8Da967';
const sushiAmplWethAddress = '0xCb2286d9471cc185281c4f763d34A962ED212962';
const sushiCompWethAddress = '0x31503dcb60119a812fee820bb7042752019f2355';
const sushiLendWethAddress = '0x5E63360E891BD60C69445970256C260b0A6A54c6';
const sushiSnxWethAddress = '0xA1d7b2d891e3A1f9ef4bBC5be20630C2FEB1c470';
const sushiYfiWethAddress = '0x088ee5007C98a9677165D78dD2109AE4a3D04d0C';
const sushiRenWethAddress = '0x611CDe65deA90918c0078ac0400A72B0D25B9bb1';
const sushiBaseSusdAddress = '0xaAD22f5543FCDaA694B68f94Be177B561836AE57';
const sushiSrmWethAddress = '0x117d4288B3635021a3D612FE05a3Cbf5C717fEf2';
const sushiYam2WethAddress = '0x95b54C8Da12BB23F7A5F6E26C38D04aCC6F81820';
const sushiCrvWethAddress = '0x58Dc5a51fE44589BEb22E8CE67720B5BC5378009';

const kimchiAddress = '0x1E18821E69B9FAA8e6e75DFFe54E7E25754beDa0';
const uniKimchiWeth = '0xC4da39E646e7F5D233B89CA0F7B75344e7ddB2cc';
const uniKimchiSushi = '0xC8d02f2669eF9aABE6B3b75E2813695AeD63748d';
const uniKimchiTend = '0x1F4e87F70002867ab5df276d6A09A94E3eDa4f9A';

const farmAddress = '0xa0246c9032bC3A600820415aE600c6388619A14D';
const fDaiAddress = '0xe85C8581e60D7Cd32Bbfd86303d2A4FA6a951Dac';
const fUsdcAddress = '0xc3F7ffb5d5869B3ade9448D094d81B0521e8326f';
const fUsdtAddress = '0xc7EE21406BB581e741FBb8B21f213188433D9f2F';
const balancerUsdc95Farm5Address = '0x0395e4A17fF11D36DaC9959f2D7c8Eca10Fe89c9';
const uniUsdcFarmAddress = '0x514906FC121c7878424a5C928cad1852CC545892';
const yfvAddress = '0x45f24BaEef268BB6d63AEe5129015d69702BCDfa';
const yfiiAddress = '0xa1d0E215a23d7030842FC67cE582a6aFa3CCaB83';
const ognAddress = '0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26';
const uniBasedSusdAddress = '0xaAD22f5543FCDaA694B68f94Be177B561836AE57';
const uniPastaWethAddress = '0xE92346d9369Fe03b735Ed9bDeB6bdC2591b8227E';

const balancerCrv90Farm10 = '0xac6bac9Dc3de2c14b420E287De8ECB330d96E492';
const balancerSwrv90Farm10 = '0xf9F2dF6e0e369145481a32Fcd260E353AA20c1a6';
const balancerUniSusdBased90Farm10 = '0xf76206115617f090f5a49961a78BCf99BB91cFeE';
const balancerUniAmplWeth90Farm10 = '0xdFb341093ea062a74Bd19a222c74Abdcb97C067b';
const balancerYFV90Farm10 = '0x97cD8E51cd6C888567c6c620188B8Fb264EE8E91';
const balancerSUSHI90Farm10 = '0xB39Ce7fa5953beBC6697112e88cd11579CBCA579';
const balancerLINK90Farm10 = '0x418d3DfcA5099923Cd57e0Bf9Ed1e9994f515152';
const balancerUniPastaWeth90Farm10 = '0xa3e69eBCE417eE0508d6996340126aD60078fCDd';
const balancerPYLON90Farm10 = '0x1e2dA0aa71155726C5C0E39AF76Ac0c2e8F74bEF';
const UniUsdtFUsdt = '0x713f62ccf8545Ff1Df19E5d7Ab94887cFaf95677';
const UniUsdcFUsdc = '0x4161Fa43eaA1Ac3882aeeD12C5FC05249e533e67';
const UniDaiFDai = '0x007E383BF3c3Ffa12A5De06a53BAb103335eFF28';
const UniWbtcFWbtc = '0xaebfeA924DE4080C14DF5C432cECe261934457E0';
const UniWbtcFRenbtc = '0x007F74c5C82d68A138Cc3Bc623E51270279fa525';
const UniWbtcFCrvWbtc = '0xb6A6a3D8EF31D9FAeb1AB1487aCe79Fe1f5df1BB';

const swUsdAddress = '0x77C6E4a580c0dCE4E5c7a17d0bc077188a83A059';

const compAddress = '0xc00e94Cb662C3520282E6f5717214004A7f26888';
const renBtcAddress = '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D';
const yYCrvAddress = '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c';
const fttAddress = '0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9';
const yEthAddress = '0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7';
const srmAddress = '0x476c5E26a75bd202a9683ffD34359C0CC15be0fF';

const uniAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
const aaveAddress = '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9';

const goughAddress = '0xad32A8e6220741182940c5aBF610bDE99E737b2D';
const balancerWeth20Dough80Address = '0xFAE2809935233d4BfE8a56c2355c4A2e7d1fFf1A';
const uniswapDaiDefiSAddress = '0x7aeFaF3ea1b465dd01561B0548c9FD969e3F76BA';
const balancerDefiS70Weth30Address = '0x35333CF3Db8e334384EC6D2ea446DA6e445701dF';

const pickleAddress = '0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5';
const pickleSCrvJarAddress = '0x68d14d66B2B0d6E157c06Dc8Fefa3D8ba0e66a89';
const pickleRenbtcCrvJarAddress = '0x2E35392F4c36EBa7eCAFE4de34199b2373Af22ec';
const pickleThreeCrvJarV2Address = '0x1BB74b5DdC1f4fC91D6f9E7906cf68bc93538e33';
const pickleUniswapWethDaiJarV2Address = '0xCffA068F1E44D98D3753966eBd58D4CFe3BB5162';
const pickleUniswapWethUsdcJarV2Address = '0x53Bf2E62fA20e2b4522f05de3597890Ec1b352C6';
const pickleUniswapWethUsdtJarV2Address = '0x09FC573c502037B149ba87782ACC81cF093EC6ef';
const pickleUniswapWethWbtcJarAddress = '0xc80090AA05374d336875907372EE4ee636CBC562';

const uniswapWethPickleAddress = '0xdc98556Ce24f007A5eF6dC1CE96322d65832A819';
const pickleUniswapWethDaiJarAddress = '0xf79Ae82DCcb71ca3042485c85588a3E0C395D55b';
const pickleUniswapWethUsdcJarAddress = '0x46206E9BDaf534d057be5EcF231DaD2A1479258B';
const pickleUniswapWethUsdtJarAddress = '0x3a41AB1e362169974132dEa424Fb8079Fd0E94d8';
const pickleThreeCrvJarAddress = '0x2385D31f1EB3736bE0C3629E6f03C4b3cd997Ffd';

const tubeAddress = '0x85BC2E8Aaad5dBc347db49Ea45D95486279eD918';

const mustStakingAddress = '0x048Dda990f581e80EFfc72E4e1996AE548f8d64C';
const mustAddress = '0x9C78EE466D6Cb57A4d01Fd887D2b5dFb2D46288f';

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
const aaveStakingAdapterTokens = [
  aaveAddress,
];
const ampleforthAdapterTokens = [
  amplAddress,
  uniAmplWethAddress,
];
const aragonStakingAdapterTokens = [
  antAddress,
  uniAntWethAddress,
];
const bzxAssetAdapterTokens = [
  iDaiAddress,
  iEthAddress,
  iUSDCAddress,
  iWBTCAddress,
  iLENDAddress,
  iKNCAddress,
  iMKRAddress,
  iLINKAddress,
  iYFIAddress,
  iUSDTAddress,
];
const bzxDebtAdapterTokens = [
  bzxDaiAddress,
  bzxEthAddress,
  bzxUSDCAddress,
  bzxWBTCAddress,
  bzxLENDAddress,
  bzxKNCAddress,
  bzxMKRAddress,
  bzxLINKAddress,
  bzxYFIAddress,
  bzxUSDTAddress,
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
  cUNIAddress,
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
  uniAddress,
];

creamAssetAdapterTokens = [
  crEthAddress,
  crUsdtAddress,
  crUsdcAddress,
  crCompAddress,
  crBalAddress,
  crYfiAddress,
  crYCrvAddress,
  crLinkAddress,
  crCreamAddress,
  crLendAddress,
  crCrvAddress,
  crRenBtcAddress,
  crBusdAddress,
  crMtaAddress,
  crYYCrvAddress,
  crSushiAddress,
  crFttAddress,
  crYEthAddress,
  crSrmAddress,
];

creamDebtAdapterTokens = [
  ethAddress,
  usdtAddress,
  usdcAddress,
  compAddress,
  balAddress,
  yfiAddress,
  yCrvAddress,
  linkAddress,
  creamAddress,
  lendAddress,
  crvAddress,
  renBtcAddress,
  busdAddress,
  mtaAddress,
  yYCrvAddress,
  sushiAddress,
  fttAddress,
  yEthAddress,
  srmAddress,
];

creamStakingAdapterTokens = [
  balancerCream80Weth20Address,
  uniCreamWethAddress,
  creamCreamUsdcAddress,
  creamCreamWethAddress,
  creamCrCreamCrYfiAddress,
  creamCrYEthCrYYCrvAddress,
  creamCrYEthWethAddrvess,
  creamYYCrvUsdcAddress,
  creamYfiUsdcAddress,
  crCreamAddress,
  creamAddress,
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
const curveVestingAdapterTokens = [
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
const harvestStakingAdapterTokens = [
  farmAddress,
  fDaiAddress,
  fUsdcAddress,
  fUsdtAddress,
  balancerUsdc95Farm5Address,
  uniUsdcFarmAddress,
  daiAddress,
  wethAddress,
  linkAddress,
  yfiAddress,
  sushiAddress,
  yfvAddress,
  yfiiAddress,
  ognAddress,
  uniBasedSusdAddress,
  uniPastaWethAddress,
];
const harvestStakingV2AdapterTokens = [
  farmAddress,
  balancerCrv90Farm10,
  balancerSwrv90Farm10,
  balancerUniSusdBased90Farm10,
  balancerUniAmplWeth90Farm10,
  balancerYFV90Farm10,
  balancerSUSHI90Farm10,
  balancerLINK90Farm10,
  balancerUniPastaWeth90Farm10,
  balancerPYLON90Farm10,
  UniUsdtFUsdt,
  UniUsdcFUsdc,
  UniDaiFDai,
  UniWbtcFWbtc,
  UniWbtcFRenbtc,
  UniWbtcFCrvWbtc,
];
const keeperDaoAdapterTokens = [
  kETHAddress,
  kWETHAddress,
];
const kimchiStakingAdapterTokens = [
  kimchiAddress,
  uniKimchiWeth,
  uniKimchiSushi,
  uniKimchiTend,
  uniUsdtWethAddress,
  uniUsdcWethAddress,
  uniSusdWethAddress,
  uniBandWethAddress,
  uniYfiWethAddress,
];
const kyberAdapterTokens = [
  kncAddress,
  ethAddress,
];
const livepeerAdapterTokens = [
  lptAddress,
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
const pickleAssetAdapterTokens = [
  pickleSCrvJarAddress,
  pickleRenbtcCrvJarAddress,
  pickleThreeCrvJarV2Address,
  pickleUniswapWethDaiJarV2Address,
  pickleUniswapWethUsdcJarV2Address,
  pickleUniswapWethUsdtJarV2Address,
  pickleUniswapWethWbtcJarAddress,
];
const pickleStakingV1AdapterTokens = [
  pickleAddress,
  sCrvAddress,
];
const pickleStakingV2AdapterTokens = [
  pickleAddress,
  uniswapWethPickleAddress,
  uniUsdtWethAddress,
  uniUsdcWethAddress,
  uniDaiWethAddress,
  uniSusdWethAddress,
  pickleUniswapWethDaiJarAddress,
  pickleUniswapWethUsdcJarAddress,
  pickleUniswapWethUsdtJarAddress,
  pickleThreeCrvJarAddress,
  pickleSCrvJarAddress,
  pickleUniswapWethDaiJarV2Address,
  pickleUniswapWethUsdcJarV2Address,
  pickleUniswapWethUsdtJarV2Address,
];
const pieDAOPieAdapterTokens = [
  BTCPPAddress,
  USDPPAddress,
  DEFIPLAddress,
  DEFIPSAddress,
  DEFIPPAddress,
];
const pieDAOStakingAdapterTokens = [
  goughAddress,
  balancerWeth20Dough80Address,
  uniswapDaiDefiSAddress,
  balancerDefiS70Weth30Address,
];
const poolTogetherAdapterTokens = [
  saiPoolAddress,
  daiPoolAddress,
  usdcPoolAddress,
];
const sashimiStakingAdapterTokens = [
  sashimiAddress,
  uniSashimiWethAddress,
  uniSashimiElfAddress,
  uniElfWethAddress,
  uniWbtcWethAddress,
  uniUsdtWethAddress,
  uniUsdcWethAddress,
  uniDaiWethAddress,
  uniLinkWethAddress,
  uniLendWethAddress,
  uniSnxWethAddress,
  uniYfiWethAddress,
];
const sushiStakingAdapterTokens = [
  sushiAddress,
  sushiSushiWethAddress,
  sushiUsdtWethAddress,
  sushiUsdcWethAddress,
  sushiDaiWethAddress,
  sushiSusdWethAddress,
  sushiUmaWethAddress,
  sushiBandWethAddress,
  sushiLinkWethAddress,
  sushiAmplWethAddress,
  sushiCompWethAddress,
  sushiLendWethAddress,
  sushiSnxWethAddress,
  sushiYfiWethAddress,
  sushiRenWethAddress,
  sushiBaseSusdAddress,
  sushiSrmWethAddress,
  sushiYam2WethAddress,
  sushiCrvWethAddress,
];
const swerveAdapterTokens = [
  swUsdAddress,
];
const swerveStakingAdapterTokens = [
  swUsdAddress,
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
const uniswapV2StakingAdapterTokens = [
  uniAddress,
  uniDaiWethAddress,
  uniUsdcWethAddress,
  uniUsdcWethAddress,
  uniWbtcWethAddress,
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
const LinkswapStakingAdapterTokens = [
  yflAddress,
  yflusdAddress,
  syflAddress,
  wethAddress,
  linkAddress,
  busdAddress,
  usdcAddress,
  usdtAddress,
  cfiAddress,
  masqAddress,
  dpiAddress,
  celAddress,
  yaxAddress,
  gswapAddress,
  lslpYflWeth,
  lslpYflLink,
  lslpLinkYflusd,
  lslpYflusdWeth,
  lslpLinkSyfl,
  lslpSyflWeth,
  lslpBusdLink,
  lslpLinkUsdc,
  lslpLinkUsdt,
  lslpLinkCfi,
  lslpMasqWeth,
  lslpDpiLink,
  lslpLinkCel,
  lslpLinkYax,
  lslpYaxWeth,
  lslpLinkGswap,
  lslpLinkAzuki,
  lslpLinkDoki,
];
const zrxAdapterTokens = [
  zrxAddress,
];
const tubeProtocolAdapterTokens = [
  tubeAddress,
];
const mustStakingAdapterTokens = [
  mustAddress,
  mustStakingAddress,
];

let protocolNames = [];
let metadata = [];
let adapters = [];
let tokens = [];
let tokenAdapters = [];

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(AaveAssetAdapter, { from: accounts[0] });
  await deployer.deploy(AaveDebtAdapter, { from: accounts[0] });
  await deployer.deploy(AaveStakingAdapter, { from: accounts[0] });
  adapters.push([AaveAssetAdapter.address, AaveDebtAdapter.address, AaveStakingAdapter.address]);
  tokens.push([aaveAssetAdapterTokens, aaveDebtAdapterTokens, aaveStakingAdapterTokens]);
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

  await deployer.deploy(BzxAssetAdapter, { from: accounts[0] });
  await deployer.deploy(BzxDebtAdapter, { from: accounts[0] });
  adapters.push([BzxAssetAdapter.address, BzxDebtAdapter.address]);
  tokens.push([bzxAssetAdapterTokens, bzxDebtAdapterTokens]);
  protocolNames.push('bZx');
  metadata.push([
    'bZx',
    'Margin trading/lending and borrowing with bZx',
    'bzx.network',
    'protocol-icons.s3.amazonaws.com/TODO.png', // TODO
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

  await deployer.deploy(CreamAssetAdapter, { from: accounts[0] });
  await deployer.deploy(CreamDebtAdapter, { from: accounts[0] });
  await deployer.deploy(CreamStakingAdapter, { from: accounts[0] });
  adapters.push([CreamAssetAdapter.address, CreamDebtAdapter.address, CreamStakingAdapter.address]);
  tokens.push([creamAssetAdapterTokens, creamDebtAdapterTokens, creamStakingAdapterTokens]);
  protocolNames.push('C.R.E.A.M.');
  metadata.push([
    'C.R.E.A.M.',
    'A lending platform based on Compound Finance and exchange platform based on Balancer Labs',
    'cream.finance',
    'protocol-icons.s3.amazonaws.com/cream.png',
    '0',
  ]);

  await deployer.deploy(CurveAdapter, { from: accounts[0] });
  await deployer.deploy(CurveStakingAdapter, { from: accounts[0] });
  await deployer.deploy(CurveVestingAdapter, { from: accounts[0] });
  adapters.push([CurveAdapter.address, CurveStakingAdapter.address, CurveVestingAdapter.address]);
  tokens.push([curveAdapterTokens, curveStakingAdapterTokens, curveVestingAdapterTokens]);
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

  await deployer.deploy(DodoAdapter, { from: accounts[0] });
  await deployer.deploy(DodoStakingAdapter, { from: accounts[0] });
  adapters.push([DodoAdapter.address, DodoStakingAdapter.address]);
  tokens.push([[], []]);
  protocolNames.push('DODO');
  metadata.push([
    'DODO',
    'Your on-chain liquidity provider',
    'dodoex.io',
    'protocol-icons.s3.amazonaws.com/dodo.png',
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

  await deployer.deploy(LinkswapAdapter, { from: accounts[0] });
  await deployer.deploy(LinkswapStakingAdapter, { from: accounts[0] });
  adapters.push(
    [LinkswapAdapter.address, LinkswapStakingAdapter.address],
  );
  tokens.push([LinkswapStakingAdapterTokens]);
  protocolNames.push('LINKSWAP');
  metadata.push([
    'LINKSWAP',
    'YF Link community-governed automated market maker',
    'linkswap.app',
    'protocol-icons.s3.amazonaws.com/yflink.png',
    '0',
  ]);

  await deployer.deploy(HarvestStakingAdapter, { from: accounts[0] });
  await deployer.deploy(HarvestStakingV2Adapter, { from: accounts[0] });
  adapters.push([HarvestStakingAdapter.address, HarvestStakingV2Adapter.address]);
  tokens.push([harvestStakingAdapterTokens, harvestStakingV2AdapterTokens]);
  protocolNames.push('Harvest');
  metadata.push([
    'Harvest',
    'Your hard work is about to become easier with Harvest',
    'harvest.finance',
    'protocol-icons.s3.amazonaws.com/harvest.png',
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

  await deployer.deploy(KimchiStakingAdapter, { from: accounts[0] });
  adapters.push([KimchiStakingAdapter.address]);
  tokens.push([[kimchiStakingAdapterTokens]]);
  protocolNames.push('KIMCHI');
  metadata.push([
    'KIMCHI',
    'Farm KIMCHI by staking LP tokens',
    'kimchi.finance',
    'protocol-icons.s3.amazonaws.com/kimchi.png',
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

  await deployer.deploy(LivepeerStakingAdapter, { from: accounts[0] });
  adapters.push([LivepeerStakingAdapter.address]);
  tokens.push([livepeerAdapterTokens]);
  protocolNames.push('Livepeer');
  metadata.push([
    'Livepeer',
    'Delegated stake based protocol for decentralized video streaming.',
    'livepeer.org',
    'protocol-icons.s3.amazonaws.com/livepeer.png',
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

  await deployer.deploy(PickleAssetAdapter, { from: accounts[0] });
  await deployer.deploy(PickleStakingV1Adapter, { from: accounts[0] });
  await deployer.deploy(PickleStakingV2Adapter, { from: accounts[0] });
  adapters.push([
    PickleAssetAdapter.address,
    PickleStakingV1Adapter.address,
    PickleStakingV2Adapter.address,
  ]);
  tokens.push([
    pickleAssetAdapterTokens,
    pickleStakingV1AdapterTokens,
    pickleStakingV2AdapterTokens,
  ]);
  protocolNames.push('Pickle Finance');
  metadata.push([
    'Pickle Finance',
    'Off peg bad, on peg good',
    'pickle.finance',
    'protocol-icons.s3.us-east-1.amazonaws.com/pickle.png',
    '0',
  ]);

  await deployer.deploy(PieDAOPieAdapter, { from: accounts[0] });
  await deployer.deploy(PieDAOStakingAdapter, { from: accounts[0] });
  adapters.push([PieDAOPieAdapter.address, PieDAOStakingAdapter.address]);
  tokens.push([pieDAOPieAdapterTokens, pieDAOStakingAdapterTokens]);
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

  await deployer.deploy(SashimiStakingAdapter, { from: accounts[0] });
  adapters.push([SashimiStakingAdapter.address]);
  tokens.push([[sashimiStakingAdapterTokens]]);
  protocolNames.push('SashimiSwap');
  metadata.push([
    'SashimiSwap',
    'Earn SASHIMI tokens by staking Uniswap V2 LP Tokens',
    'sashimi.cool',
    'protocol-icons.s3.amazonaws.com/sashimi.png',
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

  await deployer.deploy(SwerveAdapter, { from: accounts[0] });
  await deployer.deploy(SwerveStakingAdapter, { from: accounts[0] });
  adapters.push([SwerveAdapter.address, SwerveStakingAdapter.address]);
  tokens.push([[swerveAdapterTokens, swerveStakingAdapterTokens]]);
  protocolNames.push('Swerve');
  metadata.push([
    'Swerve',
    'A fork that\'s 100% community owned and governed',
    'swerve.fi',
    'protocol-icons.s3.amazonaws.com/swerve.png',
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
  await deployer.deploy(TokenSetsV2Adapter, { from: accounts[0] });
  adapters.push([TokenSetsAdapter.address, TokenSetsV2Adapter.address]);
  tokens.push([[], []]);
  protocolNames.push('TokenSets');
  metadata.push([
    'TokenSets',
    'Automated asset management strategies',
    'tokensets.com',
    'protocol-icons.s3.amazonaws.com/SET.png',
    '0',
  ]);

  await deployer.deploy(TubeProtocolAdapter, { from: accounts[0] });
  adapters.push([TubeProtocolAdapter.address]);
  tokens.push([tubeProtocolAdapterTokens]);
  protocolNames.push('Tube');
  metadata.push([
    'Tube',
    'MUST staking contract',
    'cometh.io',
    'www.cometh.io/alembic.png',
    '0',
  ]);

  await deployer.deploy(MustStakingAdapter, { from: accounts[0] });
  adapters.push([MustStakingAdapter.address]);
  tokens.push([mustStakingAdapterTokens]);
  protocolNames.push('Staking reward');
  metadata.push([
    'Staking reward',
    'MUST liquidity providers staking reward',
    'cometh.io',
    'www.cometh.io/alembic.png',
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
  await deployer.deploy(UniswapV2StakingAdapter, { from: accounts[0] });
  adapters.push([UniswapV2Adapter.address, UniswapV2StakingAdapter.address]);
  tokens.push([[], uniswapV2StakingAdapterTokens]);
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
  await deployer.deploy(BzxTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        BzxTokenAdapter.address,
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
  await deployer.deploy(DodoTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        DodoTokenAdapter.address,
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
  await deployer.deploy(PickleTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        PickleTokenAdapter.address,
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
  await deployer.deploy(TokenSetsV2TokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        TokenSetsV2TokenAdapter.address,
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
  await deployer.deploy(LinkswapTokenAdapter, { from: accounts[0] })
    .then(() => {
      tokenAdapters.push(
        LinkswapTokenAdapter.address,
      );
    });
  await deployer.deploy(AdapterRegistry, { from: accounts[0] })
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
          'iToken',
          'CToken',
          'Curve pool token',
          'MToken',
          'DODO pool token',
          'IdleToken',
          'YToken',
          'KToken',
          'Chai token',
          'MelonToken',
          'Masset',
          'Chi token',
          'PickleJar',
          'PieDAO Pie Token',
          'PoolTogether pool',
          'SetToken',
          'SetToken V2',
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
