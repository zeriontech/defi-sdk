import { ethers } from 'hardhat';

export default async function deployContract(contractName: string, constructorArgs: any[] = []): Promise<string> {
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy(...constructorArgs);

  console.log(`${contractName} deployed to: ${await contract.getAddress()}`);

  return await contract.getAddress();
} 
