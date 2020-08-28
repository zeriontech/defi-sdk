import expectRevert from '../helpers/expectRevert';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./MockAdapter');
const TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const CompoundTokenAdapter = artifacts.require('./CompoundTokenAdapter');

const ZERO = '0x0000000000000000000000000000000000000000';
const ONE = '0x1111111111111111111111111111111111111111';
const TWO = '0x2222222222222222222222222222222222222222';

contract.only('AdapterRegistry', () => {
  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let compoundTokenAdapterAddress;

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
    await CompoundTokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        compoundTokenAdapterAddress = result.address;
      });
    await AdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        adapterRegistry = result.contract;
      });
    await adapterRegistry.methods.addProtocolAdapters(
      [web3.utils.toHex('Mock')],
      [
        protocolAdapterAddress,
      ],
      [
        [protocolAdapterAddress],
      ],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
  });

  it('should be correct owner', async () => {
    await adapterRegistry.methods.owner()
      .call()
      .then((result) => {
        assert.equal(result, accounts[0]);
      });
  });

  it('should be correct token adapters names', async () => {
    await adapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'ERC20');
      });
  });

  it('should be correct token adapter', async () => {
    await adapterRegistry.methods.getTokenAdapterAddress(web3.utils.toHex('ERC20'))
      .call()
      .then((result) => {
        assert.equal(result, tokenAdapterAddress);
      });
  });

  it('should not add token adapter not by the owner', async () => {
    await expectRevert(adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ONE')],
      [ONE],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not add token adapter with different lengths', async () => {
    await expectRevert(adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ONE')],
      [ONE, TWO],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add token adapter with zero address', async () => {
    await expectRevert(adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ONE')],
      [ZERO],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add token adapter with empty name', async () => {
    await expectRevert(adapterRegistry.methods.addTokenAdapters(
      ['0x'],
      [ONE],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add token adapter with existing name', async () => {
    await expectRevert(adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [ONE],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add token adapter with empty input', async () => {
    await expectRevert(adapterRegistry.methods.addTokenAdapters(
      [],
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should add token adapter by the owner', async () => {
    await adapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('ERC20')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'ERC20');
      });
  });

  it('should not remove token adapter not by the owner', async () => {
    await expectRevert(adapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('ERC20')],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not remove token adapter with no names', async () => {
    await expectRevert(adapterRegistry.methods.removeTokenAdapters(
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not remove token adapter with bad name', async () => {
    await expectRevert(adapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('ERC220')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should remove token adapter by the owner', async () => {
    await adapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('ERC20')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('CToken')],
      [compoundTokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.deepEqual(result.map(web3.utils.hexToUtf8), ['ERC20', 'CToken']);
      });
    await adapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('ERC20')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.deepEqual(result.map(web3.utils.hexToUtf8), ['CToken']);
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.deepEqual(result.map(web3.utils.hexToUtf8), ['CToken', 'ERC20']);
      });
    await adapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('ERC20')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.deepEqual(result.map(web3.utils.hexToUtf8), ['CToken']);
      });
  });

  it('should not update token adapter not by the owner', async () => {
    await expectRevert(adapterRegistry.methods.updateTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [ONE],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not update token adapter with zero address', async () => {
    await expectRevert(adapterRegistry.methods.updateTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [ZERO],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update token adapter with same address', async () => {
    await expectRevert(adapterRegistry.methods.updateTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update token adapter with different lengths', async () => {
    await expectRevert(adapterRegistry.methods.updateTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [ZERO, ZERO],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update token adapter with empty input', async () => {
    await expectRevert(adapterRegistry.methods.updateTokenAdapters(
      [],
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update token adapter with bad name', async () => {
    await expectRevert(adapterRegistry.methods.updateTokenAdapters(
      [web3.utils.toHex('ERC220')],
      [ONE],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should update token adapter by the owner', async () => {
    let newTokenAdapterAddress;
    await TokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        newTokenAdapterAddress = result.address;
      });
    await adapterRegistry.methods.updateTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [newTokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getTokenAdapterAddress(web3.utils.toHex('ERC20'))
      .call()
      .then((result) => {
        assert.equal(result, newTokenAdapterAddress);
      });
  });

  it('should not transfer ownership not by the owner', async () => {
    await expectRevert(
      adapterRegistry.methods.transferOwnership(accounts[1])
        .send({ from: accounts[1] }),
    );
  });

  it('should not transfer ownership to the zero address', async () => {
    await expectRevert(
      adapterRegistry.methods.transferOwnership(ZERO)
        .send({
          from: accounts[0],
          gas: '300000',
        }),
    );
  });

  it('should transfer ownership by the owner', async () => {
    await adapterRegistry.methods.transferOwnership(accounts[1])
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.owner()
      .call()
      .then((result) => {
        assert.equal(result, accounts[1]);
      });
  });
});
