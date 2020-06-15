const AdapterRegistry = artifacts.require('AdapterRegistry');
const ProtocolAdapter = artifacts.require('OneInchChiAdapter');
const TokenAdapter = artifacts.require('OneInchChiTokenAdapter');
const ERC20TokenAdapter = artifacts.require('ERC20TokenAdapter');

contract('ChiAdapter', () => {
    const chiAddress = '0x0000000000004946c0e9F43F4Dee607b0eF1fA1c';
    const testAddress = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';

    let accounts;
    let adapterRegistry;
    let protocolAdapterAddress;
    let tokenAdapterAddress;
    let erc20TokenAdapterAddress;
    const chi = [
        chiAddress,
        'Chi Gastoken by 1inch',
        'CHI',
        '0',
    ];

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
        await ERC20TokenAdapter.new({ from: accounts[0] })
            .then((result) => {
                erc20TokenAdapterAddress = result.address;
            });
        await AdapterRegistry.new({ from: accounts[0] })
            .then((result) => {
                adapterRegistry = result.contract;
            });
        await adapterRegistry.methods.addProtocols(
            ['Chi'],
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
                chiAddress
            ]]],
        )
            .send({
                from: accounts[0],
                gas: '1000000',
            });
        await adapterRegistry.methods.addTokenAdapters(
            ['ERC20', 'Chi'],
            [erc20TokenAdapterAddress, tokenAdapterAddress],
        )
            .send({
                from: accounts[0],
                gas: '300000',
            });
    });

    it('should return correct balances', async () => {
        await adapterRegistry.methods['getBalances(address)'](testAddress)
            .call()
            .then((result) => {
                displayToken(result[0].adapterBalances[0].balances[0].underlying[0]);
                assert.deepEqual(result[0].adapterBalances[0].balances[0].underlying[0].metadata, chi);
            });
    });
});

// Chi token has 0 decimals
const displayToken = (token) => {
    // eslint-disable-next-line no-console
    console.log(`${token.metadata.name} amount: ${token.amount.toString()}`);
};
