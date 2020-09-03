import expectRevert from '../helpers/expectRevert';

const TokenAdapterRegistry = artifacts.require('./TokenAdapterRegistry');
const ProtocolAdapter = artifacts.require('./MockAdapter');
const TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const CompoundTokenAdapter = artifacts.require('./CompoundTokenAdapter');

const ZERO = '0x0000000000000000000000000000000000000000';
const ONE = '0x1111111111111111111111111111111111111111';
const TWO = '0x2222222222222222222222222222222222222222';

contract.only('AdapterRegistry', () => {
  let accounts;
  let tokenAdapterRegistry;
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
    await TokenAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapterRegistry = result.contract;
      });
    await tokenAdapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
  });

  it('should be correct owner', async () => {
    await tokenAdapterRegistry.methods.owner()
      .call()
      .then((result) => {
        assert.equal(result, accounts[0]);
      });
  });

  it('should be correct token adapters names', async () => {
    await tokenAdapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'ERC20');
      });
  });

  it('should be correct token adapter', async () => {
    await tokenAdapterRegistry.methods.getTokenAdapterAddress(web3.utils.toHex('ERC20'))
      .call()
      .then((result) => {
        assert.equal(result, tokenAdapterAddress);
      });
  });

  it('should not add token adapter not by the owner', async () => {
    await expectRevert(tokenAdapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ONE')],
      [ONE],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not add token adapter with different lengths', async () => {
    await expectRevert(tokenAdapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ONE')],
      [ONE, TWO],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add token adapter with zero address', async () => {
    await expectRevert(tokenAdapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ONE')],
      [ZERO],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add token adapter with empty name', async () => {
    await expectRevert(tokenAdapterRegistry.methods.addTokenAdapters(
      ['0x'],
      [ONE],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add token adapter with existing name', async () => {
    await expectRevert(tokenAdapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [ONE],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add token adapter with empty input', async () => {
    await expectRevert(tokenAdapterRegistry.methods.addTokenAdapters(
      [],
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should add token adapter by the owner', async () => {
    await tokenAdapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('ERC20')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'ERC20');
      });
  });

  it('should not remove token adapter not by the owner', async () => {
    await expectRevert(tokenAdapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('ERC20')],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not remove token adapter with no names', async () => {
    await expectRevert(tokenAdapterRegistry.methods.removeTokenAdapters(
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not remove token adapter with bad name', async () => {
    await expectRevert(tokenAdapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('ERC220')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should remove token adapter by the owner', async () => {
    await tokenAdapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('ERC20')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
    await tokenAdapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('CToken')],
      [compoundTokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.deepEqual(result.map(web3.utils.hexToUtf8), ['ERC20', 'CToken']);
      });
    await tokenAdapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('ERC20')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.deepEqual(result.map(web3.utils.hexToUtf8), ['CToken']);
      });
    await tokenAdapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.deepEqual(result.map(web3.utils.hexToUtf8), ['CToken', 'ERC20']);
      });
    await tokenAdapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('ERC20')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterNames()
      .call()
      .then((result) => {
        assert.deepEqual(result.map(web3.utils.hexToUtf8), ['CToken']);
      });
  });

  it('should not update token adapter not by the owner', async () => {
    await expectRevert(tokenAdapterRegistry.methods.updateTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [ONE],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not update token adapter with zero address', async () => {
    await expectRevert(tokenAdapterRegistry.methods.updateTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [ZERO],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update token adapter with same address', async () => {
    await expectRevert(tokenAdapterRegistry.methods.updateTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update token adapter with different lengths', async () => {
    await expectRevert(tokenAdapterRegistry.methods.updateTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [ZERO, ZERO],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update token adapter with empty input', async () => {
    await expectRevert(tokenAdapterRegistry.methods.updateTokenAdapters(
      [],
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update token adapter with bad name', async () => {
    await expectRevert(tokenAdapterRegistry.methods.updateTokenAdapters(
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
    await tokenAdapterRegistry.methods.updateTokenAdapters(
      [web3.utils.toHex('ERC20')],
      [newTokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterAddress(web3.utils.toHex('ERC20'))
      .call()
      .then((result) => {
        assert.equal(result, newTokenAdapterAddress);
      });
  });

  it('should not propose ownership not by the owner', async () => {
    await expectRevert(
      protocolAdapterRegistry.methods.proposeOwnership(accounts[1])
        .send({ from: accounts[1] }),
    );
  });

  it('should not propose ownership to the zero address', async () => {
    await expectRevert(
      protocolAdapterRegistry.methods.proposeOwnership(ZERO)
        .send({
          from: accounts[0],
          gas: '300000',
        }),
    );
  });

  it('should propose ownership by the owner', async () => {
    await protocolAdapterRegistry.methods.proposeOwnership(accounts[1])
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await protocolAdapterRegistry.methods.pendingOwner()
      .call()
      .then((result) => {
        assert.equal(result, accounts[1]);
      });
    await expectRevert(
      protocolAdapterRegistry.methods.acceptOwnership()
        .send({
          from: accounts[0],
          gas: '300000',
        }),
    );
    await protocolAdapterRegistry.methods.acceptOwnership()
      .send({
        from: accounts[1],
        gas: '300000',
      });
    await protocolAdapterRegistry.methods.owner()
      .call()
      .then((result) => {
        assert.equal(result, accounts[1]);
      });
  });
});
