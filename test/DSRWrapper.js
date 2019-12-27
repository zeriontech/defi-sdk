// import { increaseTimeTo, increaseTime } from './helpers/increaseTime';
// const { BN } = web3.utils;

import expectRevert from './helpers/expectRevert';

const WrapperRegistry = artifacts.require('./WrapperRegistry');
const DSRWrapper = artifacts.require('./DSRWrapper');

contract('DSRWrapper', () => {
  const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const potAddress = '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7';

  let accounts;
  let wrapperRegistry;
  let dsrWrapper;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await DSRWrapper.new([daiAddress], potAddress, { from: accounts[0] })
      .then((result) => {
        dsrWrapper = result.contract;
      });
    await WrapperRegistry.new([dsrWrapper.options.address], { from: accounts[0] })
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
        assert.equal(result[0].balances[0].decimals, 18);
        assert.equal(result[0].balances[0].asset, daiAddress);
        assert.equal(result[0].name, 'DSR');
      });
  });

  it('should not add asset not by the owner', async () => {
    await expectRevert(
      dsrWrapper.methods['addAsset(address)']('0x1111111111111111111111111111111111111111')
        .send({ from: accounts[1] }),
    );
  });

  it('should add asset by the owner', async () => {
    await dsrWrapper.methods['addAsset(address)']('0x1111111111111111111111111111111111111111')
      .send({ from: accounts[0] });
    await dsrWrapper.methods['assets(uint256)'](1)
      .call()
      .then((result) => {
        assert.equal(result, '0x1111111111111111111111111111111111111111');
      });
  });

  it('should not remove asset not by the owner', async () => {
    await expectRevert(
      dsrWrapper.methods['removeAsset(uint256)'](0)
        .send({ from: accounts[1] }),
    );
  });

  it('should not remove asset with wrong index', async () => {
    await expectRevert(
      dsrWrapper.methods['removeAsset(uint256)'](2)
        .send({ from: accounts[0] }),
    );
  });

  it('should remove asset by the owner', async () => {
    // [daiAddress]
    await dsrWrapper.methods['addAsset(address)']('0x2222222222222222222222222222222222222222')
      .send({ from: accounts[0] });
    // [daiAddress, '0x2...2']
    await dsrWrapper.methods['assets(uint256)'](1)
      .call()
      .then((result) => {
        assert.equal(result, '0x2222222222222222222222222222222222222222');
      });
    await dsrWrapper.methods['removeAsset(uint256)'](0)
      .send({ from: accounts[0] });
    // ['0x2...2']
    await dsrWrapper.methods['assets(uint256)'](0)
      .call()
      .then((result) => {
        assert.equal(result, '0x2222222222222222222222222222222222222222');
      });
    await dsrWrapper.methods['addAsset(address)']('0x1111111111111111111111111111111111111111')
      .send({ from: accounts[0] });
    // ['0x2...2', '0x1...1']
    await dsrWrapper.methods['assets(uint256)'](1)
      .call()
      .then((result) => {
        assert.equal(result, '0x1111111111111111111111111111111111111111');
      });
    await dsrWrapper.methods['removeAsset(uint256)'](1)
      .send({ from: accounts[0] });
    // ['0x2...2']
    await dsrWrapper.methods['assets(uint256)'](0)
      .call()
      .then((result) => {
        assert.equal(result, '0x2222222222222222222222222222222222222222');
      });
    // []
    await expectRevert(
      dsrWrapper.methods['assets(uint256)'](1)
        .call(),
    );
  });

  it('should not transfer ownership not by the owner', async () => {
    await expectRevert(
      dsrWrapper.methods['transferOwnership(address)'](accounts[1])
        .send({ from: accounts[1] }),
    );
  });

  it('should not transfer ownership to the zero address', async () => {
    await expectRevert(
      dsrWrapper.methods['transferOwnership(address)']('0x0000000000000000000000000000000000000000')
        .send({ from: accounts[0] }),
    );
  });

  it('should transfer ownership by the owner', async () => {
    await dsrWrapper.methods['transferOwnership(address)'](accounts[1])
      .send({ from: accounts[0] });
    await dsrWrapper.methods['owner()']()
      .call()
      .then((result) => {
        assert.equal(result, accounts[1]);
      });
  });

  it('should not update pot not by the owner', async () => {
    await expectRevert(
      dsrWrapper.methods['updatePot(address)']('0x1111111111111111111111111111111111111111')
        .send({ from: accounts[1] }),
    );
  });

  it('should not update pot to the zero address', async () => {
    await expectRevert(
      dsrWrapper.methods['updatePot(address)']('0x0000000000000000000000000000000000000000')
        .send({ from: accounts[0] }),
    );
  });

  it('should update pot by the owner', async () => {
    await dsrWrapper.methods['updatePot(address)']('0x1111111111111111111111111111111111111111')
      .send({ from: accounts[0] });
    await dsrWrapper.methods['pot()']()
      .call()
      .then((result) => {
        assert.equal(result, '0x1111111111111111111111111111111111111111');
      });
  });
});
