import expectRevert from '../helpers/expectRevert';

const TokenAdapterRegistry = artifacts.require('./TokenAdapterRegistry');
// const ProtocolAdapter = artifacts.require('./MockAdapter');
const TokenAdapter = artifacts.require('./ERC20TokenAdapter');
const CompoundTokenAdapter = artifacts.require('./CompoundTokenAdapter');

const ZERO = '0x0000000000000000000000000000000000000000';
const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ONE = '0x1111111111111111111111111111111111111111';
const TWO = '0x2222222222222222222222222222222222222222';

contract.only('TokenAdapterRegistry', () => {
  const cDAIAddress = '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';
  const cDAIHash = '0x3f1d4a4e2a03855c7ee8f6f2477c1245752a5ca3ef28d59e8fd509efe59ef877';
  //  const cUSDCAddress = '0x39AA39c021dfbaE8faC545936693aC917d5E7563';
  //  const cUSDCHash = '0x37ead445e87de4842ff3f791ad73f3c3d1fd963d5b7a1735f8d3490547152074';
  //  const cETHAddress = '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5';
  //  const cETHHash = '0x5ee0e4991c3aedc27dca3ab6f3fe0dd810e281c6565e68ba93cb62ee6bd6d858';
  //  const univ2Hash = '0x5b83bdbcc56b2e630f2807bbadd2b0c21619108066b92a58de081261089e9ce5';

  let accounts;
  let tokenAdapterRegistry;
  //  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let compoundTokenAdapterAddress;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    //    await ProtocolAdapter.new({ from: accounts[0] })
    //      .then((result) => {
    //        protocolAdapterAddress = result.address;
    //      });
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
      [ZERO_BYTES32, web3.utils.toHex('ERC20'), web3.utils.toHex('CToken')],
      [tokenAdapterAddress, tokenAdapterAddress, compoundTokenAdapterAddress],
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
        assert.equal(result.length, 3);
        assert.equal(result[0], ZERO_BYTES32);
        assert.equal(web3.utils.hexToUtf8(result[1]), 'ERC20');
        assert.equal(web3.utils.hexToUtf8(result[2]), 'CToken');
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
      [web3.utils.toHex('ERC20'), web3.utils.toHex('CToken'), ZERO_BYTES32],
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
      [web3.utils.toHex('ERC20'), web3.utils.toHex('CToken'), ZERO_BYTES32],
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
      tokenAdapterRegistry.methods.proposeOwnership(accounts[1])
        .send({ from: accounts[1] }),
    );
  });

  it('should not propose ownership to the zero address', async () => {
    await expectRevert(
      tokenAdapterRegistry.methods.proposeOwnership(ZERO)
        .send({
          from: accounts[0],
          gas: '300000',
        }),
    );
  });

  it('should not propose ownership to the owner', async () => {
    await expectRevert(
      tokenAdapterRegistry.methods.proposeOwnership(accounts[0])
        .send({
          from: accounts[0],
          gas: '300000',
        }),
    );
  });

  it('should propose ownership by the owner', async () => {
    await tokenAdapterRegistry.methods.proposeOwnership(accounts[1])
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.pendingOwner()
      .call()
      .then((result) => {
        assert.equal(result, accounts[1]);
      });
    await expectRevert(
      tokenAdapterRegistry.methods.proposeOwnership(accounts[1])
        .send({
          from: accounts[0],
          gas: '300000',
        }),
    );
    await expectRevert(
      tokenAdapterRegistry.methods.acceptOwnership()
        .send({
          from: accounts[0],
          gas: '300000',
        }),
    );
    await tokenAdapterRegistry.methods.acceptOwnership()
      .send({
        from: accounts[1],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.owner()
      .call()
      .then((result) => {
        assert.equal(result, accounts[1]);
      });
  });

  it('should not add token adapter name by token by the owner', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
  });

  it('should not add token adapter name by token not by the owner', async () => {
    await expectRevert(tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not add token adapter name by token with zero address', async () => {
    await expectRevert(tokenAdapterRegistry.methods.addTokenAdapterNames(
      [ZERO],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add token adapter name by token with zero name', async () => {
    await expectRevert(tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [ZERO_BYTES32],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add token adapter name by token with empty list', async () => {
    await expectRevert(tokenAdapterRegistry.methods.addTokenAdapterNames(
      [],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add token adapter name by token with inconsistent lists', async () => {
    await expectRevert(tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add token adapter name by existing token', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await expectRevert(tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should add token adapter name by token by the owner', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterName(cDAIAddress)
      .call()
      .then((result) => {
        assert.equal(
          result,
          web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken')),
        );
      });
  });

  it('should not remove token adapter name by token not by the owner', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterName(cDAIAddress)
      .call()
      .then((result) => {
        assert.equal(
          result,
          web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken')),
        );
      });
    await expectRevert(tokenAdapterRegistry.methods.removeTokenAdapterNames(
      [cDAIAddress],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not remove token adapter name by token with empty list', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterName(cDAIAddress)
      .call()
      .then((result) => {
        assert.equal(
          result,
          web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken')),
        );
      });
    await expectRevert(tokenAdapterRegistry.methods.removeTokenAdapterNames(
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not remove token adapter name by token with removed name', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterName(cDAIAddress)
      .call()
      .then((result) => {
        assert.equal(
          result,
          web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken')),
        );
      });
    await tokenAdapterRegistry.methods.removeTokenAdapterNames(
      [cDAIAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await expectRevert(tokenAdapterRegistry.methods.removeTokenAdapterNames(
      [cDAIAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should remove token adapter name by token by the owner', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterName(cDAIAddress)
      .call()
      .then((result) => {
        assert.equal(
          result,
          web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken')),
        );
      });
    await tokenAdapterRegistry.methods.removeTokenAdapterNames(
      [cDAIAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterName(cDAIAddress)
      .call()
      .then((result) => {
        assert.equal(result, ZERO_BYTES32);
      });
  });

  it('should not update token adapter name by token not by the owner', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterName(cDAIAddress)
      .call()
      .then((result) => {
        assert.equal(
          result,
          web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken')),
        );
      });
    await expectRevert(tokenAdapterRegistry.methods.updateTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('New CToken'))],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not update token adapter name by token with empty list', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterName(cDAIAddress)
      .call()
      .then((result) => {
        assert.equal(
          result,
          web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken')),
        );
      });
    await expectRevert(tokenAdapterRegistry.methods.updateTokenAdapterNames(
      [],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('New CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update token adapter name by token with inconsistent lists', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterName(cDAIAddress)
      .call()
      .then((result) => {
        assert.equal(
          result,
          web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken')),
        );
      });
    await expectRevert(tokenAdapterRegistry.methods.updateTokenAdapterNames(
      [cDAIAddress],
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update token adapter name by token with zero address', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterName(cDAIAddress)
      .call()
      .then((result) => {
        assert.equal(
          result,
          web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken')),
        );
      });
    await expectRevert(tokenAdapterRegistry.methods.updateTokenAdapterNames(
      [ZERO],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('New CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update token adapter name by token with same name', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterName(cDAIAddress)
      .call()
      .then((result) => {
        assert.equal(
          result,
          web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken')),
        );
      });
    await expectRevert(tokenAdapterRegistry.methods.updateTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update token adapter name by token with zero name', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterName(cDAIAddress)
      .call()
      .then((result) => {
        assert.equal(
          result,
          web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken')),
        );
      });
    await expectRevert(tokenAdapterRegistry.methods.updateTokenAdapterNames(
      [cDAIAddress],
      [ZERO_BYTES32],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should update token adapter name by token by the owner', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterName(cDAIAddress)
      .call()
      .then((result) => {
        assert.equal(
          result,
          web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken')),
        );
      });
    await tokenAdapterRegistry.methods.updateTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('New CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods.getTokenAdapterName(cDAIAddress)
      .call()
      .then((result) => {
        assert.equal(result, web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('New CToken')));
      });
  });

  it('should get token hash', async () => {
    await tokenAdapterRegistry.methods.getTokenHash(
      cDAIAddress,
    )
      .call()
      .then((result) => {
        console.log(`contract hash is ${result}`);
        assert.equal(result, cDAIHash);
      });
  });

  // The following tests fail because of the issue in Truffle
  it('should get full token balance by tokens', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods['getFullTokenBalances(address[])'](
      [cDAIAddress],
    )
      .call()
      .then((result) => {
        assert.deepEqual(
          result[0].base.erc20metadata,
          ['Compound Dai', 'cDAI', '8'],
        );
        assert.deepEqual(
          result[0].underlying[0].erc20metadata,
          ['Dai Stablecoin', 'DAI', '18'],
        );
      });
  });

  it.skip('should get full token balance by token balances', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods['getFullTokenBalances((address,int256)[])'](
      [
        [cDAIAddress, '50000000'],
      ],
    )
      .call()
      .then((result) => {
        console.dir(result[0], { depth: null });
        assert.deepEqual(
          result[0].base.erc20metadata,
          ['Compound Dai', 'cDAI', '8'],
        );
        assert.deepEqual(
          result[0].underlying[0].erc20metadata,
          ['Dai Stablecoin', 'DAI', '18'],
        );
      });
  });

  it.skip('should get final full token balance by tokens', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods['getFinalFullTokenBalances(address[])'](
      [cDAIAddress],
    )
      .call()
      .then((result) => {
        console.dir(result[0], { depth: null });
        assert.deepEqual(
          result[0].base.erc20metadata,
          ['Compound Dai', 'cDAI', '8'],
        );
        assert.deepEqual(
          result[0].underlying[0].erc20metadata,
          ['Dai Stablecoin', 'DAI', '18'],
        );
      });
  });

  it.skip('should get final full token balance by token balances', async () => {
    await tokenAdapterRegistry.methods.addTokenAdapterNames(
      [cDAIAddress],
      [web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('CToken'))],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await tokenAdapterRegistry.methods['getFinalFullTokenBalances((address,int256)[])'](
      [
        [cDAIAddress, '50000000'],
      ],
    )
      .call()
      .then((result) => {
        console.dir(result[0], { depth: null });
        assert.deepEqual(
          result[0].base.erc20metadata,
          ['Compound Dai', 'cDAI', '8'],
        );
        assert.deepEqual(
          result[0].underlying[0].erc20metadata,
          ['Dai Stablecoin', 'DAI', '18'],
        );
      });
  });
});
