import deploymentAddresses from './deployment';

try {
  (async () => {
    const Router = await ethers.getContractFactory('Router');
    const chainIdHex = await hre.network.provider.request({ method: 'eth_chainId' });
    const chainId = [parseInt(chainIdHex.toString(), 16).toString()];
    const router = await Router.attach(deploymentAddresses.router[chainId]);

    console.log(`Working with chainId ${chainId}`);

    const feeSignerTx = await router.functions.setProtocolFeeSigner(
      '0x1e126951a7CB895543E4E4c7B2D1398b3C3d09fC',
    );
    console.log(`Setting fee signer tx hash: ${feeSignerTx.hash}`);

    const feeDefaultTx = await router.functions.setProtocolFeeDefault(
      [
        '5000000000000000',
        deploymentAddresses.feeBeneficiaries[chainId],
      ],
    );
    console.log(`Setting fee defaults tx hash: ${feeDefaultTx.hash}`);
  })();
} catch (error) {
  console.error(error);
  process.exit(1);
}
