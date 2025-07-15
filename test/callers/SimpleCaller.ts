import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { Signer } from 'ethers';
import { wethAddress, ethAddress } from '../helpers/tokens';
import hre from 'hardhat';

const AMOUNT_ABSOLUTE = 2;
const SWAP_FIXED_INPUTS = 1;
const SWAP_FIXED_OUTPUTS = 2;
const EMPTY_BYTES = '0x';

const zeroPermit = ['0', EMPTY_BYTES];
const zeroSignature = ['0', EMPTY_BYTES];

describe('SimpleCaller', () => {
  let owner: Signer;
  let notOwner: Signer;
  let caller: any;
  let Router: any;
  let Caller: any;
  let router: any;
  let weth: any;
  let protocolFeeDefault: [bigint, string];
  const abiCoder = new ethers.AbiCoder();

  before(async () => {
    Caller = await ethers.getContractFactory('SimpleCaller');
    Router = await ethers.getContractFactory('Router');

    [owner, notOwner] = await ethers.getSigners();

    caller = await Caller.deploy();

    weth = await ethers.getContractAt('IERC20', wethAddress, owner);

    protocolFeeDefault = [ethers.parseUnits('0', 18), ethers.ZeroAddress];
  });

  beforeEach(async () => {
    router = await Router.deploy();
  });

  it('should do eth -> weth trade', async () => {
    const initialBalance = await weth.balanceOf(await owner.getAddress());
    const tx = await router.execute(
      // input
      [[ethAddress, ethers.parseUnits('2', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [await weth.getAddress(), ethers.parseUnits('2', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        await owner.getAddress(),
        await caller.getAddress(),
        abiCoder.encode(
          ['address', 'address', 'address', 'bytes', 'address'],
          [
            ethAddress,
            ethers.ZeroAddress,
            await weth.getAddress(),
            '0x',
            await weth.getAddress(),
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
      {
        value: ethers.parseUnits('2', 18),
      },
    );
    const finalBalance = await weth.balanceOf(await owner.getAddress());
    expect(finalBalance - initialBalance).to.equal(ethers.parseUnits('2', 18));
    console.log(`Called router for ${(await tx.wait()).gasUsed} gas`);
  });

  it('should not do eth -> weth trade with ', async () => {
    const initialBalance = await weth.balanceOf(await owner.getAddress());
    const tx = await router.execute(
      // input
      [[ethAddress, ethers.parseUnits('2', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [await weth.getAddress(), ethers.parseUnits('2', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        await owner.getAddress(),
        await caller.getAddress(),
        abiCoder.encode(
          ['address', 'address', 'address', 'bytes', 'address'],
          [
            ethAddress,
            ethers.ZeroAddress,
            await weth.getAddress(),
            '0x',
            await weth.getAddress(),
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
      {
        value: ethers.parseUnits('2', 18),
      },
    );
    const finalBalance = await weth.balanceOf(await owner.getAddress());
    expect(finalBalance - initialBalance).to.equal(ethers.parseUnits('2', 18));
    console.log(`Called router for ${(await tx.wait()).gasUsed} gas`);
  });

  it('should do zero -> weth trade', async () => {
    const initialBalance = await weth.balanceOf(await owner.getAddress());
    const tx = await router.execute(
      // input
      [[ethers.ZeroAddress, ethers.parseUnits('0', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [await weth.getAddress(), ethers.parseUnits('0', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        await owner.getAddress(),
        await caller.getAddress(),
        abiCoder.encode(
          ['address', 'address', 'address', 'bytes', 'address'],
          [
            ethers.ZeroAddress,
            ethers.ZeroAddress,
            await weth.getAddress(),
            '0x',
            await weth.getAddress(),
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
    const finalBalance = await weth.balanceOf(await owner.getAddress());
    expect(finalBalance - initialBalance).to.equal(ethers.parseUnits('0', 18));
    console.log(`Called router for ${(await tx.wait()).gasUsed} gas`);
  });

  it('should not do eth -> weth trade with unfairly large fees', async () => {
    await expect(
      router.execute(
        // input
        [[ethAddress, ethers.parseUnits('1.1', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [await weth.getAddress(), ethers.parseUnits('1', 18)],
        // swap description
        [
          SWAP_FIXED_OUTPUTS,
          protocolFeeDefault,
          [ethers.parseUnits('0.01', 18), await notOwner.getAddress()],
          await owner.getAddress(),
          await caller.getAddress(),
          abiCoder.encode(
            ['address', 'address', 'address', 'bytes', 'address'],
            [
              ethAddress,
              ethers.ZeroAddress,
              await weth.getAddress(),
              '0x',
              await weth.getAddress(),
            ],
          ),
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
        {
          value: ethers.parseUnits('1.1', 18),
        },
      ),
    ).to.be.reverted;
  });
  it('should not do eth -> weth trade with 0 return token', async () => {
    await expect(
      router.execute(
        // input
        [[ethAddress, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [await weth.getAddress(), ethers.parseUnits('1', 18)],
        // swap description
        [
          SWAP_FIXED_OUTPUTS,
          protocolFeeDefault,
          protocolFeeDefault,
          await owner.getAddress(),
          await caller.getAddress(),
          abiCoder.encode(
            ['address', 'address', 'address', 'bytes', 'address'],
            [
              ethAddress,
              ethers.ZeroAddress,
              await weth.getAddress(),
              '0x',
              ethers.ZeroAddress,
            ],
          ),
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
        {
          value: ethers.parseUnits('1', 18),
        },
      ),
    ).to.be.reverted;
  });

  it('should not do eth -> weth trade with 0 callee', async () => {
    await expect(
      router.execute(
        // input
        [[ethAddress, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [await weth.getAddress(), ethers.parseUnits('1', 18)],
        // swap description
        [
          SWAP_FIXED_INPUTS,
          protocolFeeDefault,
          protocolFeeDefault,
          await owner.getAddress(),
          await caller.getAddress(),
          abiCoder.encode(
            ['address', 'address', 'address', 'bytes', 'address'],
            [
              ethAddress,
              ethers.ZeroAddress,
              ethers.ZeroAddress,
              '0x',
              await weth.getAddress(),
            ],
          ),
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
        {
          value: ethers.parseUnits('1', 18),
        },
      ),
    ).to.be.reverted;
  });

  it('should do weth -> eth trade', async () => {
    let initialBalance = await weth.balanceOf(await owner.getAddress());
    const wethAddr = await weth.getAddress();
    await weth.approve(await router.getAddress(), ethers.parseUnits('1', 18));
    const tx = await router.execute(
      // input
      [[wethAddr, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethAddress, ethers.parseUnits('1', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        await owner.getAddress(),
        await caller.getAddress(),
        abiCoder.encode(
          ['address', 'address', 'address', 'bytes', 'address'],
          [
            wethAddr,
            ethers.ZeroAddress,
            wethAddr,
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
    console.log(`Called router for ${(await tx.wait()).gasUsed} gas`);
    const finalBalance = await weth.balanceOf(await owner.getAddress());
    expect(initialBalance - finalBalance).to.equal(ethers.parseUnits('1', 18));
  });

  it('should do weth -> zero trade with no effect no allowance', async () => {
    const wethAddr = await weth.getAddress();
    await weth.approve(await router.getAddress(), ethers.parseUnits('1', 18));
    const initialBalance = await weth.balanceOf(await owner.getAddress());
    const tx = await router.execute(
      // input
      [[wethAddr, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethers.ZeroAddress, ethers.parseUnits('0', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        await owner.getAddress(),
        await caller.getAddress(),
        abiCoder.encode(
          ['address', 'address', 'address', 'bytes', 'address'],
          [
            wethAddr,
            wethAddr,
            wethAddr,
            '0x',
            ethers.ZeroAddress,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
    console.log(`Called router for ${(await tx.wait()).gasUsed} gas`);
    const finalBalance = await weth.balanceOf(await owner.getAddress());
    expect(finalBalance).to.equal(initialBalance);
  });

  it('should do weth -> zero trade with no effect decreased allowance', async () => {
    const wethAddr = await weth.getAddress();
    // Decrease caller -> weth allowance
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [await caller.getAddress()],
    });
    await owner.sendTransaction({ to: await caller.getAddress(), value: ethers.parseEther('1') });
    const callerSigner = await hre.ethers.getSigner(await caller.getAddress());
    await weth.connect(callerSigner).approve(wethAddr, '1');
    await weth.approve(await router.getAddress(), ethers.parseUnits('1', 18));
    const initialBalance = await weth.balanceOf(await owner.getAddress());
    const tx = await router.execute(
      // input
      [[wethAddr, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethers.ZeroAddress, ethers.parseUnits('0', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        await owner.getAddress(),
        await caller.getAddress(),
        abiCoder.encode(
          ['address', 'address', 'address', 'bytes', 'address'],
          [
            wethAddr,
            wethAddr,
            wethAddr,
            '0x',
            ethers.ZeroAddress,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
    console.log(`Called router for ${(await tx.wait()).gasUsed} gas`);
    const finalBalance = await weth.balanceOf(await owner.getAddress());
    expect(finalBalance).to.equal(initialBalance);
  });

  it('should do weth -> zero trade with no effect large allowance', async () => {
    const wethAddr = await weth.getAddress();
    await weth.approve(await router.getAddress(), ethers.parseUnits('1', 18));
    const initialBalance = await weth.balanceOf(await owner.getAddress());
    const tx = await router.execute(
      // input
      [[wethAddr, ethers.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethers.ZeroAddress, ethers.parseUnits('0', 18)],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        protocolFeeDefault,
        protocolFeeDefault,
        await owner.getAddress(),
        await caller.getAddress(),
        abiCoder.encode(
          ['address', 'address', 'address', 'bytes', 'address'],
          [
            wethAddr,
            wethAddr,
            wethAddr,
            '0x',
            ethers.ZeroAddress,
          ],
        ),
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
    console.log(`Called router for ${(await tx.wait()).gasUsed} gas`);
    const finalBalance = await weth.balanceOf(await owner.getAddress());
    expect(finalBalance).to.equal(initialBalance);
  });
}); 
