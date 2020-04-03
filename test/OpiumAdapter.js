const AdapterRegistry = artifacts.require('./AdapterRegistry');
const OpiumAssetAdapter = artifacts.require('./OpiumAssetAdapter');
const OpiumTokenAdapter = artifacts.require('./OpiumTokenAdapter');

contract('OpiumAdapter', () => {
  const OPIUM_TOKEN_ADDRESS = '0x9Dd91d61A7aa58537fCdbf16fD21bE25731341B3';

  const testAddress = '0xed56b70ec9ebe6127d4caf97872d759a1b380d61';

  let accounts;
  let adapterRegistry;
  let protocolAdapterAddress;
  let tokenAdapterAddress;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    // Opium Asset Adapter
    await OpiumAssetAdapter.new({ from: accounts[0] })
      .then((result) => {
        protocolAdapterAddress = result.address;
      });

    // Opium token Adapter
    await OpiumTokenAdapter.new({ from: accounts[0] })
      .then((result) => {
        tokenAdapterAddress = result.address;
      });

    // Adapter registry
    await AdapterRegistry.new({ from: accounts[0] })
      .then((result) => {
        adapterRegistry = result.contract;
      });

    // Add ProtocolAdapters to AdapterRegistry
    await adapterRegistry.methods.addProtocols(
      ['Opium Network'],
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
        OPIUM_TOKEN_ADDRESS,
      ]]],
    )
      .send({
        from: accounts[0],
        gas: '1000000',
      });

    // Add TokenAdapters to AdapterRegistry
    await adapterRegistry.methods.addTokenAdapters(
      ['ERC721o'],
      [tokenAdapterAddress],
    )
      .send({
        from: accounts[0],
        gas: '300000',
      });
  });

  it.only('should return correct balances', async () => {
    await adapterRegistry.methods['getBalances(address)'](testAddress)
      .call()
      .then((result) => {
        // Adapter Metadata
        assert.equal(result[0].adapterBalances[0].metadata.adapterAddress, protocolAdapterAddress);
        assert.equal(result[0].adapterBalances[0].metadata.adapterType, 'Asset');

        // Balances Base Metadata
        assert.equal(
          result[0].adapterBalances[0].balances[0].base.metadata.token, OPIUM_TOKEN_ADDRESS
        );
        assert.equal(result[0].adapterBalances[0].balances[0].base.metadata.name, 'Opium Network Position Token');
        assert.equal(result[0].adapterBalances[0].balances[0].base.metadata.symbol, 'ONP');
        assert.equal(result[0].adapterBalances[0].balances[0].base.metadata.decimals, 0);

        // Balances Base Amount
        assert.exists(result[0].adapterBalances[0].balances[0].base.amount);

        // Balances Underlying length
        assert.equal(result[0].adapterBalances[0].balances[0].underlying.length, 0);
      });
  });
});
