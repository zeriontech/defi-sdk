import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { Signer } from 'ethers';
import buyTokenOnUniswap from '../helpers/buyTokenOnUniswap';
import logChange from '../helpers/logger';
import { wethAddress, ethAddress, daiAddress } from '../helpers/tokens';

const AMOUNT_ABSOLUTE = 2;
const SWAP_FIXED_INPUTS = 1;
const SWAP_FIXED_OUTPUTS = 2;
const EMPTY_BYTES = '0x';

const uniDaiWethAddress = '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11';

const zeroPermit = ['0', EMPTY_BYTES];
const zeroSignature = ['0', EMPTY_BYTES];

<<<<<<<< HEAD:test/callers/UniswapV2SinglePoolCaller.js
describe.only('UniswapV2SinglePoolCaller', () => {
  let owner;
  let notOwner;
  let caller;
  let Router;
  let Caller;
  let router;
  let weth;
  let dai;
  let protocolFeeDefault;
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

    Caller = await ethers.getContractFactory('UniswapV2SinglePoolCaller');
========
describe('UniswapV2Caller', () => {
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

    const gasUsed = BigInt(receipt.gasUsed);
    const gasPrice = receipt.gasPrice !== undefined ? BigInt(receipt.gasPrice) : BigInt(0);
    const ethAfter = (await ethers.provider.getBalance(await owner.getAddress())) + (gasUsed * gasPrice);
    logChange(console, 'eth', ethBefore, ethAfter);
    logChange(console, 'dai', daiBefore, await dai.balanceOf(await owner.getAddress()));
    logChange(console, 'weth', wethBefore, await weth.balanceOf(await owner.getAddress()));
  }

  before(async () => {
    Caller = await ethers.getContractFactory('UniswapV2Caller');
>>>>>>>> upstream/router:test/callers/UniswapV2Caller.ts
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
    protocolFeeDefault = [ethers.parseUnits('0.01', 18), await notOwner.getAddress()];
  });

  beforeEach(async () => {
    router = await Router.deploy();
    await router.setProtocolFeeDefault(protocolFeeDefault);
  });

  it('should not do weth -> dai trade with high slippage', async () => {
    const wethAddr = await weth.getAddress();
    await weth.approve(await router.getAddress(), ethers.parseUnits('1', 18));

    await expect(
      router.execute(
        // input
        [[wethAddr, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [daiAddress, ethers.parseUnits('5000', 18)],
        // swap description
        [
          SWAP_FIXED_INPUTS,
          protocolFeeDefault,
          protocolFeeDefault,
          await owner.getAddress(),
          await caller.getAddress(),
          abiCoder.encode(
            ['address', 'address', 'address', 'uint8', 'uint256'],
            [
              wethAddr,
              daiAddress,
              uniDaiWethAddress,
              SWAP_FIXED_INPUTS,
              ethers.parseUnits('1', 18),
            ],
          ),
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should do weth -> dai trade', async () => {
    const wethAddr = await weth.getAddress();
    await weth.approve(await router.getAddress(), ethers.parseUnits('1', 18));

<<<<<<<< HEAD:test/callers/UniswapV2SinglePoolCaller.js
    console.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
    console.info(
      `weth balance is ${ethers.utils.formatUnits(await weth.balanceOf(owner.address), 18)}`,
    );
    const tx = await router.functions.execute(
========
    await execute(
>>>>>>>> upstream/router:test/callers/UniswapV2Caller.ts
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
          ['address', 'address', 'address', 'uint8', 'uint256'],
          [
            wethAddr,
            daiAddress,
            uniDaiWethAddress,
            SWAP_FIXED_INPUTS,
            ethers.parseUnits('1', 18),
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
<<<<<<<< HEAD:test/callers/UniswapV2SinglePoolCaller.js
    console.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
    console.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
    console.info(
      `weth balance is ${ethers.utils.formatUnits(await weth.balanceOf(owner.address), 18)}`,
    );
  });

  it('should do eth -> dai trade', async () => {
    await router.setProtocolFeeDefault(protocolFeeDefault);

    console.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
    const tx = await router.functions.execute(
========
  });

  it('should do eth -> dai trade', async () => {
    await execute(
>>>>>>>> upstream/router:test/callers/UniswapV2Caller.ts
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
          ['address', 'address', 'address', 'uint8', 'uint256'],
          [
            ethAddress,
            daiAddress,
            uniDaiWethAddress,
            SWAP_FIXED_INPUTS,
            ethers.parseUnits('1', 18),
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
<<<<<<<< HEAD:test/callers/UniswapV2SinglePoolCaller.js
    console.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
    console.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
========
>>>>>>>> upstream/router:test/callers/UniswapV2Caller.ts
  });

  it('should not do eth -> dai trade with too large marketplace fee', async () => {
    await expect(
      router.execute(
        // input
        [[ethAddress, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [daiAddress, ethers.parseUnits('1000', 18)],
        // swap description
        [
          SWAP_FIXED_INPUTS,
          protocolFeeDefault,
          [ethers.parseUnits('1.1', 18), await notOwner.getAddress()],
          await owner.getAddress(),
          await caller.getAddress(),
          abiCoder.encode(
            ['address', 'address', 'address', 'uint8', 'uint256'],
            [
              ethAddress,
              daiAddress,
              uniDaiWethAddress,
              SWAP_FIXED_INPUTS,
              ethers.parseUnits('1', 18),
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
      ),
    ).to.be.reverted;
  });

  it('should not do eth -> dai trade with high slippage', async () => {
    await expect(
      router.execute(
        // input
        [[ethAddress, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [daiAddress, ethers.parseUnits('5000', 18)],
        // swap description
        [
          SWAP_FIXED_OUTPUTS,
          protocolFeeDefault,
          protocolFeeDefault,
          await owner.getAddress(),
          await caller.getAddress(),
          abiCoder.encode(
            ['address', 'address', 'address', 'uint8', 'uint256'],
            [
              ethAddress,
              daiAddress,
              uniDaiWethAddress,
              SWAP_FIXED_OUTPUTS,
              ethers.parseUnits('5000', 18),
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
      ),
    ).to.be.reverted;
  });

  it('should not do dai -> eth trade with 0 input', async () => {
    const daiAddr = await dai.getAddress();
    await dai.approve(await router.getAddress(), ethers.parseUnits('500', 18));

    await expect(
      router.execute(
        // input
        [[daiAddr, ethers.parseUnits('0', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, ethers.parseUnits('0', 18)],
        // swap description
        [
          SWAP_FIXED_INPUTS,
          protocolFeeDefault,
          protocolFeeDefault,
          await owner.getAddress(),
          await caller.getAddress(),
          abiCoder.encode(
            ['address', 'address', 'address', 'uint8', 'uint256'],
            [
              daiAddr,
              ethAddress,
              uniDaiWethAddress,
              SWAP_FIXED_INPUTS,
              ethers.parseUnits('0', 18),
            ],
          ),
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should do dai -> eth trade', async () => {
    const daiAddr = await dai.getAddress();
    await dai.approve(await router.getAddress(), ethers.parseUnits('500', 18));

<<<<<<<< HEAD:test/callers/UniswapV2SinglePoolCaller.js
    console.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
    const tx = await router.functions.execute(
========
    await execute(
>>>>>>>> upstream/router:test/callers/UniswapV2Caller.ts
      // input
      [[daiAddr, ethers.parseUnits('500', 18), AMOUNT_ABSOLUTE], zeroPermit],
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
          ['address', 'address', 'address', 'uint8', 'uint256'],
          [
            daiAddr,
            ethAddress,
            uniDaiWethAddress,
            SWAP_FIXED_INPUTS,
            ethers.parseUnits('500', 18),
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
<<<<<<<< HEAD:test/callers/UniswapV2SinglePoolCaller.js
    console.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
    console.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
========
>>>>>>>> upstream/router:test/callers/UniswapV2Caller.ts
  });

  it('should not do dai -> weth trade with 0 output', async () => {
    const daiAddr = await dai.getAddress();
    await dai.approve(await router.getAddress(), ethers.parseUnits('500', 18));

    await expect(
      router.execute(
        // input
        [[daiAddr, ethers.parseUnits('0', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [wethAddress, ethers.parseUnits('0', 18)],
        // swap description
        [
          SWAP_FIXED_OUTPUTS,
          protocolFeeDefault,
          protocolFeeDefault,
          await owner.getAddress(),
          await caller.getAddress(),
          abiCoder.encode(
            ['address', 'address', 'address', 'uint8', 'uint256'],
            [
              daiAddr,
              wethAddress,
              uniDaiWethAddress,
              SWAP_FIXED_OUTPUTS,
              ethers.parseUnits('0', 18),
            ],
          ),
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

<<<<<<<< HEAD:test/callers/UniswapV2SinglePoolCaller.js
========
  it('should not do dai -> weth trade with empty path', async () => {
    const daiAddr = await dai.getAddress();
    await dai.approve(await router.getAddress(), ethers.parseUnits('1', 18));

    await expect(
      router.execute(
        // input
        [[daiAddr, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [wethAddress, ethers.parseUnits('1', 18)],
        // swap description
        [
          SWAP_FIXED_OUTPUTS,
          protocolFeeDefault,
          protocolFeeDefault,
          await owner.getAddress(),
          await caller.getAddress(),
          abiCoder.encode(
            ['address', 'address', 'address[]', 'bool[]', 'uint8', 'uint256'],
            [
              daiAddr,
              wethAddress,
              [],
              [],
              SWAP_FIXED_OUTPUTS,
              ethers.parseUnits((1 / 0.98).toString(), 18),
            ],
          ),
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not do dai -> weth trade with bad directions length', async () => {
    const daiAddr = await dai.getAddress();
    await dai.approve(await router.getAddress(), ethers.parseUnits('500', 18));

    await expect(
      router.execute(
        // input
        [[daiAddr, ethers.parseUnits('500', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [wethAddress, ethers.parseUnits('0.1', 18)],
        // swap description
        [
          SWAP_FIXED_OUTPUTS,
          protocolFeeDefault,
          protocolFeeDefault,
          await owner.getAddress(),
          await caller.getAddress(),
          abiCoder.encode(
            ['address', 'address', 'address[]', 'bool[]', 'uint8', 'uint256'],
            [
              daiAddr,
              wethAddress,
              [uniDaiWethAddress],
              [true, false],
              SWAP_FIXED_OUTPUTS,
              ethers.parseUnits((1 / 0.98).toString(), 18),
            ],
          ),
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

>>>>>>>> upstream/router:test/callers/UniswapV2Caller.ts
  it('should not do dai -> weth trade with huge fee', async () => {
    const daiAddr = await dai.getAddress();
    await dai.approve(await router.getAddress(), ethers.parseUnits('500', 18));

    await expect(
      router.execute(
        // input
        [[daiAddr, ethers.parseUnits('500', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [wethAddress, ethers.parseUnits('0.1', 18)],
        // swap description
        [
          SWAP_FIXED_OUTPUTS,
          protocolFeeDefault,
          protocolFeeDefault,
          await owner.getAddress(),
          await caller.getAddress(),
          abiCoder.encode(
            ['address', 'address', 'address', 'uint8', 'uint256'],
            [
              daiAddr,
              wethAddress,
              uniDaiWethAddress,
              SWAP_FIXED_OUTPUTS,
              ethers.parseUnits((1 / 0.97).toString(), 18),
            ],
          ),
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should do dai -> weth trade', async () => {
    const daiAddr = await dai.getAddress();
    await dai.approve(await router.getAddress(), ethers.parseUnits('500', 18));

<<<<<<<< HEAD:test/callers/UniswapV2SinglePoolCaller.js
    console.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
    console.info(
      `weth balance is ${ethers.utils.formatUnits(await weth.balanceOf(owner.address), 18)}`,
    );
    const tx = await router.functions.execute(
========
    await execute(
>>>>>>>> upstream/router:test/callers/UniswapV2Caller.ts
      // input
      [[daiAddr, ethers.parseUnits('500', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [wethAddress, ethers.parseUnits('0.1', 18)],
      // swap description
      [
        SWAP_FIXED_OUTPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        await owner.getAddress(),
        await caller.getAddress(),
        abiCoder.encode(
          ['address', 'address', 'address', 'uint8', 'uint256'],
          [
            daiAddr,
            wethAddress,
            uniDaiWethAddress,
            SWAP_FIXED_OUTPUTS,
            ethers.parseUnits('0.102', 18).toString(), // 0.1 * 1.02
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
<<<<<<<< HEAD:test/callers/UniswapV2SinglePoolCaller.js
    console.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
    console.info(
      `dai balance is ${ethers.utils.formatUnits(await dai.balanceOf(owner.address), 18)}`,
    );
    console.info(
      `weth balance is ${ethers.utils.formatUnits(await weth.balanceOf(owner.address), 18)}`,
    );
========
>>>>>>>> upstream/router:test/callers/UniswapV2Caller.ts
  });

  it('should not do dai -> weth trade with high token slippage', async () => {
    const daiAddr = await dai.getAddress();
    await dai.approve(await router.getAddress(), ethers.parseUnits('500', 18));

    await expect(
      router.execute(
        // input
        [[daiAddr, ethers.parseUnits('500', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [wethAddress, ethers.parseUnits('1', 18)],
        // swap description
        [
          SWAP_FIXED_OUTPUTS,
          protocolFeeDefault,
          protocolFeeDefault,
          await owner.getAddress(),
          await caller.getAddress(),
          abiCoder.encode(
            ['address', 'address', 'address', 'uint8', 'uint256'],
            [
              daiAddr,
              wethAddress,
              uniDaiWethAddress,
              SWAP_FIXED_OUTPUTS,
              ethers.parseUnits('1', 18),
            ],
          ),
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not do dai -> weth trade with not enough liquidity', async () => {
    const daiAddr = await dai.getAddress();
    await dai.approve(await router.getAddress(), ethers.parseUnits('500', 18));

    await expect(
      router.execute(
        // input
        [[daiAddr, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [wethAddress, ethers.parseUnits('0', 18)],
        // swap description
        [
          SWAP_FIXED_OUTPUTS,
          protocolFeeDefault,
          protocolFeeDefault,
          await owner.getAddress(),
          await caller.getAddress(),
          abiCoder.encode(
            ['address', 'address', 'address', 'uint8', 'uint256'],
            [
              daiAddr,
              wethAddress,
              uniDaiWethAddress,
              SWAP_FIXED_OUTPUTS,
              ethers.parseUnits('20000', 18),
            ],
          ),
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });
}); 
