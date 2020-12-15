import expectRevert from '../helpers/expectRevert';
import convertToBytes32 from '../helpers/convertToBytes32';

const ProtocolAdapterRegistry = artifacts.require('./ProtocolAdapterRegistry');
const ProtocolAdapter = artifacts.require('./MockAdapter');
// const TokenAdapter = artifacts.require('./ERC20TokenAdapter');
// const CompoundTokenAdapter = artifacts.require('./CompoundTokenAdapter');

const ZERO = '0x0000000000000000000000000000000000000000';
const ONE = '0x1111111111111111111111111111111111111111';
const TWO = '0x2222222222222222222222222222222222222222';

contract('ProtocolAdapterRegistry', () => {
  let accounts;
  let protocolAdapterRegistry;
  let protocolAdapterAddress;
  //  let tokenAdapterAddress;
  //  let compoundTokenAdapterAddress;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    await ProtocolAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterAddress = result.address;
      });
    //    await TokenAdapter.new({ from: accounts[0] })
    //      .then((result) => {
    //        tokenAdapterAddress = result.address;
    //      });
    //    await CompoundTokenAdapter.new({ from: accounts[0] })
    //      .then((result) => {
    //        compoundTokenAdapterAddress = result.address;
    //      });
    await ProtocolAdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterRegistry = result.contract;
      });
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [convertToBytes32('Mock')],
      [
        protocolAdapterAddress,
      ],
      [
        [protocolAdapterAddress, ONE],
      ],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });
    //    await protocolAdapterRegistry.methods.addTokenAdapters(
    //      [convertToBytes32('ERC20')],
    //      [tokenAdapterAddress],
    //    )
    //      .send({
    //        from: accounts[0],
    //        gas: '1000000',
    //      });
  });

  it('should be correct owner', async () => {
    await protocolAdapterRegistry.methods.owner()
      .call()
      .then((result) => {
        assert.equal(result, accounts[0]);
      });
  });

  it('should be correct protocols names', async () => {
    await protocolAdapterRegistry.methods.getProtocolAdapterNames()
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'Mock');
      });
  });

  it('should be correct protocol adapters', async () => {
    await protocolAdapterRegistry.methods.getProtocolAdapterAddress(convertToBytes32('Mock'))
      .call()
      .then((result) => {
        assert.equal(result, protocolAdapterAddress);
      });
  });

  it('should be correct supported tokens', async () => {
    await protocolAdapterRegistry.methods.getProtocolAdapterSupportedTokens(convertToBytes32('Mock'))
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(result[0], protocolAdapterAddress);
        assert.equal(result[1], ONE);
      });
  });

  it('should not add protocol adapter not by the owner', async () => {
    await expectRevert(protocolAdapterRegistry.methods.addProtocolAdapters(
      [
        convertToBytes32('Mock2'),
      ],
      [
        protocolAdapterAddress,
      ],
      [
        [protocolAdapterAddress],
      ],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not add protocol adapter with bad input (2 names)', async () => {
    await expectRevert(protocolAdapterRegistry.methods.addProtocolAdapters(
      [
        convertToBytes32('Mock2'),
        convertToBytes32('Mock3'),
      ],
      [
        protocolAdapterAddress,
      ],
      [
        [protocolAdapterAddress],
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol adapter with bad input (2 addresses)', async () => {
    await expectRevert(protocolAdapterRegistry.methods.addProtocolAdapters(
      [
        convertToBytes32('Mock2'),
      ],
      [
        protocolAdapterAddress,
        protocolAdapterAddress,
      ],
      [
        [protocolAdapterAddress],
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol adapter with bad input (2 sets of supported tokens)', async () => {
    await expectRevert(protocolAdapterRegistry.methods.addProtocolAdapters(
      [
        convertToBytes32('Mock2'),
      ],
      [
        protocolAdapterAddress,
      ],
      [
        [
          protocolAdapterAddress,
        ],
        [
          protocolAdapterAddress,
        ],
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol adapter with empty input', async () => {
    await expectRevert(protocolAdapterRegistry.methods.addProtocolAdapters(
      [],
      [],
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol adapter with existing name', async () => {
    await expectRevert(protocolAdapterRegistry.methods.addProtocolAdapters(
      [convertToBytes32('Mock')],
      [
        protocolAdapterAddress,
      ],
      [
        [protocolAdapterAddress],
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol adapter with zero adapter', async () => {
    await expectRevert(protocolAdapterRegistry.methods.addProtocolAdapters(
      [convertToBytes32('Mock2')],
      [
        ZERO,
      ],
      [
        [protocolAdapterAddress],
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should add protocol by the owner', async () => {
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [convertToBytes32('Mock2')],
      [
        ONE,
      ],
      [
        [protocolAdapterAddress],
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await protocolAdapterRegistry.methods.getProtocolAdapterNames()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(web3.utils.hexToUtf8(result[1]), 'Mock2');
      });
  });

  it('should not remove protocol not by the owner', async () => {
    await expectRevert(protocolAdapterRegistry.methods.removeProtocolAdapters(
      [convertToBytes32('Mock')],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not remove protocol with wrong name', async () => {
    await expectRevert(protocolAdapterRegistry.methods.removeProtocolAdapters(
      [convertToBytes32('Mock1')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not remove protocol with empty input', async () => {
    await expectRevert(protocolAdapterRegistry.methods.removeProtocolAdapters(
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should remove protocol by the owner', async () => {
    await protocolAdapterRegistry.methods.removeProtocolAdapters(
      [convertToBytes32('Mock')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await protocolAdapterRegistry.methods.getProtocolAdapterNames()
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [convertToBytes32('Mock2')],
      [
        protocolAdapterAddress,
      ],
      [
        [protocolAdapterAddress],
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [convertToBytes32('Mock1')],
      [
        protocolAdapterAddress,
      ],
      [
        [protocolAdapterAddress],
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await protocolAdapterRegistry.methods.getProtocolAdapterNames()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'Mock2');
        assert.equal(web3.utils.hexToUtf8(result[1]), 'Mock1');
      });
    await protocolAdapterRegistry.methods.removeProtocolAdapters(
      [convertToBytes32('Mock2')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await protocolAdapterRegistry.methods.getProtocolAdapterNames()
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'Mock1');
      });
    await protocolAdapterRegistry.methods.addProtocolAdapters(
      [convertToBytes32('Mock2')],
      [
        protocolAdapterAddress,
      ],
      [
        [protocolAdapterAddress],
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await protocolAdapterRegistry.methods.getProtocolAdapterNames()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'Mock1');
        assert.equal(web3.utils.hexToUtf8(result[1]), 'Mock2');
      });
    await protocolAdapterRegistry.methods.removeProtocolAdapters(
      [convertToBytes32('Mock2')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await protocolAdapterRegistry.methods.getProtocolAdapterNames()
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'Mock1');
      });
  });

  it('should not update protocol adapter not by the owner', async () => {
    await expectRevert(protocolAdapterRegistry.methods.updateProtocolAdapters(
      [convertToBytes32('Mock')],
      [ONE],
      [[]],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not update protocol adapter with wrong protocol name', async () => {
    await expectRevert(protocolAdapterRegistry.methods.updateProtocolAdapters(
      [convertToBytes32('Mock1')],
      [ONE],
      [[]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update protocol adapter with zero address', async () => {
    await expectRevert(protocolAdapterRegistry.methods.updateProtocolAdapters(
      [convertToBytes32('Mock')],
      [ZERO],
      [[ONE]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update protocol adapter with different lengths 1', async () => {
    await expectRevert(protocolAdapterRegistry.methods.updateProtocolAdapters(
      [convertToBytes32('Mock')],
      [ZERO, ZERO],
      [[ONE]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update protocol adapter with different lengths 2', async () => {
    await expectRevert(protocolAdapterRegistry.methods.updateProtocolAdapters(
      [convertToBytes32('Mock')],
      [ZERO],
      [[ONE], [ONE]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update protocol adapter with empty input', async () => {
    await expectRevert(protocolAdapterRegistry.methods.updateProtocolAdapters(
      [],
      [],
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should update protocol adapter by the owner', async () => {
    await protocolAdapterRegistry.methods.updateProtocolAdapters(
      [convertToBytes32('Mock')],
      [ONE],
      [[]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await protocolAdapterRegistry.methods.getProtocolAdapterAddress(convertToBytes32('Mock'))
      .call()
      .then((result) => {
        assert.equal(result, ONE);
      });
    await protocolAdapterRegistry.methods.updateProtocolAdapters(
      [convertToBytes32('Mock')],
      [ONE],
      [[ONE, ONE]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await protocolAdapterRegistry.methods.getProtocolAdapterSupportedTokens(convertToBytes32('Mock'))
      .call()
      .then((result) => {
        assert.deepEqual(result, [ONE, ONE]);
      });
    await protocolAdapterRegistry.methods.updateProtocolAdapters(
      [convertToBytes32('Mock')],
      [TWO],
      [[TWO, TWO]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await protocolAdapterRegistry.methods.getProtocolAdapterAddress(convertToBytes32('Mock'))
      .call()
      .then((result) => {
        assert.deepEqual(result, TWO);
      });
    await protocolAdapterRegistry.methods.getProtocolAdapterSupportedTokens(convertToBytes32('Mock'))
      .call()
      .then((result) => {
        assert.deepEqual(result, [TWO, TWO]);
      });
    await protocolAdapterRegistry.methods.updateProtocolAdapters(
      [convertToBytes32('Mock')],
      [TWO],
      [[]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await protocolAdapterRegistry.methods.getProtocolAdapterSupportedTokens(convertToBytes32('Mock'))
      .call()
      .then((result) => {
        assert.deepEqual(result, []);
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

  it('should be correct balances non-null', async () => {
    await protocolAdapterRegistry.methods.getBalances(accounts[0])
      .call()
      .then((result) => {
        assert.equal(
          result[0].protocolAdapterName,
          convertToBytes32('Mock'),
        );
        assert.deepEqual(
          result[0].tokenBalances[0],
          [
            protocolAdapterAddress,
            '1000',
          ],
        );
      });
    await protocolAdapterRegistry.methods.getBalances(accounts[1])
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
    //    await protocolAdapterRegistry.methods.getFullTokenBalances(
    //      [[
    //        convertToBytes32('ERC20'),
    //        protocolAdapterAddress,
    //        '1000',
    //      ]],
    //    )
    //      .call()
    //      .then((result) => {
    //        assert.deepEqual(
    //          result[0].base,
    //          [
    //            protocolAdapterAddress,
    //            '1000',
    //            [
    //              'Not available',
    //              'N/A',
    //              '0',
    //            ],
    //          ],
    //        );
    //      });
  });

  it('should be correct balances null', async () => {
    await protocolAdapterRegistry.methods.getBalances(accounts[1])
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
  });

  it('should not be correct balances with wrong adapter', async () => {
    await expectRevert(protocolAdapterRegistry.methods.getAdapterBalance(
      convertToBytes32('Mock3'),
      [],
      accounts[0],
    )
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      }));
  });
});
