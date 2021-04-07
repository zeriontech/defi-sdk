import { wethAddress } from './tokens';

const buyTokenOnUniswap = async (signer, tokenAddress) => {
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
    signer.address,
    FUTURE_TIMESTAMP,
    {
      value: ethers.utils.parseUnits('1', 18),
    },
  );
};

export default buyTokenOnUniswap;
