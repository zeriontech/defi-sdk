import { ethers } from 'hardhat';
import type { BigNumberish } from 'ethers';

interface Logger {
  info: (message: string) => void;
}

const logChange = (logger: Logger, name: string, before: BigNumberish, after: BigNumberish) => {
  const beforeBN = ethers.getBigInt(before);
  const afterBN = ethers.getBigInt(after);
  
  if (beforeBN !== afterBN) {
    const difference = beforeBN > afterBN ? beforeBN - afterBN : afterBN - beforeBN;
    const sign = beforeBN > afterBN ? '-' : '+';
    logger.info(
      `${name} balance change is ${sign}${ethers.formatUnits(difference, 18)}`,
    );
  }
};

export default logChange; 
