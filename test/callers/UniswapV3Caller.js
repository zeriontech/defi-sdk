import buyTokenOnUniswap from '../helpers/buyTokenOnUniswap';
import { wethAddress, ethAddress, daiAddress } from '../helpers/tokens';

const { ethers } = require('hardhat');

const AMOUNT_ABSOLUTE = 2;
const SWAP_FIXED_INPUTS = 1;
const EMPTY_BYTES = '0x';

const uniDaiWethAddress = '0xC2e9F25Be6257c210d7Adf0D4Cd6E3E881ba25f8';

const zeroPermit = ['0', EMPTY_BYTES];
const zeroSignature = ['0', EMPTY_BYTES];

describe('UniswapV3Caller', () => {
  let owner;
  let notOwner;
  let caller;
  let Router;
  let Caller;
  let router;
  //   let weth;
  let dai;
  let protocolFeeDefault;
  const logger = new ethers.utils.Logger('1');
  const abiCoder = new ethers.utils.AbiCoder();

  before(async () => {
    // await network.provider.request({
    //   method: "hardhat_reset",
    //   params: [
    //     {
    //       forking: {
    //         jsonRpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    //       },
    //     },
    //   ],
    // });

    Caller = await ethers.getContractFactory('UniswapV3Caller');
    Router = await ethers.getContractFactory('Router');

    [owner, notOwner] = await ethers.getSigners();

    const weth9 = await ethers.getContractAt('IWETH9', wethAddress);

    await weth9.deposit({
      value: ethers.utils.parseEther('2'),
      gasLimit: 1000000,
    });

    caller = await Caller.deploy(wethAddress);

    // weth = await ethers.getContractAt('IERC20', wethAddress, owner);
    dai = await ethers.getContractAt('IERC20', daiAddress, owner);

    await buyTokenOnUniswap(owner, daiAddress);
    protocolFeeDefault = [ethers.utils.parseUnits('0.01', 18), notOwner.address];
  });

  beforeEach(async () => {
    router = await Router.deploy();
  });

  it.only('should do eth -> dai trade', async () => {
    await router.setProtocolFeeDefault(protocolFeeDefault);

    logger.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
    const tx = await router.functions.execute(
      // input
      [[ethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [daiAddress, ethers.utils.parseUnits('1000', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        owner.address,
        caller.address,
        abiCoder.encode(
          ['address', 'address', 'address', 'uint256', 'bool'],
          [
            ethAddress,
            daiAddress,
            uniDaiWethAddress,
            ethers.utils.parseUnits('1', 18),
            false,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
      {
        value: ethers.utils.parseEther('1'),
      },
    );
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
    logger.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
  });
});
