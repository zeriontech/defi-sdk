import expectRevert from './helpers/expectRevert';

const { BN } = web3.utils;

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const MockAdapter = artifacts.require('./MockAdapter');

const ZERO = '0x0000000000000000000000000000000000000000';
const ONE = '0x1111111111111111111111111111111111111111';
const TWO = '0x2222222222222222222222222222222222222222';
const THREE = '0x3333333333333333333333333333333333333333';
const INITIAL_ADAPTER = '0x0000000000000000000000000000000000000001';

contract('AdapterRegistry', () => {
  let accounts;
  let adapterRegistry;
  let mockAdapter;
  let mockAdapterAddress;
  let mockProtocol;
  let mockAsset;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await MockAdapter.new({ from: accounts[0] })
      .then((result) => {
        mockAdapter = result.contract;
        mockAdapterAddress = mockAdapter.options.address;
      });
    await AdapterRegistry.new(
      [mockAdapterAddress],
      [[mockAdapterAddress]],
      { from: accounts[0] },
    )
      .then((result) => {
        adapterRegistry = result.contract;
      });
    mockProtocol = [
      'Mock',
      'Mock protocol',
      'Deposit',
      'mock.png',
      '1',
    ];
    mockAsset = [
      mockAdapterAddress,
      '18',
      'MOCK',
    ];
  });

  it('should not deploy with wrong parameters', async () => {
    await expectRevert(
      AdapterRegistry.new([ONE], [[ZERO], [ONE]], { from: accounts[0] }),
    );
  });

  it('should be correct owner', async () => {
    await adapterRegistry.methods['owner()']()
      .call()
      .then((result) => {
        assert.equal(result, accounts[0]);
      });
  });

  it('should be correct adapters', async () => {
    await adapterRegistry.methods['getAdapters()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(result[0], mockAdapterAddress);
      });
  });

  it('should be correct adapter assets', async () => {
    await adapterRegistry.methods['getAdapterAssets(address)'](mockAdapterAddress)
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(result[0], mockAdapterAddress);
      });
  });

  it('should not add adapter not by the owner', async () => {
    await expectRevert(
      adapterRegistry.methods['addAdapter(address,address[])'](ONE, [TWO])
        .send({ from: accounts[1] }),
    );
  });

  it('should not add ZERO adapter', async () => {
    await expectRevert(
      adapterRegistry.methods['addAdapter(address,address[])'](ZERO, [TWO])
        .send({ from: accounts[0] }),
    );
  });

  it('should not add INITIAL_ADAPTER adapter', async () => {
    await expectRevert(
      adapterRegistry.methods['addAdapter(address,address[])'](INITIAL_ADAPTER, [TWO])
        .send({ from: accounts[0] }),
    );
  });

  it('should not add existing adapter', async () => {
    await expectRevert(
      adapterRegistry.methods['addAdapter(address,address[])'](mockAdapterAddress, [TWO])
        .send({ from: accounts[0] }),
    );
  });

  it('should add adapter by the owner', async () => {
    await adapterRegistry.methods['addAdapter(address,address[])'](ONE, [TWO])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapters()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(result[0], ONE);
      });
  });

  it('should not remove adapter not by the owner', async () => {
    await expectRevert(
      adapterRegistry.methods['removeAdapter(address)'](mockAdapterAddress)
        .send({ from: accounts[1] }),
    );
  });

  it('should not remove adapter with wrong address', async () => {
    await expectRevert(
      adapterRegistry.methods['removeAdapter(address)'](ONE)
        .send({
          from: accounts[0],
          gasLimit: '300000',
        }),
    );
  });

  it('should remove adapter by the owner', async () => {
    await adapterRegistry.methods['removeAdapter(address)'](mockAdapterAddress)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapters()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
    await adapterRegistry.methods['addAdapter(address,address[])'](TWO, [TWO])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['addAdapter(address,address[])'](ONE, [TWO])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapters()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(result[0], ONE);
        assert.equal(result[1], TWO);
      });
    await adapterRegistry.methods['removeAdapter(address)'](ONE)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapters()']()
      .call()
      .then((result) => {
        assert.equal(result[0], TWO);
      });
    await adapterRegistry.methods['addAdapter(address,address[])'](ONE, [TWO])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapters()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(result[0], ONE);
        assert.equal(result[1], TWO);
      });
    await adapterRegistry.methods['removeAdapter(address)'](TWO)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapters()']()
      .call()
      .then((result) => {
        assert.equal(result[0], ONE);
      });
  });

  it('should not replace adapter not by the owner', async () => {
    await expectRevert(
      adapterRegistry.methods['replaceAdapter(address,address,address[])'](mockAdapterAddress, ONE, [])
        .send({ from: accounts[1] }),
    );
  });

  it('should not replace adapter with wrong address', async () => {
    await expectRevert(
      adapterRegistry.methods['replaceAdapter(address,address,address[])'](ONE, TWO, [])
        .send({
          from: accounts[0],
          gasLimit: '300000',
        }),
    );
  });

  it('should not replace for ZERO adapter', async () => {
    await expectRevert(
      adapterRegistry.methods['replaceAdapter(address,address,address[])'](mockAdapterAddress, ZERO, [])
        .send({ from: accounts[0] }),
    );
  });

  it('should not replace for INITIAL_ADAPTER adapter', async () => {
    await expectRevert(
      adapterRegistry.methods['replaceAdapter(address,address,address[])'](mockAdapterAddress, INITIAL_ADAPTER, [])
        .send({ from: accounts[0] }),
    );
  });

  it('should not replace for existing adapter', async () => {
    await expectRevert(
      adapterRegistry.methods['replaceAdapter(address,address,address[])'](mockAdapterAddress, mockAdapterAddress, [])
        .send({ from: accounts[0] }),
    );
  });

  it('should replace adapter by the owner', async () => {
    await adapterRegistry.methods['removeAdapter(address)'](mockAdapterAddress)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapters()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
    await adapterRegistry.methods['addAdapter(address,address[])'](TWO, [TWO])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['addAdapter(address,address[])'](ONE, [TWO])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapters()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(result[0], ONE);
        assert.equal(result[1], TWO);
      });
    await adapterRegistry.methods['replaceAdapter(address,address,address[])'](ONE, THREE, [THREE])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapters()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(result[0], THREE);
        assert.equal(result[1], TWO);
      });
    await adapterRegistry.methods['getAdapterAssets(address)'](THREE)
      .call()
      .then((result) => {
        assert.equal(result[0], THREE);
      });
    await adapterRegistry.methods['removeAdapter(address)'](THREE)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['addAdapter(address,address[])'](ONE, [ONE])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapters()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(result[0], ONE);
        assert.equal(result[1], TWO);
      });
    await adapterRegistry.methods['replaceAdapter(address,address,address[])'](ONE, THREE, [])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapters()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(result[0], THREE);
        assert.equal(result[1], TWO);
      });
    await adapterRegistry.methods['getAdapterAssets(address)'](THREE)
      .call()
      .then((result) => {
        assert.equal(result[0], ONE);
      });
  });

  it('should not add adapter asset not by the owner', async () => {
    await expectRevert(
      adapterRegistry.methods['addAdapterAsset(address,address)'](mockAdapterAddress, ONE)
        .send({ from: accounts[1] }),
    );
  });

  it('should not add adapter asset with wrong adapter address', async () => {
    await expectRevert(
      adapterRegistry.methods['addAdapterAsset(address,address)'](ONE, ONE)
        .send({
          from: accounts[0],
          gasLimit: '300000',
        }),
    );
  });

  it('should add adapter asset by the owner', async () => {
    await adapterRegistry.methods['addAdapterAsset(address,address)'](mockAdapterAddress, ONE)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapterAssets(address)'](mockAdapterAddress)
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(result[1], ONE);
      });
  });

  it('should not remove adapter asset not by the owner', async () => {
    await expectRevert(
      adapterRegistry.methods['removeAdapterAsset(address,uint256)'](mockAdapterAddress, 0)
        .send({ from: accounts[1] }),
    );
  });

  it('should not remove adapter asset with wrong asset index', async () => {
    await expectRevert(
      adapterRegistry.methods['removeAdapterAsset(address,uint256)'](mockAdapterAddress, 2)
        .send({
          from: accounts[0],
          gasLimit: '300000',
        }),
    );
  });

  it('should not remove adapter asset with wrong adapter address', async () => {
    await expectRevert(
      adapterRegistry.methods['removeAdapterAsset(address,uint256)'](ONE, 0)
        .send({
          from: accounts[0],
          gasLimit: '300000',
        }),
    );
  });

  it('should remove adapter asset by the owner', async () => {
    await adapterRegistry.methods['removeAdapterAsset(address,uint256)'](mockAdapterAddress, 0)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapterAssets(address)'](mockAdapterAddress)
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
    await adapterRegistry.methods['addAdapterAsset(address,address)'](mockAdapterAddress, ONE)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['addAdapterAsset(address,address)'](mockAdapterAddress, TWO)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapterAssets(address)'](mockAdapterAddress)
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(result[0], ONE);
        assert.equal(result[1], TWO);
      });
    await adapterRegistry.methods['removeAdapterAsset(address,uint256)'](mockAdapterAddress, 0)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapterAssets(address)'](mockAdapterAddress)
      .call()
      .then((result) => {
        assert.equal(result[0], TWO);
      });
    await adapterRegistry.methods['addAdapterAsset(address,address)'](mockAdapterAddress, ONE)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapterAssets(address)'](mockAdapterAddress)
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(result[0], TWO);
        assert.equal(result[1], ONE);
      });
    await adapterRegistry.methods['removeAdapterAsset(address,uint256)'](mockAdapterAddress, 1)
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['getAdapterAssets(address)'](mockAdapterAddress)
      .call()
      .then((result) => {
        assert.equal(result[0], TWO);
      });
  });

  it('should not transfer ownership not by the owner', async () => {
    await expectRevert(
      adapterRegistry.methods['transferOwnership(address)'](accounts[1])
        .send({ from: accounts[1] }),
    );
  });

  it('should not transfer ownership to the zero address', async () => {
    await expectRevert(
      adapterRegistry.methods['transferOwnership(address)'](ZERO)
        .send({
          from: accounts[0],
          gasLimit: '300000',
        }),
    );
  });

  it('should transfer ownership by the owner', async () => {
    await adapterRegistry.methods['transferOwnership(address)'](accounts[1])
      .send({
        from: accounts[0],
        gasLimit: '300000',
      });
    await adapterRegistry.methods['owner()']()
      .call()
      .then((result) => {
        assert.equal(result, accounts[1]);
      });
  });

  it('should be correct balances and rates non-null', async () => {
    await adapterRegistry.methods['getProtocolsBalancesAndRates(address)'](accounts[0])
      .call()
      .then((result) => {
        assert.deepEqual(result[0].protocol, mockProtocol);
        assert.deepEqual(result[0].balances[0].asset, mockAsset);
        assert.equal(result[0].balances[0].balance, new BN(1000));
        assert.deepEqual(result[0].rates[0].components[0].underlying, mockAsset);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
      });
  });

  it('should be correct balances non-null', async () => {
    await adapterRegistry.methods['getProtocolsBalances(address)'](accounts[0])
      .call()
      .then((result) => {
        assert.deepEqual(result[0].protocol, mockProtocol);
        assert.deepEqual(result[0].balances[0].asset, mockAsset);
        assert.equal(result[0].balances[0].balance, new BN(1000));
      });
  });

  it('should be correct rates non-null', async () => {
    await adapterRegistry.methods['getProtocolsRates()']()
      .call()
      .then((result) => {
        assert.deepEqual(result[0].protocol, mockProtocol);
        assert.deepEqual(result[0].rates[0].components[0].underlying, mockAsset);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
      });
  });

  it('should be correct balance null', async () => {
    await adapterRegistry.methods['getProtocolsBalancesAndRates(address)'](accounts[1])
      .call()
      .then((result) => {
        assert.deepEqual(result[0].protocol, mockProtocol);
        assert.deepEqual(result[0].balances[0].asset, mockAsset);
        assert.equal(result[0].balances[0].balance, new BN(0));
        assert.deepEqual(result[0].rates[0].components[0].underlying, mockAsset);
        assert.equal(result[0].rates[0].components[0].rate, 1e18);
      });
  });
});
