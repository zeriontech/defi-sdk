import hre from 'hardhat';
// @ts-ignore
import deploymentAddresses from './deployment.json';

(async () => {
  try {
    const chainIdHex = await hre.network.provider.request({ method: 'eth_chainId' });
    const chainId = parseInt(String(chainIdHex), 16).toString();

    if (deploymentAddresses.router && deploymentAddresses.router[chainId]) {
      await hre.run('verify:verify', {
        address: deploymentAddresses.router[chainId],
      });
    } else {
      console.log('Skipping Router: no address for this chainId');
    }

    if (deploymentAddresses.simpleCaller && deploymentAddresses.simpleCaller[chainId]) {
      await hre.run('verify:verify', {
        address: deploymentAddresses.simpleCaller[chainId],
      });
    } else {
      console.log('Skipping SimpleCaller: no address for this chainId');
    }

    if (
      deploymentAddresses.simpleCallerWithPermit2 &&
      deploymentAddresses.simpleCallerWithPermit2[chainId] &&
      deploymentAddresses.universalRouter &&
      deploymentAddresses.universalRouter[chainId] &&
      deploymentAddresses.permit2 &&
      deploymentAddresses.permit2[chainId]
    ) {
      await hre.run('verify:verify', {
        address: deploymentAddresses.simpleCallerWithPermit2[chainId],
        constructorArguments: [
          deploymentAddresses.universalRouter[chainId],
          deploymentAddresses.permit2[chainId],
        ],
      });
    } else {
      console.log('Skipping SimpleCallerWithPermit2: missing address or constructor args for this chainId');
    }

    if (deploymentAddresses.uniswapV2Caller && deploymentAddresses.uniswapV2Caller[chainId] && deploymentAddresses.weth && deploymentAddresses.weth[chainId]) {
      await hre.run('verify:verify', {
        address: deploymentAddresses.uniswapV2Caller[chainId],
        constructorArguments: [
          deploymentAddresses.weth[chainId],
        ],
      });
    } else {
      console.log('Skipping UniswapV2Caller: missing address or constructor args for this chainId');
    }

    if (deploymentAddresses.uniswapV3Caller && deploymentAddresses.uniswapV3Caller[chainId] && deploymentAddresses.weth && deploymentAddresses.weth[chainId]) {
      await hre.run('verify:verify', {
        address: deploymentAddresses.uniswapV3Caller[chainId],
        constructorArguments: [
          deploymentAddresses.weth[chainId],
        ],
      });
    } else {
      console.log('Skipping UniswapV3Caller: missing address or constructor args for this chainId');
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})(); 
