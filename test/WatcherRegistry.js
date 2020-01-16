import expectRevert from './helpers/expectRevert';

const { BN } = web3.utils;

const WatcherRegistry = artifacts.require('./WatcherRegistry');
const MockWatcher = artifacts.require('./MockWatcher');

const ZERO = '0x0000000000000000000000000000000000000000';
const ONE = '0x1111111111111111111111111111111111111111';
const TWO = '0x2222222222222222222222222222222222222222';

contract('WatcherRegistry', () => {
  let accounts;
  let watcherRegistry;
  let mockWatcher;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await MockWatcher.new({ from: accounts[0] })
      .then((result) => {
        mockWatcher = result.contract;
      });
    await WatcherRegistry.new(
      [mockWatcher.options.address],
      [[mockWatcher.options.address]],
      { from: accounts[0] },
    )
      .then((result) => {
        watcherRegistry = result.contract;
      });
  });

  it('should not deploy with wrong parameters', async () => {
    await expectRevert(
      WatcherRegistry.new([ONE], [[ZERO], [ONE]], { from: accounts[0] }),
    );
  });

  it('should be correct owner', async () => {
    await watcherRegistry.methods['owner()']()
      .call()
      .then((result) => {
        assert.equal(result, accounts[0]);
      });
  });

  it('should be correct watchers', async () => {
    await watcherRegistry.methods['getProtocolWatchers()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(result[0], mockWatcher.options.address);
      });
  });

  it('should be correct watcher assets', async () => {
    await watcherRegistry.methods['getProtocolWatcherAssets(address)'](mockWatcher.options.address)
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(result[0], mockWatcher.options.address);
      });
  });

  it('should not add watcher not by the owner', async () => {
    await expectRevert(
      watcherRegistry.methods['addProtocolWatcher(address,address[])'](ONE, [TWO])
        .send({ from: accounts[1] }),
    );
  });

  it('should add watcher by the owner', async () => {
    await watcherRegistry.methods['addProtocolWatcher(address,address[])'](ONE, [TWO])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['getProtocolWatchers()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(result[1], ONE);
      });
  });

  it('should not remove watcher not by the owner', async () => {
    await expectRevert(
      watcherRegistry.methods['removeProtocolWatcher(uint256)'](0)
        .send({ from: accounts[1] }),
    );
  });

  it('should not remove watcher with wrong index', async () => {
    await expectRevert(
      watcherRegistry.methods['removeProtocolWatcher(uint256)'](2)
        .send({
          from: accounts[0],
          gasLimit: '300000',
        }),
    );
  });

  it('should remove watcher by the owner', async () => {
    await watcherRegistry.methods['removeProtocolWatcher(uint256)'](0)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['getProtocolWatchers()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
    await watcherRegistry.methods['addProtocolWatcher(address,address[])'](ONE, [TWO])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['addProtocolWatcher(address,address[])'](TWO, [TWO])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['getProtocolWatchers()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
      });
    await watcherRegistry.methods['removeProtocolWatcher(uint256)'](0)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['getProtocolWatchers()']()
      .call()
      .then((result) => {
        assert.equal(result[0], TWO);
      });
    await watcherRegistry.methods['addProtocolWatcher(address,address[])'](ONE, [TWO])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['getProtocolWatchers()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
      });
    await watcherRegistry.methods['removeProtocolWatcher(uint256)'](1)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['getProtocolWatchers()']()
      .call()
      .then((result) => {
        assert.equal(result[0], TWO);
      });
  });

  it('should not add watcher asset not by the owner', async () => {
    await expectRevert(
      watcherRegistry.methods['addProtocolWatcherAsset(uint256,address)'](0, ONE)
        .send({ from: accounts[1] }),
    );
  });

  it('should not add watcher asset with wrong watcher index', async () => {
    await expectRevert(
      watcherRegistry.methods['addProtocolWatcherAsset(uint256,address)'](2, ONE)
        .send({
          from: accounts[0],
          gasLimit: '300000',
        }),
    );
  });

  it('should add watcher asset by the owner', async () => {
    await watcherRegistry.methods['addProtocolWatcherAsset(uint256,address)'](0, ONE)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['getProtocolWatcherAssets(address)'](mockWatcher.options.address)
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(result[1], ONE);
      });
  });

  it('should not remove watcher asset not by the owner', async () => {
    await expectRevert(
      watcherRegistry.methods['removeProtocolWatcherAsset(uint256,uint256)'](0, 0)
        .send({ from: accounts[1] }),
    );
  });

  it('should not remove watcher asset with wrong asset index', async () => {
    await expectRevert(
      watcherRegistry.methods['removeProtocolWatcherAsset(uint256,uint256)'](0, 2)
        .send({
          from: accounts[0],
          gasLimit: '300000',
        }),
    );
  });

  it('should not remove watcher asset with wrong watcher index', async () => {
    await expectRevert(
      watcherRegistry.methods['removeProtocolWatcherAsset(uint256,uint256)'](2, 0)
        .send({
          from: accounts[0],
          gasLimit: '300000',
        }),
    );
  });

  it('should remove watcher asset by the owner', async () => {
    await watcherRegistry.methods['removeProtocolWatcherAsset(uint256,uint256)'](0, 0)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['getProtocolWatcherAssets(address)'](mockWatcher.options.address)
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
    await watcherRegistry.methods['addProtocolWatcherAsset(uint256,address)'](0, ONE)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['addProtocolWatcherAsset(uint256,address)'](0, TWO)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['getProtocolWatcherAssets(address)'](mockWatcher.options.address)
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
      });
    await watcherRegistry.methods['removeProtocolWatcherAsset(uint256,uint256)'](0, 0)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['getProtocolWatcherAssets(address)'](mockWatcher.options.address)
      .call()
      .then((result) => {
        assert.equal(result[0], TWO);
      });
    await watcherRegistry.methods['addProtocolWatcherAsset(uint256,address)'](0, ONE)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['getProtocolWatcherAssets(address)'](mockWatcher.options.address)
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
      });
    await watcherRegistry.methods['removeProtocolWatcherAsset(uint256,uint256)'](0, 1)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['getProtocolWatcherAssets(address)'](mockWatcher.options.address)
      .call()
      .then((result) => {
        assert.equal(result[0], TWO);
      });
  });

  it('should not transfer ownership not by the owner', async () => {
    await expectRevert(
      watcherRegistry.methods['transferOwnership(address)'](accounts[1])
        .send({ from: accounts[1] }),
    );
  });

  it('should not transfer ownership to the zero address', async () => {
    await expectRevert(
      watcherRegistry.methods['transferOwnership(address)'](ZERO)
        .send({
          from: accounts[0],
          gasLimit: '300000',
        }),
    );
  });

  it('should transfer ownership by the owner', async () => {
    await watcherRegistry.methods['transferOwnership(address)'](accounts[1])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await watcherRegistry.methods['owner()']()
      .call()
      .then((result) => {
        assert.equal(result, accounts[1]);
      });
  });

  it('should be correct balance non-null', async () => {
    await watcherRegistry.methods['balanceOf(address)'](accounts[0])
      .call()
      .then((result) => {
        assert.equal(result[0].name, 'Mock');
        assert.equal(result[0].balances[0].asset, mockWatcher.options.address);
        assert.equal(result[0].balances[0].amount, new BN(1000));
        assert.equal(result[0].balances[0].decimals, 18);
      });
  });

  it('should be correct balance null', async () => {
    await watcherRegistry.methods['balanceOf(address)'](accounts[1])
      .call()
      .then((result) => {
        assert.equal(result[0].name, 'Mock');
        assert.equal(result[0].balances[0].asset, mockWatcher.options.address);
        assert.equal(result[0].balances[0].amount, new BN(0));
        assert.equal(result[0].balances[0].decimals, 18);
      });
  });
});
