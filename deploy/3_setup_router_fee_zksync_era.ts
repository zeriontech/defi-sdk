import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Provider } from "zksync-web3";
import * as ethers from 'ethers';

import dotenv from 'dotenv';
dotenv.config();

import deploymentAddresses from '../scripts/deployment';
import * as ContractArtifact from "../artifacts-zk/contracts/router/Router.sol/Router.json";

export default async function (hre: HardhatRuntimeEnvironment) {
  try {
    // @ts-ignore
    const provider = new Provider(hre.userConfig.networks?.zkSyncEra?.url);

    const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    // Initialize contract instance
    const chainIdHex = await hre.network.provider.request({ method: 'eth_chainId' });
    // @ts-ignore
    const chainId = [parseInt(chainIdHex.toString(), 16).toString()];
    const router = new ethers.Contract(
      deploymentAddresses.router[chainId],
      ContractArtifact.abi,
      signer
    );

    console.log(`Working with chainId ${chainId}`);

    const feeSignerTx = await router.functions.setProtocolFeeSigner(
      '0x1e126951a7CB895543E4E4c7B2D1398b3C3d09fC',
    );
    console.log(`Setting fee signer tx hash: ${feeSignerTx.hash}`);

    const feeDefaultTx = await router.functions.setProtocolFeeDefault(
      [
        '5000000000000000',
        deploymentAddresses.feeBeneficiaries[chainId],
      ],
    );
    console.log(`Setting fee defaults tx hash: ${feeDefaultTx.hash}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}