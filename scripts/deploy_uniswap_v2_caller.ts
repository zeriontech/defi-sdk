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
    if (deploymentAddresses.uniswapV2Caller && deploymentAddresses.uniswapV2Caller[chainId]) {
      console.log(`UniswapV2Caller already deployed at ${deploymentAddresses.uniswapV2Caller[chainId]} for chainId ${chainId}. Skipping deployment.`);
      return;
    }

    const weth = deploymentAddresses.weth[chainId];
    if (!weth) {
      console.log(`Missing required address: weth for chainId ${chainId}. Skipping deployment.`);
      return;
    }

    const address = await deployContract('UniswapV2Caller', [weth]);
    if (!address) {
      console.error('UniswapV2Caller deployment failed.');
      return;
    }

    updateDeploymentAddress('uniswapV2Caller', chainId, address);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})(); 
