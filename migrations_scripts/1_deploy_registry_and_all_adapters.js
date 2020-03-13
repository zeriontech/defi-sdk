const AaveAdapter = artifacts.require('AaveAdapter');
const CompoundAdapter = artifacts.require('CompoundAdapter');
const CurveAdapter = artifacts.require('CurveAdapter');
const DSRAdapter = artifacts.require('DSRAdapter');
const MCDAdapter = artifacts.require('MCDAdapter');
const PoolTogetherAdapter = artifacts.require('PoolTogetherAdapter');
const SynthetixAdapter = artifacts.require('SynthetixAdapter');
const ZrxAdapter = artifacts.require('ZrxAdapter');
const AdapterRegistry = artifacts.require('AdapterRegistry');

module.exports = (deployer, network, accounts) => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const tusdAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const susdAddress = '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51';
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

  const ssTokenAddress = '0x3740fb63ab7a09891d7c0d4299442A551D06F5fD';

  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

  const saiAddress = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359';

  const aaveAdapterAssets = [
    daiAddress,
    tusdAddress,
    usdcAddress,
    usdtAddress,
    susdAddress,
    lendAddress,
    batAddress,
    ethAddress,
    linkAddress,
    kncAddress,
    repAddress,
    mkrAddress,
    manaAddress,
    zrxAddress,
    snxProxyAddress,
    wbtcAddress,
  ];
  const compoundAdapterAssets = [
    cDAIAddress,
    cBATAddress,
    cETHAddress,
    cREPAddress,
    cSAIAddress,
    cZRXAddress,
    cUSDCAddress,
    cWBTCAddress,
  ];
  const curveAdapterAssets = [
    ssTokenAddress,
  ];
  const dsrAdapterAssets = [
    daiAddress,
  ];
  const mcdAdapterAssets = [
    daiAddress,
    wethAddress,
    batAddress,
  ];
  const poolTogetherAdapterAssets = [
    daiAddress,
    saiAddress,
  ];
  const synthetixAdapterAssets = [
    snxAddress,
    susdAddress,
  ];
  const zrxAdapterAssets = [
    zrxAddress,
  ];

  deployer.deploy(AaveAdapter, { from: accounts[0] })
    .then(() => deployer.deploy(CompoundAdapter, { from: accounts[0] })
      .then(() => deployer.deploy(CurveAdapter, { from: accounts[0] })
        .then(() => deployer.deploy(DSRAdapter, { from: accounts[0] })
          .then(() => deployer.deploy(MCDAdapter, { from: accounts[0] })
            .then(() => deployer.deploy(PoolTogetherAdapter, { from: accounts[0] })
              .then(() => deployer.deploy(SynthetixAdapter, { from: accounts[0] })
                .then(() => deployer.deploy(ZrxAdapter, { from: accounts[0] })
                  .then(() => deployer.deploy(
                    AdapterRegistry,
                    [
                      AaveAdapter.address,
                      CompoundAdapter.address,
                      CurveAdapter.address,
                      DSRAdapter.address,
                      MCDAdapter.address,
                      PoolTogetherAdapter.address,
                      SynthetixAdapter.address,
                      ZrxAdapter.address,
                    ],
                    [
                      aaveAdapterAssets,
                      compoundAdapterAssets,
                      curveAdapterAssets,
                      dsrAdapterAssets,
                      mcdAdapterAssets,
                      poolTogetherAdapterAssets,
                      synthetixAdapterAssets,
                      zrxAdapterAssets,
                    ],
                    { from: accounts[0] },
                  )))))))));
};
