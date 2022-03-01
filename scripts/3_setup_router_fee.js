import deploymentAddresses from './deployment';

try {
  (async () => {
    const Contract = await ethers.getContractFactory('Router');
    const contract = await Contract.attach(deploymentAddresses.router);

    const feeSignerTx = await contract.functions.setProtocolFeeSigner(
      '0x1e126951a7CB895543E4E4c7B2D1398b3C3d09fC',
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
