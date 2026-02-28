import hre from 'hardhat';
import deployContract from './deployContract';
import updateDeploymentAddress from './update_deployment';
// @ts-ignore
import deploymentAddresses from './deployment.json';

(async () => {
  try {
    const chainIdHex = await hre.network.provider.request({ method: 'eth_chainId' });
    const chainId = parseInt(String(chainIdHex), 16).toString();

    console.log(`Working with chainId ${chainId}`);

    // Check if already deployed
    if (deploymentAddresses.simpleCaller && deploymentAddresses.simpleCaller[chainId]) {
      console.log(`SimpleCaller already deployed at ${deploymentAddresses.simpleCaller[chainId]} for chainId ${chainId}. Skipping deployment.`);
      return;
    }

    const address = await deployContract('SimpleCaller');
    if (!address) {
      console.error('SimpleCaller deployment failed.');
      return;
    }
    updateDeploymentAddress('simpleCaller', chainId, address);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})(); 
