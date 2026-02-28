import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { Signer } from 'ethers';
import { ethAddress } from '../helpers/tokens';

const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const SWAP_FIXED_INPUTS = 1;
// const SWAP_FIXED_OUTPUTS = 2;
const EMPTY_BYTES = '0x';

const zeroFee = [ethers.getBigInt('0'), ethers.ZeroAddress];
const zeroPermit = ['0', EMPTY_BYTES];
const zeroSignature = ['0', EMPTY_BYTES];

describe('Router', () => {
  let owner: Signer;
  let notOwner: Signer;
  let Router: any;
  let mockCaller: any;
  let mockToken: any;
  let router: any;
  let permitMockToken: any;

  before(async () => {
    Router = await ethers.getContractFactory('Router');

    [owner, notOwner] = await ethers.getSigners();

    // Deploy mock contracts instead of using waffle
    const MockCaller = await ethers.getContractFactory('MockCaller');
    mockCaller = await MockCaller.deploy();

    const MockToken = await ethers.getContractFactory('MockERC20');
    mockToken = await MockToken.deploy('Mock Token', 'MTK');
  });

  beforeEach(async () => {
    router = await Router.deploy();
    // Deploy a new MockERC20 for permit tests
    const MockToken = await ethers.getContractFactory('MockERC20');
    permitMockToken = await MockToken.deploy('Permit Mock Token', 'PMT');
  });

  it('should be correct router owner', async () => {
    expect(await router.getOwner()).to.be.equal(await owner.getAddress());
  });

  it('should return lost tokens', async () => {
    // Mint tokens to router
    await mockToken.mint(router.getAddress(), 1000);
    await router.returnLostTokens(mockToken.getAddress(), await owner.getAddress());
    expect(await mockToken.balanceOf(await owner.getAddress())).to.equal(1000n);
  });

  it('should not return lost tokens if receiver cannot receive', async () => {
    await owner.sendTransaction({ to: router.getAddress(), value: ethers.parseEther('1') });
    await expect(
      router.returnLostTokens(ethAddress, mockToken.getAddress()),
    ).to.be.reverted;
  });

  it('should not return lost tokens if receiver is zero', async () => {
    // Mint tokens to router
    await mockToken.mint(router.getAddress(), 1000);
    await expect(router.returnLostTokens(mockToken.getAddress(), ethers.ZeroAddress)).to.be.reverted;
  });

  it('should not return lost tokens if called not by the owner', async () => {
    // Mint tokens to router
    await mockToken.mint(router.getAddress(), 1000);
    await expect(router.connect(notOwner).returnLostTokens(mockToken.getAddress(), await owner.getAddress()))
      .to.be.reverted;
  });

  it('should be correct protocol fee signer', async () => {
    expect(await router.getProtocolFeeSigner()).to.be.equal(ethers.ZeroAddress);
  });

  it('should not set zero protocol fee signer', async () => {
    await expect(router.setProtocolFeeSigner(ethers.ZeroAddress)).to.be.reverted;
  });

  it('should set new protocol fee signer', async () => {
    await router.setProtocolFeeSigner(await owner.getAddress());
    expect(await router.getProtocolFeeSigner()).to.be.equal(await owner.getAddress());
  });

  it('should be correct protocol fee default', async () => {
    expect(await router.getProtocolFeeDefault()).to.deep.equal(zeroFee);
  });

  it('should not set new protocol fee default if it is bad', async () => {
    const newBaseFee = [BigInt('1'), ethers.ZeroAddress];
    await expect(router.setProtocolFeeDefault(newBaseFee)).to.be.reverted;
  });

  it('should not set new protocol fee default if it is too big', async () => {
    const newBaseFee = [ethers.parseEther('1.000000000000000001'), await owner.getAddress()];
    await expect(router.setProtocolFeeDefault(newBaseFee)).to.be.reverted;
  });

  it('should set new protocol fee default', async () => {
    const protocolFeeDefault = [BigInt('1'), await owner.getAddress()];
    await router.setProtocolFeeDefault(protocolFeeDefault);
    expect(await router.getProtocolFeeDefault()).to.deep.equal(protocolFeeDefault);
  });

  it('should not change protocol fee share without signature', async () => {
    await expect(
      router.execute(
        // input
        [[ethAddress, ethers.parseEther('0'), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [
          SWAP_FIXED_INPUTS,
          [BigInt('1'), ethers.ZeroAddress],
          zeroFee,
          await owner.getAddress(),
          mockCaller.getAddress(),
          EMPTY_BYTES,
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not change protocol fee beneficiary without signature', async () => {
    await expect(
      router.execute(
        // input
        [[ethAddress, ethers.parseEther('0'), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [
          SWAP_FIXED_INPUTS,
          [BigInt('0'), await owner.getAddress()],
          zeroFee,
          await owner.getAddress(),
          mockCaller.getAddress(),
          EMPTY_BYTES,
        ],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should do empty ether trade', async () => {
    await router.execute(
      // input
      [[ethAddress, ethers.parseEther('0'), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should not do trade with low return amount', async () => {
    await expect(
      router.execute(
        // input
        [[ethAddress, ethers.parseEther('0'), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '1'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should do trade with zero input token', async () => {
    await router.execute(
      // input
      [[ethers.ZeroAddress, ethers.parseEther('0'), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should not do trade with zero input token and non-zero amount', async () => {
    await expect(
      router.execute(
        // input
        [[ethers.ZeroAddress, ethers.parseEther('1'), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should do trade with zero output token', async () => {
    await router.execute(
      // input
      [[ethAddress, ethers.parseEther('0'), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethers.ZeroAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should not do trade with zero output token and non-zero amount', async () => {
    await expect(
      router.execute(
        // input
        [[ethAddress, ethers.parseEther('0'), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethers.ZeroAddress, '1'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not execute with bad amount type', async () => {
    await expect(
      router.execute(
        // input
        [[ethAddress, ethers.parseEther('0'), '0'], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not execute with bad amount type', async () => {
    await expect(
      router.execute(
        // input
        [[ethers.ZeroAddress, ethers.parseEther('0'), '0'], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not execute with relative amount for ETH', async () => {
    await expect(
      router.execute(
        // input
        [[ethAddress, ethers.parseEther('0'), AMOUNT_RELATIVE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not execute with relative amount exceeding delimeter', async () => {
    await expect(
      router.execute(
        // input
        [
          [
            mockToken.getAddress(),
            ethers.parseEther('1.000000000000000001'),
            AMOUNT_RELATIVE,
          ],
          zeroPermit,
        ],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should execute with relative amount equal to delimeter', async () => {
    await mockToken.mint(router.getAddress(), 1000);
    await mockToken.approve(router.getAddress(), 1000);
    await router.execute(
      // input
      [[mockToken.getAddress(), ethers.parseEther('1'), AMOUNT_RELATIVE], zeroPermit],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should execute with relative amount lower than delimeter', async () => {
    await mockToken.mint(router.getAddress(), 1000);
    await mockToken.approve(router.getAddress(), 501);
    await expect(
      router.execute(
        // input
        [[mockToken.getAddress(), ethers.parseEther('0.5'), AMOUNT_RELATIVE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    );
  });

  it('should not execute if eth amount is greater than msg.value', async () => {
    await expect(
      router.execute(
        // input
        [[ethAddress, ethers.parseEther('1'), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not execute if no allowance and no permit', async () => {
    await mockToken.mint(router.getAddress(), 1000);
    await mockToken.approve(router.getAddress(), 0);
    await expect(
      router.execute(
        // input
        [[mockToken.getAddress(), ethers.parseEther('1'), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not execute with bad swap type', async () => {
    await expect(
      router.execute(
        // input
        [[ethAddress, ethers.parseEther('0'), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        ['0', zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not execute with bad account without signature', async () => {
    await expect(
      router.execute(
        // input
        [[ethAddress, ethers.parseEther('0'), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await notOwner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should execute with non-zero marketplace fee ', async () => {
    await router.execute(
      // input
      [[ethAddress, ethers.parseEther('0'), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethAddress, '0'],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        zeroFee,
        [BigInt('1'), await owner.getAddress()],
        await owner.getAddress(),
        mockCaller.getAddress(),
        EMPTY_BYTES,
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should not execute with bad permit type', async () => {
    // Mint tokens to router
    await permitMockToken.mint(owner.getAddress(), 1000);
    await permitMockToken.approve(router.getAddress(), 0);
    await expect(
      router.execute(
        // input
        [
          [permitMockToken.getAddress(), ethers.parseEther('1'), AMOUNT_RELATIVE],
          ['0', '0xd505accf'],
        ],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should execute with eip2621 permit type', async () => {
    // Mint tokens to router
    await permitMockToken.mint(router.getAddress(), 1000);
    await permitMockToken.approve(router.getAddress(), 0);
    await router.execute(
      // input
      [
        [permitMockToken.getAddress(), ethers.parseEther('1'), AMOUNT_RELATIVE],
        ['1', '0xd505accf'],
      ],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should execute with dai permit type', async () => {
    // Mint tokens to router
    await permitMockToken.mint(router.getAddress(), 1000);
    await permitMockToken.approve(router.getAddress(), 0);
    await router.execute(
      // input
      [
        [permitMockToken.getAddress(), ethers.parseEther('1'), AMOUNT_RELATIVE],
        ['2', '0x8fcbaf0c'],
      ],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should execute with yearn permit type', async () => {
    // Mint tokens to router
    await permitMockToken.mint(router.getAddress(), 1000);
    await permitMockToken.approve(router.getAddress(), 0);
    await router.execute(
      // input
      [
        [permitMockToken.getAddress(), ethers.parseEther('1'), AMOUNT_RELATIVE],
        ['3', '0x9fd5a6cf'],
      ],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, zeroFee, zeroFee, await owner.getAddress(), mockCaller.getAddress(), EMPTY_BYTES],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });
}); 
