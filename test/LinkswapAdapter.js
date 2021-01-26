import displayToken from './helpers/displayToken';

const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('LinkswapAdapter');
const TokenAdapter = artifacts.require('LinkswapTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract.only('LinkswapAdapter', () => {
  const yflAddress = '0x28cb7e841ee97947a86B06fA4090C8451f64c0be';
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const linkAddress = '0x514910771AF9Ca656af840dff83E8264EcF986CA';
  const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const busdAddress = '0x4Fabb145d64652a948d72533023f6E7A623C7C53';
  const cfiAddress = '0x63b4f3e3fa4e438698ce330e365e831f7ccd1ef4';
  const masqAddress = '0x06F3C323f0238c72BF35011071f2b5B7F43A054c';
  const dpiAddress = '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b';
  const celAddress = '0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d';
  const yaxAddress = '0xb1dc9124c395c1e97773ab855d66e879f053a289';
  const gswapAddress = '0xaac41EC512808d64625576EDdd580e7Ea40ef8B2';
  const azukiAddress = '0x910524678C0B1B23FFB9285a81f99C29C11CBaEd';
  const dokiAddress = '0x9ceb84f92a0561fa3cc4132ab9c0b76a59787544';

  const lslpYflLink = '0x189a730921550314934019d184ec05726881d481';
  const lslpDpiLink = '0x017fad4b7a54c1ace95ca614954e4d0d12cdb27e';
  const lslpLinkGswap = '0xdef0cef53e0d4c6a5e568c53edcf45ceb33dbe46';
  const lslpLinkCel = '0x639916bb4b29859fadf7a272185a3212157f8ce1';
  const lslpMasqWeth = '0x37cee65899da4b1738412814155540c98dfd752c';
  const lslpBusdLink = '0x983c9a1bcf0eb980a232d1b17bffd6bbf68fe4ce';
  const lslpLinkYax = '0x626b88542495d2e341d285969f8678b99cd91da7';
  const lslpLinkCfi = '0xf68c01198cddeafb9d2ea43368fc9fa509a339fa';
  const lslpLinkUsdc = '0x9d996bDD1F65C835EE92Cd0b94E15d886EF14D63';
  const lslpLinkUsdt = '0xf36c9fc3c2abe4132019444aff914fc8dc9785a9';
  const lslpYflWeth = '0x7e5A536F3d79791E283940ec379CEE10C9C40e86';
  const lslpLinkAzuki = '0xB7Cd446a2a80d4770C6bECde661B659cFC55acf5';
  const lslpLinkDoki = '0xbe755C548D585dbc4e3Fe4bcD712a32Fd81e5Ba0';

  const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let erc20TokenAdapterAddress;
  const yflLink = [
    lslpYflLink,
    'YFL-LINK',
    'LSLP',
    '18',
  ];
  const dpiLink = [
    lslpDpiLink,
    'DPI-LINK',
    'LSLP',
    '18',
  ];
  const linkGswap = [
    lslpLinkGswap,
    'LINK-GSWAP',
    'LSLP',
    '18',
  ];
  const linkCel = [
    lslpLinkCel,
    'LINK-CEL',
    'LSLP',
    '18',
  ];
  const masqWeth = [
    lslpMasqWeth,
    'MASQ-WETH',
    'LSLP',
    '18',
  ];
  const busdLink = [
    lslpBusdLink,
    'BUSD-LINK',
    'LSLP',
    '18',
  ];
  const linkYax = [
    lslpLinkYax,
    'LINK-YAX',
    'LSLP',
    '18',
  ];
  const linkCfi = [
    lslpLinkCfi,
    'LINK-CFI',
    'LSLP',
    '18',
  ];
  const linkUsdc = [
    lslpLinkUsdc,
    'LINK-USDC',
    'LSLP',
    '18',
  ];
  const linkUsdt = [
    lslpLinkUsdt,
    'LINK-USDT',
    'LSLP',
    '18',
  ];
  const linkAzuki = [
    lslpLinkAzuki,
    'LINK-AZUKI',
    'LSLP',
    '18',
  ];
  const linkDoki = [
    lslpLinkDoki,
    'LINK-DOKI',
    'LSLP',
    '18',
  ];
  const yflWeth = [
    lslpYflWeth,
    'YFL-WETH',
    'LSLP',
    '18',
  ];
  const yfl = [
    yflAddress,
    'YF Link',
    'YFL',
    '18',
  ];
  const weth = [
    wethAddress,
    'Wrapped Ether',
    'WETH',
    '18',
  ];
  const link = [
    linkAddress,
    'ChainLink Token',
    'LINK',
    '18',
  ];
  const usdc = [
    usdcAddress,
    'USD Coin',
    'USDC',
    '6',
  ];
  const usdt = [
    usdtAddress,
    'Tether USD',
    'USDT',
    '6',
  ];
  const busd = [
    busdAddress,
    'Binance USD',
    'BUSD',
    '18',
  ];
  const cfi = [
    cfiAddress,
    'CyberFi Token',
    'CFI',
    '18',
  ];
  const masq = [
    masqAddress,
    'MASQ',
    'MASQ',
    '18',
  ];
  const dpi = [
    dpiAddress,
    'DefiPulse Index',
    'DPI',
    '18',
  ];
  const cel = [
    celAddress,
    'Celsius',
    'CEL',
    '4',
  ];
  const yax = [
    yaxAddress,
    'yAxis',
    'YAX',
    '18',
  ];
  const gswap = [
    gswapAddress,
    'gameswap.org',
    'GSWAP',
    '18',
  ];
  const azuki = [
    azukiAddress,
    'DokiDokiAzuki',
    'AZUKI',
    '18',
  ];
  const doki = [
    dokiAddress,
    'DokiDokiFinance',
    'DOKI',
    '18',
  ];
  const yflLinkNa = [
    lslpYflLink,
    'Not available',
    'N/A',
    '0',
  ];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ProtocolAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterAddress = result.address;
      });
    await TokenAdapter.new({ from: accounts[0] })
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
      ['LINKSWAP'],
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
        lslpYflLink,
        lslpYflWeth,
        lslpLinkUsdc,
        lslpLinkUsdt,
        lslpLinkCel,
        lslpLinkYax,
        lslpLinkCfi,
        lslpLinkGswap,
        lslpBusdLink,
        lslpDpiLink,
        lslpMasqWeth,
        lslpLinkAzuki,
        lslpLinkDoki,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC20', 'Uniswap V2 pool token'],
      [erc20TokenAdapterAddress, tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
  });

  it('should return correct balances', async () => {
    await adapterRegistry.methods['getBalances(address)'](testAddress)
      .call()
      .then((result) => {
        displayToken(result[0].adapterBalances[0].balances[0].base);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[0].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[1].base);
        displayToken(result[0].adapterBalances[0].balances[1].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[1].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[2].base);
        displayToken(result[0].adapterBalances[0].balances[2].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[2].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[3].base);
        displayToken(result[0].adapterBalances[0].balances[3].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[3].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[4].base);
        displayToken(result[0].adapterBalances[0].balances[4].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[4].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[5].base);
        displayToken(result[0].adapterBalances[0].balances[5].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[5].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[6].base);
        displayToken(result[0].adapterBalances[0].balances[6].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[6].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[7].base);
        displayToken(result[0].adapterBalances[0].balances[7].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[7].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[8].base);
        displayToken(result[0].adapterBalances[0].balances[8].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[8].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[9].base);
        displayToken(result[0].adapterBalances[0].balances[9].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[9].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[10].base);
        displayToken(result[0].adapterBalances[0].balances[10].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[10].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[11].base);
        displayToken(result[0].adapterBalances[0].balances[11].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[11].underlying[1]);
        displayToken(result[0].adapterBalances[0].balances[12].base);
        displayToken(result[0].adapterBalances[0].balances[12].underlying[0]);
        displayToken(result[0].adapterBalances[0].balances[12].underlying[1]);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, yfl);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].underlying[0].metadata, yfl);
        assert.deepEqual(result[0].adapterBalances[0].balances[2].underlying[0].metadata, link);
        assert.deepEqual(result[0].adapterBalances[0].balances[3].underlying[0].metadata, link);
        assert.deepEqual(result[0].adapterBalances[0].balances[4].underlying[0].metadata, link);
        assert.deepEqual(result[0].adapterBalances[0].balances[5].underlying[0].metadata, link);
        assert.deepEqual(result[0].adapterBalances[0].balances[6].underlying[0].metadata, link);
        assert.deepEqual(result[0].adapterBalances[0].balances[7].underlying[0].metadata, link);
        assert.deepEqual(result[0].adapterBalances[0].balances[8].underlying[0].metadata, busd);
        assert.deepEqual(result[0].adapterBalances[0].balances[9].underlying[0].metadata, dpi);
        assert.deepEqual(result[0].adapterBalances[0].balances[10].underlying[0].metadata, masq);
        assert.deepEqual(result[0].adapterBalances[0].balances[11].underlying[0].metadata, link);
        assert.deepEqual(result[0].adapterBalances[0].balances[12].underlying[0].metadata, link);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, yflLink);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].base.metadata, yflWeth);
        assert.deepEqual(result[0].adapterBalances[0].balances[2].base.metadata, linkUsdc);
        assert.deepEqual(result[0].adapterBalances[0].balances[3].base.metadata, linkUsdt);
        assert.deepEqual(result[0].adapterBalances[0].balances[4].base.metadata, linkCel);
        assert.deepEqual(result[0].adapterBalances[0].balances[5].base.metadata, linkYax);
        assert.deepEqual(result[0].adapterBalances[0].balances[6].base.metadata, linkCfi);
        assert.deepEqual(result[0].adapterBalances[0].balances[7].base.metadata, linkGswap);
        assert.deepEqual(result[0].adapterBalances[0].balances[8].base.metadata, busdLink);
        assert.deepEqual(result[0].adapterBalances[0].balances[9].base.metadata, dpiLink);
        assert.deepEqual(result[0].adapterBalances[0].balances[10].base.metadata, masqWeth);
        assert.deepEqual(result[0].adapterBalances[0].balances[11].base.metadata, linkAzuki);
        assert.deepEqual(result[0].adapterBalances[0].balances[12].base.metadata, linkDoki);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[1].metadata, link);
        assert.deepEqual(result[0].adapterBalances[0].balances[1].underlying[1].metadata, weth);
        assert.deepEqual(result[0].adapterBalances[0].balances[2].underlying[1].metadata, usdc);
        assert.deepEqual(result[0].adapterBalances[0].balances[3].underlying[1].metadata, usdt);
        assert.deepEqual(result[0].adapterBalances[0].balances[4].underlying[1].metadata, cel);
        assert.deepEqual(result[0].adapterBalances[0].balances[5].underlying[1].metadata, yax);
        assert.deepEqual(result[0].adapterBalances[0].balances[6].underlying[1].metadata, cfi);
        assert.deepEqual(result[0].adapterBalances[0].balances[7].underlying[1].metadata, gswap);
        assert.deepEqual(result[0].adapterBalances[0].balances[8].underlying[1].metadata, link);
        assert.deepEqual(result[0].adapterBalances[0].balances[9].underlying[1].metadata, link);
        assert.deepEqual(result[0].adapterBalances[0].balances[10].underlying[1].metadata, weth);
        assert.deepEqual(result[0].adapterBalances[0].balances[11].underlying[1].metadata, azuki);
        assert.deepEqual(result[0].adapterBalances[0].balances[12].underlying[1].metadata, doki);
      });
  });

  it('should not fail if token adapter is missing', async () => {
    await adapterRegistry.methods.removeTokenAdapters(
      ['LSLP'],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.getAdapterBalance(
      testAddress,
      protocolAdapterAddress,
      [lslpYflLink],
    )
      .call()
      .then((result) => {
        assert.deepEqual(result.balances[0].base.metadata, yflLinkNa);
        assert.equal(result.balances[0].underlying.length, 0);
      });
  });
});
