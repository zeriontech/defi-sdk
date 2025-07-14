import hre from 'hardhat';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { ethers } from 'ethers';

const CONFIG_PATH = path.resolve(__dirname, 'safe_proxy_factory_config.json');
const DEPLOYMENT_PATH = path.resolve(__dirname, 'deployment.json');
const GNOSIS_PROXY_FACTORY_URL = 'https://raw.githubusercontent.com/gnosis/safe-deployments/main/src/assets/v1.3.0/proxy_factory.json';
const DEFAULT_PROXY_FACTORY = '0xFEeAcCE884bc21B53DBe79Abc5279029f78D1B44';
const PROXY_CREATION_TOPIC = ethers.utils.id('ProxyCreation(address,address)');

async function main() {
  // Fetch proxy_factory.json from Gnosis Safe repo
  const { data: proxyFactoryData } = await axios.get(GNOSIS_PROXY_FACTORY_URL);
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const deployment = JSON.parse(fs.readFileSync(DEPLOYMENT_PATH, 'utf-8'));

  // Get current chainId
  const chainIdHex = await hre.network.provider.request({ method: 'eth_chainId' });
  const chainId = parseInt(String(chainIdHex), 16).toString();

  // Find the correct address for this chain
  let address: string | undefined;
  if (proxyFactoryData.networkAddresses?.eip155?.[chainId]) {
    address = proxyFactoryData.networkAddresses.eip155[chainId];
  } else if (proxyFactoryData.networkAddresses?.canonical?.[chainId]) {
    address = proxyFactoryData.networkAddresses.canonical[chainId];
  } else if (proxyFactoryData.networkAddresses?.zksync?.[chainId]) {
    address = proxyFactoryData.networkAddresses.zksync[chainId];
  }
  if (!address) {
    address = DEFAULT_PROXY_FACTORY;
    console.log(`No proxy factory address found for chainId ${chainId}, using default: ${address}`);
  }

  const calldata = config[address.toLowerCase()] || config[address] || '';
  if (!calldata) {
    console.log(`No calldata set for proxy factory address ${address}. Please fill it in safe_proxy_factory_config.json.`);
    return;
  }

  // Send the deployment transaction
  const [signer] = await hre.ethers.getSigners();
  const tx = await signer.sendTransaction({
    to: address,
    data: calldata
  });
  console.log(`Deployment tx sent: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`Deployment tx mined in block ${receipt.blockNumber}`);

  // Find ProxyCreation event in logs
  let proxyAddress: string | undefined;
  for (const log of receipt.logs) {
    if (log.topics[0] === PROXY_CREATION_TOPIC && log.address.toLowerCase() === address.toLowerCase()) {
      // The proxy address is the first indexed parameter (topic[1])
      proxyAddress = '0x' + log.topics[1].slice(26);
      break;
    }
  }
  if (!proxyAddress) {
    console.warn('ProxyCreation event not found in tx logs. feeBeneficiaries not updated.');
    return;
  }
  // Update deployment.json feeBeneficiaries
  deployment.feeBeneficiaries[chainId] = proxyAddress;
  fs.writeFileSync(DEPLOYMENT_PATH, JSON.stringify(deployment, null, 2), 'utf-8');
  console.log(`Updated feeBeneficiaries[${chainId}] = ${proxyAddress} in deployment.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 
