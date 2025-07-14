import hre from 'hardhat';
// @ts-ignore
import deploymentAddresses from './deployment.json';
import updateDeploymentAddress from './update_deployment';
import deployContract from './deployContract';

(async () => {
  try {
    const chainIdHex = await hre.network.provider.request({ method: 'eth_chainId' });
    const chainId = parseInt(String(chainIdHex), 16).toString();

    console.log(`Working with chainId ${chainId}`);

    // Check if already deployed
    if (deploymentAddresses.simpleCallerWithPermit2 && deploymentAddresses.simpleCallerWithPermit2[chainId]) {
      console.log(`SimpleCallerWithPermit2 already deployed at ${deploymentAddresses.simpleCallerWithPermit2[chainId]} for chainId ${chainId}. Skipping deployment.`);
      return;
    }

    const universalRouter = deploymentAddresses.universalRouter[chainId];
    const permit2 = deploymentAddresses.permit2[chainId];
    if (!universalRouter || !permit2) {
      console.log(`Missing required address: universalRouter or permit2 for chainId ${chainId}. Skipping deployment.`);
      return;
    }

    const address = await deployContract('SimpleCallerWithPermit2', [universalRouter, permit2]);
    if (!address) {
      console.error('SimpleCallerWithPermit2 deployment failed.');
      return;
    }
    console.log(`SimpleCallerWithPermit2 deployed to: ${address}`);

    updateDeploymentAddress('simpleCallerWithPermit2', chainId, address);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})(); 
