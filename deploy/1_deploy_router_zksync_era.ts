import { HardhatRuntimeEnvironment } from "hardhat/types";

import dotenv from 'dotenv';
dotenv.config();

import deployContractZkSyncEra from './deployContractZkSyncEra';

export default async function (hre: HardhatRuntimeEnvironment) {
  try {
    await deployContractZkSyncEra(hre, 'router/', 'Router');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}