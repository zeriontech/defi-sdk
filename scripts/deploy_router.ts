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
    if (deploymentAddresses.router && deploymentAddresses.router[chainId]) {
      console.log(`Router already deployed at ${deploymentAddresses.router[chainId]} for chainId ${chainId}. Skipping deployment.`);
      return;
    }

    const address = await deployContract('Router');
    if (!address) {
      console.error('Router deployment failed.');
      process.exit(1);
    }
    updateDeploymentAddress('router', chainId, address);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})(); 
