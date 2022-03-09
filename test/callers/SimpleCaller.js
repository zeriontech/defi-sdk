import { wethAddress, ethAddress } from '../helpers/tokens';

const { expect } = require('chai');

const { ethers } = require('hardhat');

const { AddressZero } = ethers.constants;

const AMOUNT_ABSOLUTE = 2;
const SWAP_FIXED_INPUTS = 1;
const SWAP_FIXED_OUTPUTS = 2;
const EMPTY_BYTES = '0x';

const zeroPermit = ['0', EMPTY_BYTES];
const zeroSignature = ['0', EMPTY_BYTES];

describe('SimpleCaller', () => {
  let owner;
  let notOwner;
  let caller;
  let Router;
  let Caller;
  let router;
  let weth;
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

    Caller = await ethers.getContractFactory('SimpleCaller');
    Router = await ethers.getContractFactory('Router');

    [owner, notOwner] = await ethers.getSigners();

    caller = await Caller.deploy();

    weth = await ethers.getContractAt('IERC20', wethAddress, owner);

    protocolFeeDefault = [ethers.utils.parseUnits('0', 18), AddressZero];
  });

  // after(async () => {
  //   await network.provider.request({
  //     method: "hardhat_reset",
  //     params: [],
  //   });
  // })

  beforeEach(async () => {
    router = await Router.deploy();
  });

  it('should do eth -> weth trade', async () => {
    const initialBalance = await weth.balanceOf(owner.address);
    const tx = await router.functions.execute(
      // input
      [[ethAddress, ethers.utils.parseUnits('2', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [weth.address, ethers.utils.parseUnits('2', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        owner.address,
        caller.address,
        abiCoder.encode(
          ['address', 'address', 'address', 'bytes', 'address'],
          [
            ethAddress,
            AddressZero,
            weth.address,
            '0x',
            weth.address,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
      {
        value: ethers.utils.parseUnits('2', 18),
      },
    );
    expect(
      (await weth.balanceOf(owner.address)).sub(initialBalance),
    ).to.be.equal(ethers.utils.parseUnits('2', 18));
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
  });

  it('should not do eth -> weth trade with ', async () => {
    const initialBalance = await weth.balanceOf(owner.address);
    const tx = await router.functions.execute(
      // input
      [[ethAddress, ethers.utils.parseUnits('2', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [weth.address, ethers.utils.parseUnits('2', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        owner.address,
        caller.address,
        abiCoder.encode(
          ['address', 'address', 'address', 'bytes', 'address'],
          [
            ethAddress,
            AddressZero,
            weth.address,
            '0x',
            weth.address,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
      {
        value: ethers.utils.parseUnits('2', 18),
      },
    );
    expect(
      (await weth.balanceOf(owner.address)).sub(initialBalance),
    ).to.be.equal(ethers.utils.parseUnits('2', 18));
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
  });

  it('should do zero -> weth trade', async () => {
    const initialBalance = await weth.balanceOf(owner.address);
    const tx = await router.functions.execute(
      // input
      [[AddressZero, ethers.utils.parseUnits('0', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [weth.address, ethers.utils.parseUnits('0', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        owner.address,
        caller.address,
        abiCoder.encode(
          ['address', 'address', 'address', 'bytes', 'address'],
          [
            AddressZero,
            AddressZero,
            weth.address,
            '0x',
            weth.address,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
    expect(
      (await weth.balanceOf(owner.address)).sub(initialBalance),
    ).to.be.equal(ethers.utils.parseUnits('0', 18));
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
  });

  it('should not do eth -> weth trade with unfairly large fees', async () => {
    await expect(
      router.functions.execute(
        // input
        [[ethAddress, ethers.utils.parseUnits('1.1', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [weth.address, ethers.utils.parseUnits('1', 18)],
        // swap description
        [
          SWAP_FIXED_OUTPUTS,
          protocolFeeDefault,
          [ethers.utils.parseUnits('0.01', 18), notOwner.address],
          owner.address,
          caller.address,
          abiCoder.encode(
            ['address', 'address', 'address', 'bytes', 'address'],
            [
              ethAddress,
              AddressZero,
              weth.address,
              '0x',
              weth.address,
            ],
          ),
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
        {
          value: ethers.utils.parseUnits('1.1', 18),
        },
      ),
    ).to.be.reverted;
  });

  it('should not do eth -> weth trade with 0 return token', async () => {
    await expect(
      router.functions.execute(
        // input
        [[ethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [weth.address, ethers.utils.parseUnits('1', 18)],
        // swap description
        [
          SWAP_FIXED_OUTPUTS,
          protocolFeeDefault,
          protocolFeeDefault,
          owner.address,
          caller.address,
          abiCoder.encode(
            ['address', 'address', 'address', 'bytes', 'address'],
            [
              ethAddress,
              AddressZero,
              weth.address,
              '0x',
              AddressZero,
            ],
          ),
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
        {
          value: ethers.utils.parseUnits('1', 18),
        },
      ),
    ).to.be.reverted;
  });

  it('should not do eth -> weth trade with 0 callee', async () => {
    await expect(
      router.functions.execute(
        // input
        [[ethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [weth.address, ethers.utils.parseUnits('1', 18)],
        // swap description
        [
          SWAP_FIXED_INPUTS,
          protocolFeeDefault,
          protocolFeeDefault,
          owner.address,
          caller.address,
          abiCoder.encode(
            ['address', 'address', 'address', 'bytes', 'address'],
            [
              ethAddress,
              AddressZero,
              AddressZero,
              '0x',
              weth.address,
            ],
          ),
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
        {
          value: ethers.utils.parseUnits('1', 18),
        },
      ),
    ).to.be.reverted;
  });

  it('should do weth -> eth trade', async () => {
    let initialBalance = await weth.balanceOf(owner.address);
    await weth.approve(router.address, ethers.utils.parseUnits('1', 18));
    const tx = await router.functions.execute(
      // input
      [[weth.address, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethAddress, ethers.utils.parseUnits('1', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        owner.address,
        caller.address,
        abiCoder.encode(
          ['address', 'address', 'address', 'bytes', 'address'],
          [
            weth.address,
            AddressZero,
            weth.address,
            '0x2e1a7d4d0000000000000000000000000000000000000000000000000de0b6b3a7640000',
            ethAddress,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
    expect(
      (initialBalance).sub(await weth.balanceOf(owner.address)),
    ).to.be.equal(ethers.utils.parseUnits('1', 18));
  });

  it('should do weth -> zero trade with no effect no allowance', async () => {
    await weth.approve(router.address, ethers.utils.parseUnits('1', 18));
    const initialBalance = await weth.balanceOf(owner.address);
    const tx = await router.functions.execute(
      // input
      [[weth.address, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [AddressZero, ethers.utils.parseUnits('0', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        owner.address,
        caller.address,
        abiCoder.encode(
          ['address', 'address', 'address', 'bytes', 'address'],
          [
            weth.address,
            weth.address,
            weth.address,
            '0x',
            AddressZero,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
    expect(
      await weth.balanceOf(owner.address),
    ).to.be.equal(initialBalance);
  });

  it('should do weth -> zero trade with no effect decreased allowance', async () => {
    // Decrease caller -> weth allowance
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [caller.address],
    });
    await owner.sendTransaction({ to: caller.address, value: ethers.utils.parseEther('1') });
    const callerSigner = await hre.ethers.provider.getSigner(caller.address);
    await weth.connect(callerSigner).approve(weth.address, '1');
    await weth.approve(router.address, ethers.utils.parseUnits('1', 18));
    const initialBalance = await weth.balanceOf(owner.address);
    const tx = await router.functions.execute(
      // input
      [[weth.address, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [AddressZero, ethers.utils.parseUnits('0', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        owner.address,
        caller.address,
        abiCoder.encode(
          ['address', 'address', 'address', 'bytes', 'address'],
          [
            weth.address,
            weth.address,
            weth.address,
            '0x',
            AddressZero,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
    expect(
      await weth.balanceOf(owner.address),
    ).to.be.equal(initialBalance);
  });

  it('should do weth -> zero trade with no effect large allowance', async () => {
    await weth.approve(router.address, ethers.utils.parseUnits('1', 18));
    const initialBalance = await weth.balanceOf(owner.address);
    const tx = await router.functions.execute(
      // input
      [[weth.address, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [AddressZero, ethers.utils.parseUnits('0', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        owner.address,
        caller.address,
        abiCoder.encode(
          ['address', 'address', 'address', 'bytes', 'address'],
          [
            weth.address,
            weth.address,
            weth.address,
            '0x',
            AddressZero,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
    expect(
      await weth.balanceOf(owner.address),
    ).to.be.equal(initialBalance);
  });
});
