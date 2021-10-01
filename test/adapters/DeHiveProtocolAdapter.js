const BN = web3.utils.BN;

const ProtocolAdapter = artifacts.require('DeHiveProtocolAdapter');
const IClusterToken = artifacts.require('IClusterToken');

contract('DeHiveProtocolAdapter', () => {
    const polyClusterAddress = '0x4964B3B599B82C3FdDC56e3A9Ffd77d48c6AF0f0';
    let accounts;
    let protocolAdapter;
    let clusterToken;

    before(async() => {
        accounts = await web3.eth.getAccounts();
        protocolAdapter = await ProtocolAdapter.new({from: accounts[0]});
        clusterToken = await IClusterToken.at(polyClusterAddress);
    });

    it('Should return correct balance', async() => {
        let bal = await protocolAdapter.getBalance(polyClusterAddress, accounts[0]);
        assert.equal(bal, 0);

        let cl = new BN('1000000000000000000');
        let eth = await web3.utils.toWei('3000', 'ether');
        await clusterToken.assemble(cl, true, {from: accounts[0], value: eth});

        assert.equal(cl.toString(),
                     (await protocolAdapter.getBalance(polyClusterAddress, accounts[0])).toString());
    });
});