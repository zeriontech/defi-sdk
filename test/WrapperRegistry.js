import expectRevert from './helpers/expectRevert';
// import { increaseTimeTo, increaseTime } from './helpers/increaseTime';
const { BN } = web3.utils;

const WrapperRegistry = artifacts.require('./WrapperRegistry');
const MockProtocolWrapper = artifacts.require('./ProtocolWrapperMock');

contract('WrapperRegistry', () => {
  let accounts;
  let wrapperRegistry;
  let mockProtocolWrapper;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await MockProtocolWrapper.new()
      .then((result) => {
        mockProtocolWrapper = result.contract;
      });
    await WrapperRegistry.new([mockProtocolWrapper.options.address])
      .then((result) => {
        wrapperRegistry = result.contract;
      });
  });

  it('should be correct owner', async () => {
    await wrapperRegistry.methods['owner()']()
      .call()
      .then((result) => {
        assert.equal(result, accounts[0]);
      });
  });

  it('should be correct wrappers', async () => {
    await wrapperRegistry.methods['getProtocolWrappers()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(result[0], mockProtocolWrapper.options.address);
      });
  });

  it('should not add protocol not by the owner', async () => {
    await expectRevert(
      wrapperRegistry.methods['addProtocolWrapper(address)']('0x1111111111111111111111111111111111111111')
        .send({ from: accounts[1] }),
    );
  });

  it('should add protocol by the owner', async () => {
    await wrapperRegistry.methods['addProtocolWrapper(address)']('0x1111111111111111111111111111111111111111')
      .send({ from: accounts[0] });
    await wrapperRegistry.methods['getProtocolWrappers()']().call().then((result) => {
      assert.equal(result.length, 2);
      assert.equal(result[1], '0x1111111111111111111111111111111111111111');
    });
  });

  it('should not remove protocol not by the owner', async () => {
    await expectRevert(
      wrapperRegistry.methods['removeProtocolWrapper(uint256)'](0)
        .send({ from: accounts[1] }),
    );
  });

  it('should not remove protocol with wrong index', async () => {
    await expectRevert(
      wrapperRegistry.methods['removeProtocolWrapper(uint256)'](2)
        .send({ from: accounts[0] }),
    );
  });

  it('should remove protocol by the owner', async () => {
    await wrapperRegistry.methods['removeProtocolWrapper(uint256)'](0)
      .send({ from: accounts[0] });
    await wrapperRegistry.methods['getProtocolWrappers()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
    await wrapperRegistry.methods['addProtocolWrapper(address)']('0x1111111111111111111111111111111111111111')
      .send({ from: accounts[0] });
    await wrapperRegistry.methods['addProtocolWrapper(address)']('0x2222222222222222222222222222222222222222')
      .send({ from: accounts[0] });
    await wrapperRegistry.methods['getProtocolWrappers()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
      });
    await wrapperRegistry.methods['removeProtocolWrapper(uint256)'](0)
      .send({ from: accounts[0] });
    await wrapperRegistry.methods['getProtocolWrappers()']()
      .call()
      .then((result) => {
        assert.equal(result[0], '0x2222222222222222222222222222222222222222');
      });
    await wrapperRegistry.methods['addProtocolWrapper(address)']('0x1111111111111111111111111111111111111111')
      .send({ from: accounts[0] });
    await wrapperRegistry.methods['getProtocolWrappers()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
      });
    await wrapperRegistry.methods['removeProtocolWrapper(uint256)'](1)
      .send({ from: accounts[0] });
    await wrapperRegistry.methods['getProtocolWrappers()']()
      .call()
      .then((result) => {
        assert.equal(result[0], '0x2222222222222222222222222222222222222222');
      });
  });

  it('should be correct balance non-null', async () => {
    await wrapperRegistry.methods['balance(address)'](accounts[0])
      .call()
      .then((result) => {
        assert.equal(result[0].name, 'Mock');
        assert.equal(result[0].balances[0].asset, '0x000000000000000000000000000000000000007B');
        assert.equal(result[0].balances[0].amount, new BN(1000));
        assert.equal(result[0].balances[0].decimals, 18);
      });
  });

  it('should be correct balance null', async () => {
    await wrapperRegistry.methods['balance(address)'](accounts[1])
      .call()
      .then((result) => {
        assert.equal(result[0].name, 'Mock');
        assert.equal(result[0].balances[0].asset, '0x000000000000000000000000000000000000007B');
        assert.equal(result[0].balances[0].amount, new BN(0));
        assert.equal(result[0].balances[0].decimals, 18);
      });
  });
});
