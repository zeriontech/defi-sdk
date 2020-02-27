const IearnAdapter = artifacts.require('IearnAdapter');

module.exports = (deployer, network, accounts) => {
  const yDAIAddress = '0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01';
  const yUSDCAddress = '0xd6aD7a6750A7593E092a9B218d66C0A814a3436e';
  const yUSDTAddress = '0x83f798e925BcD4017Eb265844FDDAbb448f1707D';
  const ySUSDAddress = '0xF61718057901F84C4eEC4339EF8f0D86D2B45600';
  const yTUSDAddress = '0x73a052500105205d34Daf004eAb301916DA8190f';
  const yWBTCAddress = '0x04Aa51bbcB46541455cCF1B8bef2ebc5d3787EC9';

  const iearnAdapterAssets = [
    yDAIAddress,
    yUSDCAddress,
    yUSDTAddress,
    ySUSDAddress,
    yTUSDAddress,
    yWBTCAddress,
  ];

  let adapterRegistry;

  deployer.deploy(IearnAdapter, { from: accounts[0] })
    .then(() => AdapterRegistry.at('0xaF51e57D3c78CE8495219Ceb6d559B85E62F680E')
      .then((registry) => {
        adapterRegistry = registry;
        return adapterRegistry.methods['addAdapter(address,address[])'](IearnAdapter.address, iearnAdapterAssets, { from: accounts[0] });
      }));
};
