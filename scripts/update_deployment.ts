import fs from 'fs';
import path from 'path';

const DEPLOYMENT_FILE = path.resolve(__dirname, 'deployment.json');

export default function updateDeploymentAddress(
  contractType: string,
  chainId: string,
  address: string
): void {
  const fileContent = fs.readFileSync(DEPLOYMENT_FILE, 'utf-8');
  const deploymentAddresses = JSON.parse(fileContent);

  if (!deploymentAddresses[contractType]) {
    deploymentAddresses[contractType] = {};
  }
  deploymentAddresses[contractType][chainId] = address;

  const newContent = JSON.stringify(deploymentAddresses, null, 2);
  fs.writeFileSync(DEPLOYMENT_FILE, newContent, 'utf-8');
}

// CLI handler
if (require.main === module) {
  const [,, contractType, chainId, address] = process.argv;
  if (!contractType || !chainId || !address) {
    console.error('Usage: ts-node scripts/update_deployment.ts <contractType> <chainId> <address>');
    process.exit(1);
  }
  updateDeploymentAddress(contractType, chainId, address);
} 
