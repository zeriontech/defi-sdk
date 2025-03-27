
import { HardhatRuntimeEnvironment } from "hardhat/types";
import deploymentAddresses from "../scripts/deployment";

import dotenv from 'dotenv';
dotenv.config();

import deployContractZkSyncEra from './deployContractZkSyncEra';

export default async function (hre: HardhatRuntimeEnvironment) {
  try {
    const chainIdHex = await hre.network.provider.request({ method: 'eth_chainId' });
    const chainId = parseInt(chainIdHex.toString(), 16);
    console.log(`Working with chainId ${chainId}`);
    await deployContractZkSyncEra(hre, 'callers/', 'SimpleCallerWithPermit2', [deploymentAddresses.universalRouter[chainId], deploymentAddresses.permit2[chainId]]);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
