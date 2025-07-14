import hre from 'hardhat';
// @ts-ignore
import deploymentAddresses from './deployment.json';

(async () => {
  try {
    const chainIdHex = await hre.network.provider.request({ method: 'eth_chainId' });
    const chainId = parseInt(String(chainIdHex), 16).toString();
    await hre.run('verify:verify', {
      address: deploymentAddresses.router[chainId],
    });
    await hre.run('verify:verify', {
      address: deploymentAddresses.simpleCaller[chainId],
    });
    await hre.run('verify:verify', {
      address: deploymentAddresses.simpleCallerWithPermit2[chainId],
      constructorArguments: [
        deploymentAddresses.universalRouter[chainId],
        deploymentAddresses.permit2[chainId],
      ],
    });
    await hre.run('verify:verify', {
      address: deploymentAddresses.uniswapV2Caller[chainId],
      constructorArguments: [
        deploymentAddresses.weth[chainId],
      ],
    });
    await hre.run('verify:verify', {
      address: deploymentAddresses.uniswapV3Caller[chainId],
      constructorArguments: [
        deploymentAddresses.weth[chainId],
      ],
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})(); 
