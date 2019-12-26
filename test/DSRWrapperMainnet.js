// import expectRevert from './helpers/expectRevert';
// import { increaseTimeTo, increaseTime } from './helpers/increaseTime';
// const { BN } = web3.utils;

const WrapperRegistry = artifacts.require('./WrapperRegistry');

contract('DSRWrapperMainnet', () => {
  // let accounts;
  let wrapperRegistry;

  beforeEach(async () => {
    // accounts = await web3.eth.getAccounts();
    await WrapperRegistry.deployed()
      .then((result) => {
        wrapperRegistry = result.contract;
      });
  });

  it('should be correct balance', async () => {
    const testAddress = '0x5DbC6c9Bf22f78eecDb74275810403416C4F2CA0';
    await wrapperRegistry.methods['balance(address)'](testAddress)
      .call()
      .then((result) => {
        // eslint-disable-next-line no-console
        console.log(`Deposited DAI amount: ${result[0].balances[0].amount.toString()}`);
      });
  });
});
