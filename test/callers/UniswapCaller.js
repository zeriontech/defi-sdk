import buyTokenOnUniswap from '../helpers/buyTokenOnUniswap';
import { wethAddress, ethAddress, daiAddress } from '../helpers/tokens';

const { expect } = require('chai');

const { ethers } = require('hardhat');

const { AddressZero } = ethers.constants;

const AMOUNT_ABSOLUTE = 2;
const SWAP_FIXED_INPUTS = 1;
const SWAP_FIXED_OUTPUTS = 2;
const EMPTY_BYTES = '0x';
const EXECUTE_SIGNATURE =
  'execute(((address,uint256,uint8),(uint8,bytes)),(address,uint256),(uint8,(uint256,address),address,address,bytes))';

const uniDaiWethAddress = '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11';

describe('UniswapCaller', () => {
  let owner;
  let caller;
  let Router;
  let Caller;
  let router;
  let weth;
  let dai;
  const logger = new ethers.utils.Logger('1');
  const abiCoder = new ethers.utils.AbiCoder();

  before(async () => {
    Caller = await ethers.getContractFactory('UniswapCaller');
    Router = await ethers.getContractFactory('Router');

    [owner] = await ethers.getSigners();

    const weth9 = await ethers.getContractAt('IWETH9', wethAddress);

    await weth9.deposit({
      value: ethers.utils.parseEther('2'),
      gasLimit: 1000000,
    });

    caller = await Caller.deploy();

    weth = await ethers.getContractAt('IERC20', wethAddress, owner);
    dai = await ethers.getContractAt('IERC20', daiAddress, owner);
  });

  beforeEach(async () => {
    router = await Router.deploy();
  });

  it('should not execute uni weth -> dai swap (fixed outputs) with empty path', async () => {
    await buyTokenOnUniswap(owner, daiAddress);
    await weth.approve(router.address, ethers.utils.parseUnits('1', 18));
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [wethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // outputs
        [daiAddress, ethers.utils.parseUnits('1000', 18)],
        // swap description
        [
          SWAP_FIXED_OUTPUTS,
          ['0', AddressZero],
          uniDaiWethAddress,
          caller.address,
          abiCoder.encode(
            ['bytes'],
            [
              abiCoder.encode(
                ['address[]', 'bool[]', 'uint8', 'uint256'],
                [[], [false], 2, ethers.utils.parseUnits('1000', 18)],
              ),
            ],
          ),
        ],
      ),
    ).to.be.reverted;
  });

  it('should not execute uni weth -> dai swap (fixed outputs) with 0 output', async () => {
    await weth.approve(router.address, ethers.utils.parseUnits('1', 18));
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [wethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // outputs
        [daiAddress, ethers.utils.parseUnits('0', 18)],
        // swap description
        [
          SWAP_FIXED_OUTPUTS,
          ['0', AddressZero],
          uniDaiWethAddress,
          caller.address,
          abiCoder.encode(
            ['bytes'],
            [
              abiCoder.encode(
                ['address[]', 'bool[]', 'uint8', 'uint256'],
                [[uniDaiWethAddress], [false], 2, ethers.utils.parseUnits('0', 18)],
              ),
            ],
          ),
        ],
      ),
    ).to.be.reverted;
  });

  it('should execute uni weth -> dai swap (fixed outputs)', async () => {
    await buyTokenOnUniswap(owner, daiAddress);
    await weth.approve(router.address, ethers.utils.parseUnits('1', 18));
    logger.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
    const tx = await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [wethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // outputs
      [daiAddress, ethers.utils.parseUnits('1000', 18)],
      // swap description
      [
        SWAP_FIXED_OUTPUTS,
        ['0', AddressZero],
        uniDaiWethAddress,
        caller.address,
        abiCoder.encode(
          ['bytes'],
          [
            abiCoder.encode(
              ['address[]', 'bool[]', 'uint8', 'uint256'],
              [[uniDaiWethAddress], [false], 2, ethers.utils.parseUnits('1000', 18)],
            ),
          ],
        ),
      ],
    );
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
    logger.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
  });

  it('should execute uni eth -> dai swap (fixed outputs)', async () => {
    logger.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
    logger.info(`eth balance is ${ethers.utils.formatUnits(await owner.getBalance(), 18)}`);
    const tx = await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [ethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // outputs
      [daiAddress, ethers.utils.parseUnits('100', 18)],
      // swap description
      [
        SWAP_FIXED_OUTPUTS,
        ['0', AddressZero],
        uniDaiWethAddress,
        caller.address,
        abiCoder.encode(
          ['bytes'],
          [
            abiCoder.encode(
              ['address[]', 'bool[]', 'uint8', 'uint256'],
              [[uniDaiWethAddress], [false], 2, ethers.utils.parseUnits('100', 18)],
            ),
          ],
        ),
      ],
      {
        value: ethers.utils.parseUnits('1', 18),
      },
    );
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
    logger.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
    logger.info(`eth balance is ${ethers.utils.formatUnits(await owner.getBalance(), 18)}`);
  });

  it('should not execute uni weth -> dai swap (fixed inputs) with 0 input', async () => {
    await weth.approve(router.address, ethers.utils.parseUnits('1', 18));
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // i  nput
        [
          [wethAddress, '0', AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [daiAddress, '0'],
        // swap description
        [
          SWAP_FIXED_INPUTS,
          ['0', AddressZero],
          uniDaiWethAddress,
          caller.address,
          abiCoder.encode(
            ['bytes'],
            [
              abiCoder.encode(
                ['address[]', 'bool[]', 'uint8', 'uint256'],
                [[uniDaiWethAddress], [false], 1, '0'],
              ),
            ],
          ),
        ],
      ),
    ).to.be.reverted;
  });

  it('should execute uni weth -> dai swap (fixed inputs)', async () => {
    await weth.approve(router.address, ethers.utils.parseUnits('1', 18));
    logger.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
    logger.info(
      `weth balance is ${ethers.utils.formatUnits(await weth.balanceOf(owner.address), 18)}`,
    );
    const tx = await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [wethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [daiAddress, ethers.utils.parseUnits('100', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        ['0', AddressZero],
        uniDaiWethAddress,
        caller.address,
        abiCoder.encode(
          ['bytes'],
          [
            abiCoder.encode(
              ['address[]', 'bool[]', 'uint8', 'uint256'],
              [[uniDaiWethAddress], [false], 1, ethers.utils.parseUnits('1', 18)],
            ),
          ],
        ),
      ],
    );
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
    logger.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
    logger.info(
      `weth balance is ${ethers.utils.formatUnits(await weth.balanceOf(owner.address), 18)}`,
    );
  });

  it('should not execute uni eth -> dai swap (fixed inputs) with empty path', async () => {
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [ethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [daiAddress, ethers.utils.parseUnits('100', 18)],
        // swap description
        [
          SWAP_FIXED_INPUTS,
          ['0', AddressZero],
          uniDaiWethAddress,
          caller.address,
          abiCoder.encode(
            ['bytes'],
            [
              abiCoder.encode(
                ['address[]', 'bool[]', 'uint8', 'uint256'],
                [[], [false], 1, ethers.utils.parseUnits('1', 18)],
              ),
            ],
          ),
        ],
        {
          value: ethers.utils.parseUnits('1', 18),
        },
      ),
    ).to.be.reverted;
  });

  it('should execute uni eth -> dai swap (fixed inputs)', async () => {
    logger.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
    const tx = await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [ethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [daiAddress, ethers.utils.parseUnits('100', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        ['0', AddressZero],
        uniDaiWethAddress,
        caller.address,
        abiCoder.encode(
          ['bytes'],
          [
            abiCoder.encode(
              ['address[]', 'bool[]', 'uint8', 'uint256'],
              [[uniDaiWethAddress], [false], 1, ethers.utils.parseUnits('1', 18)],
            ),
          ],
        ),
      ],
      {
        value: ethers.utils.parseUnits('1', 18),
      },
    );
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
    logger.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
  });
});
