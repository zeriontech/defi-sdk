import { ethers } from 'hardhat';
import type { Signer } from 'ethers';
import buyTokenOnUniswap from '../helpers/buyTokenOnUniswap';
import logChange from '../helpers/logger';
import { wethAddress, ethAddress, daiAddress } from '../helpers/tokens';

const AMOUNT_ABSOLUTE = 2;
const SWAP_FIXED_INPUTS = 1;
const SWAP_FIXED_OUTPUTS = 2;
const EMPTY_BYTES = '0x';

const uniDaiWethAddress = '0xC2e9F25Be6257c210d7Adf0D4Cd6E3E881ba25f8';

const zeroPermit = ['0', EMPTY_BYTES];
const zeroSignature = ['0', EMPTY_BYTES];

describe('UniswapV3Caller', () => {
  let owner: Signer;
  let notOwner: Signer;
  let caller: any;
  let Router: any;
  let Caller: any;
  let router: any;
  let weth: any;
  let dai: any;
  let protocolFeeDefault: [bigint, string];
  const abiCoder = new ethers.AbiCoder();

  async function execute(i: any, out: any, sp: any, as: any, fs: any, opt: any = {}) {
    const ethBefore = await ethers.provider.getBalance(await owner.getAddress());
    const daiBefore = await dai.balanceOf(await owner.getAddress());
    const wethBefore = await weth.balanceOf(await owner.getAddress());

    const tx = await router.execute(i, out, sp, as, fs, opt);
    const receipt = await tx.wait();

    console.log(`Called router for ${receipt.gasUsed} gas`);

    const gasUsed = BigInt(receipt.gasUsed);
    const gasPrice = receipt.gasPrice !== undefined ? BigInt(receipt.gasPrice) : BigInt(0);
    const ethAfter = (await ethers.provider.getBalance(await owner.getAddress())) + (gasUsed * gasPrice);
    logChange(console, 'eth', ethBefore, ethAfter);
    logChange(console, 'dai', daiBefore, await dai.balanceOf(await owner.getAddress()));
    logChange(console, 'weth', wethBefore, await weth.balanceOf(await owner.getAddress()));
  }

  before(async () => {
    Caller = await ethers.getContractFactory('UniswapV3Caller');
    Router = await ethers.getContractFactory('Router');

    [owner, notOwner] = await ethers.getSigners();

    const weth9 = await ethers.getContractAt('IWETH9', wethAddress);

    await weth9.deposit({
      value: ethers.parseEther('2'),
      gasLimit: 1000000,
    });

    caller = await Caller.deploy(wethAddress);

    weth = await ethers.getContractAt('IERC20', wethAddress, owner);
    dai = await ethers.getContractAt('IERC20', daiAddress, owner);

    await buyTokenOnUniswap(owner, daiAddress);
    protocolFeeDefault = [ethers.parseUnits('0', 18), await notOwner.getAddress()];
  });

  beforeEach(async () => {
    router = await Router.deploy();
    await router.setProtocolFeeDefault(protocolFeeDefault);
  });

  it('should do eth -> dai trade fixed inputs', async () => {
    await execute(
      // input
      [[ethAddress, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [daiAddress, ethers.parseUnits('1000', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        await owner.getAddress(),
        await caller.getAddress(),
        abiCoder.encode(
          ['address', 'address', 'address', 'bool', 'uint256', 'bool'],
          [
            ethAddress,
            daiAddress,
            uniDaiWethAddress,
            false,
            ethers.parseUnits('1', 18),
            true,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
      {
        value: ethers.parseEther('1'),
      },
    );
  });

  it('should do dai -> eth trade fixed inputs', async () => {
    const daiAddr = await dai.getAddress();
    await dai.approve(await router.getAddress(), ethers.parseUnits('1000', 18));

    await execute(
      // input
      [[daiAddr, ethers.parseUnits('1000', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethAddress, ethers.parseUnits('0.1', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        await owner.getAddress(),
        await caller.getAddress(),
        abiCoder.encode(
          ['address', 'address', 'address', 'bool', 'uint256', 'bool'],
          [
            daiAddr,
            ethAddress,
            uniDaiWethAddress,
            true,
            ethers.parseUnits('1000', 18),
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
    const wethAddr = await weth.getAddress();
    await weth.approve(await router.getAddress(), ethers.parseUnits('1', 18));
    await execute(
      // input
      [[wethAddr, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [daiAddress, ethers.parseUnits('1000', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        await owner.getAddress(),
        await caller.getAddress(),
        abiCoder.encode(
          ['address', 'address', 'address', 'bool', 'uint256', 'bool'],
          [
            wethAddr,
            daiAddress,
            uniDaiWethAddress,
            false,
            ethers.parseUnits('1', 18),
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
      [[ethAddress, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [daiAddress, ethers.parseUnits('1000', 18)],
      // swap description
      [
        SWAP_FIXED_OUTPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        await owner.getAddress(),
        await caller.getAddress(),
        abiCoder.encode(
          ['address', 'address', 'address', 'bool', 'uint256', 'bool'],
          [
            ethAddress,
            daiAddress,
            uniDaiWethAddress,
            false,
            ethers.parseUnits('1000', 18),
            false,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
      {
        value: ethers.parseEther('1'),
      },
    );
  });

  it('should do dai -> eth trade fixed outputs', async () => {
    const daiAddr = await dai.getAddress();
    await dai.approve(await router.getAddress(), ethers.parseUnits('1000', 18));

    await execute(
      // input
      [[daiAddr, ethers.parseUnits('1000', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethAddress, ethers.parseUnits('0.1', 18)],
      // swap description
      [
        SWAP_FIXED_OUTPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        await owner.getAddress(),
        await caller.getAddress(),
        abiCoder.encode(
          ['address', 'address', 'address', 'bool', 'uint256', 'bool'],
          [
            daiAddr,
            ethAddress,
            uniDaiWethAddress,
            true,
            ethers.parseUnits('0.1', 18),
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
    const wethAddr = await weth.getAddress();
    await weth.approve(await router.getAddress(), ethers.parseUnits('1', 18));

    await execute(
      // input
      [[wethAddr, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [daiAddress, ethers.parseUnits('1000', 18)],
      // swap description
      [
        SWAP_FIXED_OUTPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        await owner.getAddress(),
        await caller.getAddress(),
        abiCoder.encode(
          ['address', 'address', 'address', 'bool', 'uint256', 'bool'],
          [
            wethAddr,
            daiAddress,
            uniDaiWethAddress,
            false,
            ethers.parseUnits('1000', 18),
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
