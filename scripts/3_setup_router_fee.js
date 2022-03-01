import deploymentAddresses from './deployment_test';

try {
  (async () => {
    const Contract = await ethers.getContractFactory('Router');
    const contract = await Contract.attach(deploymentAddresses.Router);

    const feeSignerTx = await contract.functions.setProtocolFeeSigner(
      '0x014040C6A9cd6366f8fa858535b7DdfAc507dB20',
    );
    console.log(`Setting fee signer tx hash: ${feeSignerTx.hash}`);

    const feeDefaultTx = await contract.functions.setProtocolFeeDefault(
      [
        '5000000000000000',
        '0xFEeAcCE884bc21B53DBe79Abc5279029f78D1B44',
      ],
    );
    console.log(`Setting fee defaults tx hash: ${feeDefaultTx.hash}`);
  })();
} catch (error) {
  console.error(error);
  process.exit(1);
}
