import deploymentAddresses from './deployment';

try {
  (async () => {
    console.log('Make sure 0x161b29D1919D4E06b53eE449376181B5082b30B9 is used and nonce is 4-5');

    const chainIdHex = await hre.network.provider.request({ method: 'eth_chainId' });
    const chainId = parseInt(chainIdHex.toString(), 16).toString();

    console.log(`Working with chainId ${chainId}`);

    // We get the contract to deploy
    const Contract = await ethers.getContractFactory('UniswapCaller');
    const contract = await Contract.deploy(deploymentAddresses.weth[chainId]);

    console.log(`${'UniswapCaller'} deployed to: ${contract.address}`);

    return contract.address;
  })();
} catch (error) {
  console.error(error);
  process.exit(1);
}
