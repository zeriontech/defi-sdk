import { ethers } from 'hardhat';

// Returns the time of the last mined block in seconds
const latestTime = async (): Promise<number> => {
  const block = await ethers.provider.getBlock('latest');
  return block?.timestamp || 0;
};

export default latestTime; 
