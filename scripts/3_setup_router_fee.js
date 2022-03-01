import deploymentAddresses from './deployment_test';

try {
  (async () => {
    const Contract = await ethers.getContractFactory('Router');
    const contract = await Contract.attach(deploymentAddresses.Router);

    const feeSignerTx = await contract.functions.setProtocolFeeSigner(
      '0xD8282A355383A6513EccC8a16F990bA0026C2d1a',
    );
    console.log(`Setting fee signer tx hash: ${feeSignerTx.hash}`);

    const feeDefaultTx = await contract.functions.setProtocolFeeDefault(
      [
        '5000000000000000',
        '0xD8282A355383A6513EccC8a16F990bA0026C2d1a',
      ],
    );
    console.log(`Setting fee defaults tx hash: ${feeDefaultTx.hash}`);
  })();
} catch (error) {
  console.error(error);
  process.exit(1);
}
