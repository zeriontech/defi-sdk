import { ethers } from 'hardhat';

interface TypedData {
  domain: any;
  types: any;
  message: any;
}

const hashTypedData = async (typedData: TypedData): Promise<string> => {
  return ethers.TypedDataEncoder.hash(typedData.domain, typedData.types, typedData.message);
};

export default hashTypedData; 
