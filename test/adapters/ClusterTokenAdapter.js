const BN = web3.utils.BN;

const TokenAdapter = artifacts.require('ClusterTokenAdapter');
const IClusterToken = artifacts.require('IClusterToken');

contract('ClusterTokenAdapter', () => {
    const polyClusterAddress = '0x4964B3B599B82C3FdDC56e3A9Ffd77d48c6AF0f0';
    let accounts;
    let tokenAdapter;
    let clusterToken;
    const DPOL = [
        'Polycluster',
        'DPOL',
        '18'
    ];

    before(async() => {
        accounts = await web3.eth.getAccounts();
        tokenAdapter = await TokenAdapter.new();
        clusterToken = await IClusterToken.at(polyClusterAddress);
    });

    it('Should return correct components', async() => {
        const underlyingsFromCluster = await clusterToken.getUnderlyings();
        const proportions = await clusterToken.getUnderlyingInCluster();

        const components = await tokenAdapter.getComponents(polyClusterAddress);
        for(let i = 0; i < underlyingsFromCluster.length; i++) {
            assert.equal(underlyingsFromCluster[i], components[i].token);
            assert.equal((proportions[i].mul(
                new BN('1000000000000000000')
                ).div(
                    new BN('1000000')
                    )
                    ).toString(), components[i].rate);
        }
    });

    it('Should return correct metadata', async() => {
        const metadata = await tokenAdapter.getMetadata(polyClusterAddress);
        assert.deepEqual(DPOL, metadata);
    })
});