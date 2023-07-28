import { Wallet } from "zksync-web3";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

async function deployAsyncZkSyncEra(hre, path, contractName) {
  // // load wallet private key from env file
  const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

  // // Initialize the wallet.
  const wallet = new Wallet(PRIVATE_KEY);

  // // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact(contractName);

  const contract = await deployer.deploy(artifact);

  console.log(`${contractName} deployed to: ${contract.address}`);

  // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
  const contractFullyQualifedName = `contracts/${path}${contractName}.sol:${contractName}`;

  // Verify contract programmatically
  await hre.run("verify:verify", {
    address: contract.address,
    contract: contractFullyQualifedName,
    constructorArguments: [],
    bytecode: artifact.bytecode,
  });

  return contract.address;
}

const deployContractZkSyncEra = (hre, path, contractName) => {
  return deployAsyncZkSyncEra(hre, path, contractName);
};

export default deployContractZkSyncEra;
