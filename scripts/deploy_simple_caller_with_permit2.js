import deploymentAddresses from './deployment';

try {
  (async () => {
    console.log('Make sure 0x161b29D1919D4E06b53eE449376181B5082b30B9 is used and nonce is 10');

    const chainIdHex = await hre.network.provider.request({ method: 'eth_chainId' });
    const chainId = parseInt(chainIdHex.toString(), 16).toString();

    console.log(`Working with chainId ${chainId}`);

    // We get the contract to deploy
    const Contract = await ethers.getContractFactory('SimpleCallerWithPermit2');
    const contract = await Contract.deploy(
      deploymentAddresses.universalRouter[chainId],
      deploymentAddresses.permit2[chainId],
    );

    console.log(`${'SimpleCallerWithPermit2'} deployed to: ${contract.address}`);

    return contract.address;
  })();
} catch (error) {
  console.error(error);
  process.exit(1);
}
