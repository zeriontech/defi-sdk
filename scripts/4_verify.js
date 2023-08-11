import deploymentAddresses from './deployment';

try {
  (async () => {
    const chainIdHex = await hre.network.provider.request({ method: 'eth_chainId' });
    const chainId = parseInt(chainIdHex.toString(), 16).toString();
    await hre.run('verify:verify', {
      address: deploymentAddresses.router[chainId],
    });
    await hre.run('verify:verify', {
      address: deploymentAddresses.simpleCaller[chainId],
    });
  })();
} catch (error) {
  console.error(error);
  process.exit(1);
}
