const { ethers } = require('hardhat');

const logChange = (logger, name, before, after) => {
  if (!before.eq(after)) {
    logger.info(
      `${name} balance change is ${before.gt(after) ? '-' : '+'}${ethers.utils.formatUnits(before.gt(after) ? before.sub(after) : after.sub(before), 18)}`,
    );
  }
};

export default logChange;
