import expectRevert from './helpers/expectRevert';

const AdapterRegistry = artifacts.require('./AdapterRegistry');
const ProtocolAdapter = artifacts.require('./MockAdapter');
const TokenAdapter = artifacts.require('./MockTokenAdapter');

const ZERO = '0x0000000000000000000000000000000000000000';
const ONE = '0x1111111111111111111111111111111111111111';
const TWO = '0x2222222222222222222222222222222222222222';

contract('AdapterRegistry', () => {
  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;
  let mockAsset;

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
    await AdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        adapterRegistry = result.contract;
      });
    await adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Mock')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        protocolAdapterAddress,
      ]],
      [[[
        protocolAdapterAddress,
      ]]],
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
    mockAsset = [
      protocolAdapterAddress,
      'Mock',
      'MCK',
      '18',
    ];
  });

  it('should be correct owner', async () => {
    await adapterRegistry.methods.owner()
      .call()
      .then((result) => {
        assert.equal(result, accounts[0]);
      });
  });

  it('should be correct protocols names', async () => {
    await adapterRegistry.methods.getProtocolNames()
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'Mock');
      });
  });

  it('should be correct protocol adapters', async () => {
    await adapterRegistry.methods.getProtocolAdapters(web3.utils.toHex('Mock'))
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(result[0], protocolAdapterAddress);
      });
  });

  it('should be correct supported tokens', async () => {
    await adapterRegistry.methods.getSupportedTokens(protocolAdapterAddress)
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(result[0], protocolAdapterAddress);
      });
  });

  it('should be correct protocol metadata', async () => {
    await adapterRegistry.methods.getProtocolMetadata(web3.utils.toHex('Mock'))
      .call()
      .then((result) => {
        assert.equal(result.name, 'Mock Protocol Name');
        assert.equal(result.description, 'Mock protocol description');
        assert.equal(result.websiteURL, 'Mock website');
        assert.equal(result.iconURL, 'Mock icon');
        assert.equal(result.version, '0');
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
    await adapterRegistry.methods.getTokenAdapter(web3.utils.toHex('ERC20'))
      .call()
      .then((result) => {
        assert.equal(result, tokenAdapterAddress);
      });
  });

  it('should not add protocol not by the owner', async () => {
    await expectRevert(adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Mock2')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        protocolAdapterAddress,
      ]],
      [[[
        protocolAdapterAddress,
      ]]],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not add protocol with bad input', async () => {
    await expectRevert(adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Mock2'), web3.utils.toHex('Mock3')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        protocolAdapterAddress,
      ]],
      [[[
        protocolAdapterAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol with bad input', async () => {
    await expectRevert(adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Mock2')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [
        [
          protocolAdapterAddress,
        ],
        [
          protocolAdapterAddress,
        ],
      ],
      [[[
        protocolAdapterAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol with bad input', async () => {
    await expectRevert(adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Mock2')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [
        [
          protocolAdapterAddress,
        ],
      ],
      [[
        [
          protocolAdapterAddress,
        ],
        [
          protocolAdapterAddress,
        ],
      ]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol with bad input', async () => {
    await expectRevert(adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Mock2')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        protocolAdapterAddress,
      ]],
      [
        [[
          protocolAdapterAddress,
        ]],
        [[
          protocolAdapterAddress,
        ]],
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol with empty input', async () => {
    await expectRevert(adapterRegistry.methods.addProtocols(
      [],
      [],
      [],
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol with init name', async () => {
    await expectRevert(adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Initial protocol name')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        protocolAdapterAddress,
      ]],
      [[[
        protocolAdapterAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol with existing name', async () => {
    await expectRevert(adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Mock')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        protocolAdapterAddress,
      ]],
      [[[
        protocolAdapterAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol with empty name', async () => {
    await expectRevert(adapterRegistry.methods.addProtocols(
      ['0x'],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        protocolAdapterAddress,
      ]],
      [[[
        protocolAdapterAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol with zero adapter', async () => {
    await expectRevert(adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Mock2')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[ZERO]],
      [[[
        protocolAdapterAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  // it('should not add protocol with no assets', async () => {
  //   await expectRevert(adapterRegistry.methods.addProtocols(
  //     [web3.utils.toHex('Mock2')],
  //     [[
  //       'Mock Protocol Name',
  //       'Mock protocol description',
  //       'Mock website',
  //       'Mock icon',
  //       '0',
  //     ]],
  //
  //     [[
  //       protocolAdapterAddress,
  //     ]],
  //     [[[]]],
  //   )
  //     .send({
  //       from: accounts[0],
  //       gas: '300000',
  //     }));
  // });

  it('should add protocol by the owner', async () => {
    await adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Mock2')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        ONE,
      ]],
      [[[
        protocolAdapterAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods['getProtocolNames()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'Mock2');
      });
  });

  it('should not remove protocol not by the owner', async () => {
    await expectRevert(adapterRegistry.methods.removeProtocols(
      [web3.utils.toHex('Mock')],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not remove protocol with wrong name', async () => {
    await expectRevert(adapterRegistry.methods.removeProtocols(
      [web3.utils.toHex('Mock1')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not remove protocol with empty input', async () => {
    await expectRevert(adapterRegistry.methods.removeProtocols(
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should remove protocol by the owner', async () => {
    await adapterRegistry.methods.removeProtocols(
      [web3.utils.toHex('Mock')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods['getProtocolNames()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
    await adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Mock2')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        protocolAdapterAddress,
      ]],
      [[[
        protocolAdapterAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Mock1')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        ONE,
      ]],
      [[[
        protocolAdapterAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods['getProtocolNames()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'Mock1');
        assert.equal(web3.utils.hexToUtf8(result[1]), 'Mock2');
      });
    await adapterRegistry.methods.removeProtocols(
      [web3.utils.toHex('Mock2')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods['getProtocolNames()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'Mock1');
      });
    await adapterRegistry.methods.addProtocols(
      [web3.utils.toHex('Mock2')],
      [[
        'Mock Protocol Name',
        'Mock protocol description',
        'Mock website',
        'Mock icon',
        '0',
      ]],
      [[
        TWO,
      ]],
      [[[
        protocolAdapterAddress,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods['getProtocolNames()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'Mock2');
        assert.equal(web3.utils.hexToUtf8(result[1]), 'Mock1');
      });
    await adapterRegistry.methods.removeProtocols(
      [web3.utils.toHex('Mock2')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods['getProtocolNames()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 1);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'Mock1');
      });
  });

  it('should not update protocol info not by the owner', async () => {
    await expectRevert(adapterRegistry.methods.updateProtocolMetadata(
      web3.utils.toHex('Mock'),
      'New Mock Protocol Name',
      'New mock description',
      'New mock website',
      '',
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not update protocol info with wrong name', async () => {
    await expectRevert(adapterRegistry.methods.updateProtocolMetadata(
      web3.utils.toHex('Mock1'),
      'New Mock Protocol Name',
      'New mock description',
      'New mock website',
      '',
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update protocol info with empty input', async () => {
    await expectRevert(adapterRegistry.methods.updateProtocolMetadata(
      web3.utils.toHex('Mock'),
      '',
      '',
      '',
      '',
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should update protocol info by the owner', async () => {
    await adapterRegistry.methods.getProtocolMetadata(web3.utils.toHex('Mock'))
      .call()
      .then((result) => {
        assert.equal(result.name, 'Mock Protocol Name');
        assert.equal(result.description, 'Mock protocol description');
        assert.equal(result.websiteURL, 'Mock website');
        assert.equal(result.iconURL, 'Mock icon');
        assert.equal(result.version, '0');
      });
    await adapterRegistry.methods.updateProtocolMetadata(
      web3.utils.toHex('Mock'),
      'New Mock Protocol Name',
      'New mock description',
      'New mock website',
      '', // empty new icon parameter
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getProtocolMetadata(web3.utils.toHex('Mock'))
      .call()
      .then((result) => {
        assert.equal(result.name, 'New Mock Protocol Name');
        assert.equal(result.description, 'New mock description');
        assert.equal(result.websiteURL, 'New mock website');
        assert.equal(result.iconURL, 'Mock icon');
        assert.equal(result.version, '1');
      });
    await adapterRegistry.methods.updateProtocolMetadata(
      web3.utils.toHex('Mock'),
      '',
      '',
      '',
      'New mock icon',
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getProtocolMetadata(web3.utils.toHex('Mock'))
      .call()
      .then((result) => {
        assert.equal(result.name, 'New Mock Protocol Name');
        assert.equal(result.description, 'New mock description');
        assert.equal(result.websiteURL, 'New mock website');
        assert.equal(result.iconURL, 'New mock icon');
        assert.equal(result.version, '2');
      });
  });

  it('should not add protocol adapter not by the owner', async () => {
    await expectRevert(adapterRegistry.methods.addProtocolAdapters(
      web3.utils.toHex('Mock'),
      [
        protocolAdapterAddress,
      ],
      [[
        protocolAdapterAddress,
      ]],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not add protocol adapter with wrong protocol name', async () => {
    await expectRevert(adapterRegistry.methods.addProtocolAdapters(
      web3.utils.toHex('Mock1'),
      [protocolAdapterAddress],
      [[protocolAdapterAddress]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol adapter that is already in use', async () => {
    await expectRevert(adapterRegistry.methods.addProtocolAdapters(
      web3.utils.toHex('Mock'),
      [protocolAdapterAddress],
      [[protocolAdapterAddress]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol adapter with no adapters', async () => {
    await expectRevert(adapterRegistry.methods.addProtocolAdapters(
      web3.utils.toHex('Mock'),
      [],
      [[]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not add protocol adapter with zero address and non-empty token list', async () => {
    await expectRevert(adapterRegistry.methods.addProtocolAdapters(
      web3.utils.toHex('Mock'),
      [ZERO],
      [[protocolAdapterAddress]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should add protocol adapter by the owner', async () => {
    await adapterRegistry.methods.addProtocolAdapters(
      web3.utils.toHex('Mock'),
      [ONE, ZERO],
      [[protocolAdapterAddress], []],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getProtocolAdapters(web3.utils.toHex('Mock'))
      .call()
      .then((result) => {
        assert.deepEqual(result, [protocolAdapterAddress, ONE, ZERO]);
      });
  });

  it('should not remove protocol adapter not by the owner', async () => {
    await expectRevert(adapterRegistry.methods.removeProtocolAdapters(
      web3.utils.toHex('Mock'),
      [
        0,
      ],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not remove protocol adapter with wrong protocol name', async () => {
    await expectRevert(adapterRegistry.methods.removeProtocolAdapters(
      web3.utils.toHex('Mock1'),
      [
        0,
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not remove protocol adapter with large index', async () => {
    await expectRevert(adapterRegistry.methods.removeProtocolAdapters(
      web3.utils.toHex('Mock'),
      [
        5,
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not remove protocol adapter with empty input', async () => {
    await expectRevert(adapterRegistry.methods.removeProtocolAdapters(
      web3.utils.toHex('Mock'),
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should remove protocol adapter by the owner', async () => {
    await adapterRegistry.methods.removeProtocolAdapters(
      web3.utils.toHex('Mock'),
      [
        0,
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getProtocolAdapters(web3.utils.toHex('Mock'))
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
    await adapterRegistry.methods.addProtocolAdapters(
      web3.utils.toHex('Mock'),
      [ONE, TWO],
      [[ONE], [TWO]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getProtocolAdapters(web3.utils.toHex('Mock'))
      .call()
      .then((result) => {
        assert.deepEqual(result, [ONE, TWO]);
      });
    await adapterRegistry.methods.removeProtocolAdapters(
      web3.utils.toHex('Mock'),
      [
        0,
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getProtocolAdapters(web3.utils.toHex('Mock'))
      .call()
      .then((result) => {
        assert.deepEqual(result, [TWO]);
      });
    await adapterRegistry.methods.addProtocolAdapters(
      web3.utils.toHex('Mock'),
      [ONE],
      [[ONE]],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getProtocolAdapters(web3.utils.toHex('Mock'))
      .call()
      .then((result) => {
        assert.deepEqual(result, [TWO, ONE]);
      });
    await adapterRegistry.methods.removeProtocolAdapters(
      web3.utils.toHex('Mock'),
      [
        1,
      ],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getProtocolAdapters(web3.utils.toHex('Mock'))
      .call()
      .then((result) => {
        assert.deepEqual(result, [TWO]);
      });
  });

  it('should not update protocol adapter not by the owner', async () => {
    await expectRevert(adapterRegistry.methods.updateProtocolAdapter(
      web3.utils.toHex('Mock'),
      0,
      ONE,
      [],
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not update protocol adapter with wrong protocol name', async () => {
    await expectRevert(adapterRegistry.methods.updateProtocolAdapter(
      web3.utils.toHex('Mock1'),
      0,
      ONE,
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update protocol adapter with large index', async () => {
    await expectRevert(adapterRegistry.methods.updateProtocolAdapter(
      web3.utils.toHex('Mock'),
      5,
      ONE,
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update protocol adapter with zero address', async () => {
    await expectRevert(adapterRegistry.methods.updateProtocolAdapter(
      web3.utils.toHex('Mock'),
      0,
      ZERO,
      [ONE],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  // it('should not update protocol adapter with same address', async () => {
  //   await expectRevert(adapterRegistry.methods.updateProtocolAdapter(
  //     web3.utils.toHex('Mock'),
  //     0,
  //     protocolAdapterAddress,
  //     [ONE],
  //   )
  //     .send({
  //       from: accounts[0],
  //       gas: '300000',
  //     }));
  // });

  it('should update protocol adapter by the owner', async () => {
    await adapterRegistry.methods.updateProtocolAdapter(
      web3.utils.toHex('Mock'),
      0,
      ONE,
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getProtocolAdapters(web3.utils.toHex('Mock'))
      .call()
      .then((result) => {
        assert.deepEqual(result, [ONE]);
      });
    await adapterRegistry.methods.updateProtocolAdapter(
      web3.utils.toHex('Mock'),
      0,
      ONE,
      [ONE, ONE],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getSupportedTokens(ONE)
      .call()
      .then((result) => {
        assert.deepEqual(result, [ONE, ONE]);
      });
    await adapterRegistry.methods.updateProtocolAdapter(
      web3.utils.toHex('Mock'),
      0,
      TWO,
      [TWO, TWO],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getProtocolAdapters(web3.utils.toHex('Mock'))
      .call()
      .then((result) => {
        assert.deepEqual(result, [TWO]);
      });
    await adapterRegistry.methods.getSupportedTokens(ONE)
      .call()
      .then((result) => {
        assert.deepEqual(result, []);
      });
    await adapterRegistry.methods.getSupportedTokens(TWO)
      .call()
      .then((result) => {
        assert.deepEqual(result, [TWO, TWO]);
      });
    await adapterRegistry.methods.updateProtocolAdapter(
      web3.utils.toHex('Mock'),
      0,
      TWO,
      [],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getSupportedTokens(TWO)
      .call()
      .then((result) => {
        assert.deepEqual(result, []);
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

  it('should not add token adapter with init name', async () => {
    await expectRevert(adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('Initial token name')],
      [ONE],
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
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ONE')],
      [ONE],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods['getTokenAdapterNames()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 2);
        assert.equal(web3.utils.hexToUtf8(result[0]), 'ONE');
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

  it('should not remove token adapter with no names', async () => {
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
    await adapterRegistry.methods['getTokenAdapterNames()']()
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ONE')],
      [ONE],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('TWO')],
      [TWO],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods['getTokenAdapterNames()']()
      .call()
      .then((result) => {
        assert.deepEqual(result.map(web3.utils.hexToUtf8), ['TWO', 'ONE']);
      });
    await adapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('ONE')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods['getTokenAdapterNames()']()
      .call()
      .then((result) => {
        assert.deepEqual(result.map(web3.utils.hexToUtf8), ['TWO']);
      });
    await adapterRegistry.methods.addTokenAdapters(
      [web3.utils.toHex('ONE')],
      [ONE],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods['getTokenAdapterNames()']()
      .call()
      .then((result) => {
        assert.deepEqual(result.map(web3.utils.hexToUtf8), ['ONE', 'TWO']);
      });
    await adapterRegistry.methods.removeTokenAdapters(
      [web3.utils.toHex('ONE')],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods['getTokenAdapterNames()']()
      .call()
      .then((result) => {
        assert.deepEqual(result.map(web3.utils.hexToUtf8), ['TWO']);
      });
  });

  it('should not update token adapter not by the owner', async () => {
    await expectRevert(adapterRegistry.methods.updateTokenAdapter(
      web3.utils.toHex('ERC20'),
      ONE,
    )
      .send({
        from: accounts[1],
        gas: '300000',
      }));
  });

  it('should not update token adapter with zero address', async () => {
    await expectRevert(adapterRegistry.methods.updateTokenAdapter(
      web3.utils.toHex('ERC20'),
      ZERO,
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should not update token adapter with bad name', async () => {
    await expectRevert(adapterRegistry.methods.updateTokenAdapter(
      web3.utils.toHex('ERC220'),
      ONE,
    )
      .send({
        from: accounts[0],
        gas: '300000',
      }));
  });

  it('should update token adapter by the owner', async () => {
    await adapterRegistry.methods.updateTokenAdapter(
      web3.utils.toHex('ERC20'),
      ONE,
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods.getTokenAdapter(web3.utils.toHex('ERC20'))
      .call()
      .then((result) => {
        assert.equal(result, ONE);
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
          gas: '300000',
        }),
    );
  });

  it('should transfer ownership by the owner', async () => {
    await adapterRegistry.methods['transferOwnership(address)'](accounts[1])
      .send({
        from: accounts[0],
        gas: '300000',
      });
    await adapterRegistry.methods['owner()']()
      .call()
      .then((result) => {
        assert.equal(result, accounts[1]);
      });
  });

  it('should be correct balances non-null', async () => {
    await adapterRegistry.methods.getBalances(accounts[0])
      .call()
      .then((result) => {
        assert.equal(result[0].metadata.name, 'Mock Protocol Name');
        assert.equal(result[0].metadata.description, 'Mock protocol description');
        assert.equal(result[0].metadata.websiteURL, 'Mock website');
        assert.equal(result[0].metadata.iconURL, 'Mock icon');
        assert.equal(result[0].metadata.version, '0');
        assert.equal(
          web3.utils.hexToUtf8(result[0].adapterBalances[0].metadata.adapterType),
          'Asset',
        );
        assert.deepEqual(result[0].adapterBalances[0].balances[0].base.metadata, mockAsset);
        assert.equal(result[0].adapterBalances[0].balances[0].base.amount, 1000);
        assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying, []);
      });
  });

  it('should be correct balances null', async () => {
    await adapterRegistry.methods.getBalances(accounts[1])
      .call()
      .then((result) => {
        assert.equal(result.length, 0);
      });
  });
});
