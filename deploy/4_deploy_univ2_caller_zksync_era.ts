
import { HardhatRuntimeEnvironment } from "hardhat/types";

import dotenv from 'dotenv';
dotenv.config();

import deployContractZkSyncEra from './deployContractZkSyncEra';
import deploymentAddresses from "../scripts/deployment";

export default async function (hre: HardhatRuntimeEnvironment) {
  try {
    const chainIdHex = await hre.network.provider.request({ method: 'eth_chainId' });
    const chainId = parseInt(chainIdHex.toString(), 16);
    console.log(`Working with chainId ${chainId}`);

    await deployContractZkSyncEra(hre, 'callers/', 'UniswapV2Caller', [deploymentAddresses.weth[chainId]]);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
