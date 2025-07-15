import hre from 'hardhat';
// @ts-ignore
const RouterArtifact = require('../artifacts/contracts/router/Router.sol/Router.json');
// @ts-ignore
import deploymentAddresses from './deployment.json';

(async () => {
  try {
    const chainIdHex = await hre.network.provider.request({ method: 'eth_chainId' });
    const chainId = parseInt(String(chainIdHex), 16).toString();

    console.log(`Working with chainId ${chainId}`);

    if (!deploymentAddresses.router[chainId]) {
      console.error(`No router deployment found for chainId ${chainId}`);
      return;
    }
    if (!deploymentAddresses.feeBeneficiaries || !deploymentAddresses.feeBeneficiaries[chainId]) {
      console.error(`No fee beneficiary found for chainId ${chainId}`);
      return;
    }

    const [signer] = await hre.ethers.getSigners();
    const router = new hre.ethers.Contract(
      deploymentAddresses.router[chainId],
      RouterArtifact.abi,
      signer
    );

    const feeSignerTx = await router.setProtocolFeeSigner(
      '0x1e126951a7CB895543E4E4c7B2D1398b3C3d09fC',
    );
    console.log(`Setting fee signer tx hash: ${feeSignerTx.hash}`);
    await feeSignerTx.wait();

    const feeDefaultTx = await router.setProtocolFeeDefault({
      share: '8000000000000000',
      beneficiary: deploymentAddresses.feeBeneficiaries[chainId],
    });
    console.log(`Setting fee defaults tx hash: ${feeDefaultTx.hash}`);
    await feeDefaultTx.wait();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})(); 
