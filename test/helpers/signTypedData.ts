import { ethers } from 'hardhat';
import type { Wallet } from 'ethers';

interface TypedData {
  domain: any;
  types: any;
  message: any;
}

const signTypedData = async (wallet: Wallet, typedData: TypedData) => {
  const signature = await wallet.signTypedData(
    typedData.domain,
    typedData.types,
    typedData.message,
  );
  return ethers.Signature.from(signature);
};

export default signTypedData; 
