import { ethers } from 'hardhat';
import type { Signer } from 'ethers';
import { wethAddress } from './tokens';

const buyTokenOnUniswap = async (signer: Signer, tokenAddress: string): Promise<void> => {
  const uniswapRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
  const FUTURE_TIMESTAMP = 1893456000;
  const uniswapRouter = await ethers.getContractAt(
    'IUniswapV2Router02',
    uniswapRouterAddress,
    signer,
  );
  await uniswapRouter.swapExactETHForTokens(
    '0',
    [wethAddress, tokenAddress],
    await signer.getAddress(),
    FUTURE_TIMESTAMP,
    {
      value: ethers.parseEther('1'),
    },
  );
};

export default buyTokenOnUniswap; 
