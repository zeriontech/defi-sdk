import buyTokenOnUniswap from '../helpers/buyTokenOnUniswap';
import logChange from '../helpers/logger';
import { wethAddress, ethAddress, daiAddress } from '../helpers/tokens';

const { ethers } = require('hardhat');

const AMOUNT_ABSOLUTE = 2;
const SWAP_FIXED_INPUTS = 1;
const SWAP_FIXED_OUTPUTS = 2;
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
  let weth;
  let dai;
  let protocolFeeDefault;
  const logger = new ethers.utils.Logger('1');
  const abiCoder = new ethers.utils.AbiCoder();

  async function execute(i, out, sp, as, fs, opt = {}) {
    const ethBefore = await owner.getBalance();
    const daiBefore = await dai.balanceOf(owner.address);
    const wethBefore = await weth.balanceOf(owner.address);

    const tx = await router.functions.execute(i, out, sp, as, fs, opt);
    const receipt = await tx.wait();

    logger.info(`Called router for ${receipt.gasUsed} gas`);

    logChange(logger, 'eth', ethBefore, (await owner.getBalance()).add(receipt.gasUsed.mul(receipt.effectiveGasPrice)));
    logChange(logger, 'dai', daiBefore, await dai.balanceOf(owner.address));
    logChange(logger, 'weth', wethBefore, await weth.balanceOf(owner.address));
  }

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

    weth = await ethers.getContractAt('IERC20', wethAddress, owner);
    dai = await ethers.getContractAt('IERC20', daiAddress, owner);

    await buyTokenOnUniswap(owner, daiAddress);
    protocolFeeDefault = [ethers.utils.parseUnits('0', 18), notOwner.address];
  });

  beforeEach(async () => {
    router = await Router.deploy();
    await router.setProtocolFeeDefault(protocolFeeDefault);
  });

  it('should do eth -> dai trade fixed inputs', async () => {
    await execute(
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
          ['address', 'address', 'address', 'bool', 'uint256', 'bool'],
          [
            ethAddress,
            daiAddress,
            uniDaiWethAddress,
            false,
            ethers.utils.parseUnits('1', 18),
            true,
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
  });

  it('should do dai -> eth trade fixed inputs', async () => {
    await dai.approve(router.address, ethers.utils.parseUnits('1000', 18));

    await execute(
      // input
      [[daiAddress, ethers.utils.parseUnits('1000', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethAddress, ethers.utils.parseUnits('0.1', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        owner.address,
        caller.address,
        abiCoder.encode(
          ['address', 'address', 'address', 'bool', 'uint256', 'bool'],
          [
            daiAddress,
            ethAddress,
            uniDaiWethAddress,
            true,
            ethers.utils.parseUnits('1000', 18),
            true,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should do weth -> dai trade fixed inputs', async () => {
    await weth.approve(router.address, ethers.utils.parseUnits('1', 18));

    await execute(
      // input
      [[wethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
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
          ['address', 'address', 'address', 'bool', 'uint256', 'bool'],
          [
            wethAddress,
            daiAddress,
            uniDaiWethAddress,
            false,
            ethers.utils.parseUnits('1', 18),
            true,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should do eth -> dai trade fixed outputs', async () => {
    await execute(
      // input
      [[ethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [daiAddress, ethers.utils.parseUnits('1000', 18)],
      // swap description
      [
        SWAP_FIXED_OUTPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        owner.address,
        caller.address,
        abiCoder.encode(
          ['address', 'address', 'address', 'bool', 'uint256', 'bool'],
          [
            ethAddress,
            daiAddress,
            uniDaiWethAddress,
            false,
            ethers.utils.parseUnits('1000', 18),
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
  });

  it('should do dai -> eth trade fixed outputs', async () => {
    await dai.approve(router.address, ethers.utils.parseUnits('1000', 18));

    await execute(
      // input
      [[daiAddress, ethers.utils.parseUnits('1000', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethAddress, ethers.utils.parseUnits('0.1', 18)],
      // swap description
      [
        SWAP_FIXED_OUTPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        owner.address,
        caller.address,
        abiCoder.encode(
          ['address', 'address', 'address', 'bool', 'uint256', 'bool'],
          [
            daiAddress,
            ethAddress,
            uniDaiWethAddress,
            true,
            ethers.utils.parseUnits('0.1', 18),
            false,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should do weth -> dai trade fixed outputs', async () => {
    await weth.approve(router.address, ethers.utils.parseUnits('1', 18));

    await execute(
      // input
      [[wethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [daiAddress, ethers.utils.parseUnits('1000', 18)],
      // swap description
      [
        SWAP_FIXED_OUTPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        owner.address,
        caller.address,
        abiCoder.encode(
          ['address', 'address', 'address', 'bool', 'uint256', 'bool'],
          [
            wethAddress,
            daiAddress,
            uniDaiWethAddress,
            false,
            ethers.utils.parseUnits('1000', 18),
            false,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });
});
