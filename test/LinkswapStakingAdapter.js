const ProtocolAdapter = artifacts.require('LinkswapStakingAdapter');

contract.only('LinkswapStakingAdapter', () => {
  let addressMap = new Map([
    ['yfl', '0x28cb7e841ee97947a86B06fA4090C8451f64c0be'],
    ['syfl', '0x8282df223AC402d04B2097d16f758Af4F70e7Db0'],
    ['cfi', '0x63b4f3e3fa4e438698CE330e365E831F7cCD1eF4'],
    ['masq', '0x06F3C323f0238c72BF35011071f2b5B7F43A054c'],
    ['dpi', '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b'],
    ['cel', '0xaaAEBE6Fe48E54f431b0C390CfaF0b017d09D42d'],
    ['yax', '0xb1dC9124c395c1e97773ab855d66E879f053A289'],
    ['gsawp', '0xaac41EC512808d64625576EDdd580e7Ea40ef8B2'],
    ['azuki', '0x910524678C0B1B23FFB9285a81f99C29C11CBaEd'],
    ['lslpYflWeth', '0x7e5A536F3d79791E283940ec379CEE10C9C40e86'],
    ['lslpYflLink', '0x189A730921550314934019d184EC05726881D481'],
    ['lslpLinkYflusd', '0x6cD7817e6f3f52123df529E1eDF5830240Ce48c1'],
    ['lslpYflusdWeth', '0x195734d862DFb5380eeDa0ACD8acf697eA95D370'],
    ['lslpLinkSyfl', '0x74C89f297b1dC87F927d9432a4eeea697E6f89a5'],
    ['lslpSyflWeth', '0x3315351F0B20595777a28054EF3d514bdC37463d'],
    ['lslpDpiLink', '0xFe04c284a9725c141CF6de85D7E8452af1B48ab7'],
    ['lslpLinkGswap', '0xdef0CEF53E0D4c6A5E568c53EdCf45CeB33DBE46'],
    ['lslpLinkCel', '0x639916bB4B29859FADF7A272185a3212157F8CE1'],
    ['lslpMasqWeth', '0x37CeE65899dA4B1738412814155540C98DFd752C'],
    ['lslpBusdLink', '0x983c9a1BCf0eB980a232D1b17bFfd6Bbf68Fe4Ce'],
    ['lslpLinkYax', '0x626B88542495d2e341d285969F8678B99cd91DA7'],
    ['lslpYaxWeth', '0x21dee38170F1e1F26baFf2C30C0fc8F8362b6961'],
    ['lslpLinkCfi', '0xf68c01198cDdEaFB9d2EA43368FC9fA509A339Fa'],
    ['lslpLinkUsdc', '0x9d996bDD1F65C835EE92Cd0b94E15d886EF14D63'],
    ['lslpLinkUsdt', '0xf36c9fc3c2aBE4132019444AfF914Fc8DC9785a9'],
    ['lslpLinkAzuki', '0xB7Cd446a2a80d4770C6bECde661B659cFC55acf5'],
    ['lslpLinkDoki', '0xbe755C548D585dbc4e3Fe4bcD712a32Fd81e5Ba0'],
  ]);
  // Random address with positive balances
  const testAddress = '0x75D1aA733920b14fC74c9F6e6faB7ac1EcE8482E';

  let accounts;
  let protocolAdapterContract;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ProtocolAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterContract = result.contract;
      });
  });
  addressMap.forEach((value, key) => {
    it(`should return correct balances for ${key}`, async () => {
      await protocolAdapterContract.methods['getBalance(address,address)'](value, testAddress)
        .call()
        .then((result) => {
          console.dir(result, { depth: null });
        });
    });
  });
});
