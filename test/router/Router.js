// import signTypedData from '../helpers/signTypedData';
// import buyTokenOnUniswap from '../helpers/buyTokenOnUniswap';
import { ethAddress } from '../helpers/tokens';

const { expect } = require('chai');

const { waffle, ethers } = require('hardhat');
const CallerArtifacts = require('../../artifacts/contracts/interfaces/ICaller.sol/ICaller.json');
const TokenArtifacts = require('../../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json');
const DAIArtifacts = require('../../artifacts/contracts/interfaces/IDAIPermit.sol/IDAIPermit.json');
const EIP2612Artifacts = require('../../artifacts/contracts/interfaces/IEIP2612.sol/IEIP2612.json');
const YearnArtifacts = require('../../artifacts/contracts/interfaces/IYearnPermit.sol/IYearnPermit.json');

const { deployMockContract } = waffle; // provider
const { AddressZero } = ethers.constants; // MaxUint256

const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const SWAP_FIXED_INPUTS = 1;
// const SWAP_FIXED_OUTPUTS = 2;
const EMPTY_BYTES = '0x';

const zeroFee = [ethers.BigNumber.from('0'), AddressZero];
const zeroPermit = ['0', EMPTY_BYTES];
const zeroSignature = ['0', EMPTY_BYTES];

describe('Router', () => {
  let owner;
  let notOwner;
  let Router;
  let mockCaller;
  let mockToken;
  let router;

  before(async () => {
    Router = await ethers.getContractFactory('Router');

    [owner, notOwner] = await ethers.getSigners();

    mockCaller = await deployMockContract(owner, CallerArtifacts.abi);
    await mockCaller.mock.callBytes.returns();

    mockToken = await deployMockContract(owner, TokenArtifacts.abi);
    await mockToken.mock.transferFrom.returns(true);
    await mockToken.mock.transfer.returns(true);
  });

  beforeEach(async () => {
    router = await Router.deploy();
  });

  it('should be correct router owner', async () => {
    expect(await router.getOwner()).to.be.equal(owner.address);
  });

  it('should return lost tokens', async () => {
    await mockToken.mock.balanceOf.returns(1000);
    await router.returnLostTokens(mockToken.address, owner.address);
  });

  it('should not return lost tokens if receiver cannot receive', async () => {
    await owner.sendTransaction({ to: router.address, value: ethers.utils.parseEther('1') });
    await expect(
      router.returnLostTokens(ethAddress, mockToken.address),
    ).to.be.reverted;
  });

  it('should not return lost tokens if receiver is zero', async () => {
    await mockToken.mock.balanceOf.returns(1000);
    await expect(router.returnLostTokens(mockToken.address, AddressZero)).to.be.reverted;
  });

  it('should not return lost tokens if called not by the owner', async () => {
    await mockToken.mock.balanceOf.returns(1000);
    await expect(router.connect(notOwner).returnLostTokens(mockToken.address, owner.address))
      .to.be.reverted;
  });

  it('should be correct protocol fee signer', async () => {
    expect(await router.getProtocolFeeSigner()).to.be.equal(AddressZero);
  });

  it('should not set zero protocol fee signer', async () => {
    await expect(router.setProtocolFeeSigner(AddressZero)).to.be.reverted;
  });

  it('should set new protocol fee signer', async () => {
    await router.setProtocolFeeSigner(owner.address);
    expect(await router.getProtocolFeeSigner()).to.be.equal(owner.address);
  });

  it('should be correct protocol fee default', async () => {
    expect(await router.getProtocolFeeDefault()).to.deep.equal(zeroFee);
  });

  it('should not set new protocol fee default if it is bad', async () => {
    const newBaseFee = [ethers.BigNumber.from('1'), AddressZero];
    await expect(router.setProtocolFeeDefault(newBaseFee)).to.be.reverted;
  });

  it('should not set new protocol fee default if it is too big', async () => {
    const newBaseFee = [ethers.utils.parseUnits('1.000000000000000001', 18), owner.address];
    await expect(router.setProtocolFeeDefault(newBaseFee)).to.be.reverted;
  });

  it('should set new protocol fee default', async () => {
    const protocolFeeDefault = [ethers.BigNumber.from('1'), owner.address];
    await router.setProtocolFeeDefault(protocolFeeDefault);
    expect(await router.getProtocolFeeDefault()).to.deep.equal(protocolFeeDefault);
  });

  it('should not change protocol fee share without signature', async () => {
    await expect(
      router.functions.execute(
        // input
        [[ethAddress, ethers.utils.parseUnits('0', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [
          SWAP_FIXED_INPUTS,
          [ethers.BigNumber.from('1'), AddressZero],
          zeroFee,
          owner.address,
          mockCaller.address,
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
      router.functions.execute(
        // input
        [[ethAddress, ethers.utils.parseUnits('0', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [
          SWAP_FIXED_INPUTS,
          [ethers.BigNumber.from('0'), owner.address],
          zeroFee,
          owner.address,
          mockCaller.address,
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
    await router.functions.execute(
      // input
      [[ethAddress, ethers.utils.parseUnits('0', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should not do trade with low return amount', async () => {
    await expect(
      router.functions.execute(
        // input
        [[ethAddress, ethers.utils.parseUnits('0', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '1'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should do trade with zero input token', async () => {
    await router.functions.execute(
      // input
      [[AddressZero, ethers.utils.parseUnits('0', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should not do trade with zero input token and non-zero amount', async () => {
    await expect(
      router.functions.execute(
        // input
        [[AddressZero, '1', AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should do trade with zero output token', async () => {
    await router.functions.execute(
      // input
      [[ethAddress, ethers.utils.parseUnits('0', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [AddressZero, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should not do trade with zero output token and non-zero amount', async () => {
    await expect(
      router.functions.execute(
        // input
        [[ethAddress, ethers.utils.parseUnits('0', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [AddressZero, '1'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not execute with bad amount type', async () => {
    await expect(
      router.functions.execute(
        // input
        [[ethAddress, ethers.utils.parseUnits('0', 18), '0'], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not execute with relative amount for ETH', async () => {
    await expect(
      router.functions.execute(
        // input
        [[ethAddress, ethers.utils.parseUnits('0', 18), AMOUNT_RELATIVE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not execute with relative amount exceeding delimeter', async () => {
    await expect(
      router.functions.execute(
        // input
        [
          [
            mockToken.address,
            ethers.utils.parseUnits('1.000000000000000001', 18),
            AMOUNT_RELATIVE,
          ],
          zeroPermit,
        ],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should execute with relative amount equal to delimeter', async () => {
    await mockToken.mock.balanceOf.returns(1000);
    await mockToken.mock.allowance.returns(1000);
    await router.functions.execute(
      // input
      [[mockToken.address, ethers.utils.parseUnits('1', 18), AMOUNT_RELATIVE], zeroPermit],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should execute with relative amount lower than delimeter', async () => {
    await mockToken.mock.balanceOf.returns(1000);
    await mockToken.mock.allowance.returns(501);
    await expect(
      router.functions.execute(
        // input
        [[mockToken.address, ethers.utils.parseUnits('0.5', 18), AMOUNT_RELATIVE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    );
  });

  it('should not execute if eth amount is greater than msg.value', async () => {
    await expect(
      router.functions.execute(
        // input
        [[ethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not execute if no allowance and no permit', async () => {
    await mockToken.mock.balanceOf.returns(1000);
    await mockToken.mock.allowance.returns(0);
    await expect(
      router.functions.execute(
        // input
        [[mockToken.address, ethers.utils.parseUnits('1', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not execute with bad swap type', async () => {
    await expect(
      router.functions.execute(
        // input
        [[ethAddress, ethers.utils.parseUnits('0', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        ['0', zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should not execute with bad account without signature', async () => {
    await expect(
      router.functions.execute(
        // input
        [[ethAddress, ethers.utils.parseUnits('0', 18), AMOUNT_ABSOLUTE], zeroPermit],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, notOwner.address, mockCaller.address, EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should execute with non-zero marketplace fee ', async () => {
    await router.functions.execute(
      // input
      [[ethAddress, ethers.utils.parseUnits('0', 18), AMOUNT_ABSOLUTE], zeroPermit],
      // output
      [ethAddress, '0'],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        zeroFee,
        ['1', owner.address],
        owner.address,
        mockCaller.address,
        EMPTY_BYTES,
      ],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should not execute with bad permit type', async () => {
    await mockToken.mock.balanceOf.returns(1000);
    await mockToken.mock.allowance.returns(0);
    await expect(
      router.functions.execute(
        // input
        [
          [mockToken.address, ethers.utils.parseUnits('1', 18), AMOUNT_RELATIVE],
          ['0', '0xd505accf'],
        ],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
        // account signature
        zeroSignature,
        // fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should execute with eip2621 permit type', async () => {
    const mockPermitToken = await deployMockContract(owner, EIP2612Artifacts.abi);
    await mockPermitToken.mock.transferFrom.returns(true);
    await mockPermitToken.mock.transfer.returns(true);
    await mockPermitToken.mock.approve.returns(true);
    await mockPermitToken.mock.balanceOf.returns(1000);
    await mockPermitToken.mock.allowance.returns(0);
    await mockPermitToken.mock.permit.returns();
    router.functions.execute(
      // input
      [
        [mockPermitToken.address, ethers.utils.parseUnits('1', 18), AMOUNT_RELATIVE],
        ['1', '0xd505accf'],
      ],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should execute with dai permit type', async () => {
    const mockPermitToken = await deployMockContract(owner, DAIArtifacts.abi);
    await mockPermitToken.mock.transferFrom.returns(true);
    await mockPermitToken.mock.transfer.returns(true);
    await mockPermitToken.mock.approve.returns(true);
    await mockPermitToken.mock.balanceOf.returns(1000);
    await mockPermitToken.mock.allowance.returns(0);
    await mockPermitToken.mock.permit.returns();
    router.functions.execute(
      // input
      [
        [mockPermitToken.address, ethers.utils.parseUnits('1', 18), AMOUNT_RELATIVE],
        ['2', '0x8fcbaf0c'],
      ],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });

  it('should execute with yearn permit type', async () => {
    const mockPermitToken = await deployMockContract(owner, YearnArtifacts.abi);
    await mockPermitToken.mock.transferFrom.returns(true);
    await mockPermitToken.mock.transfer.returns(true);
    await mockPermitToken.mock.approve.returns(true);
    await mockPermitToken.mock.balanceOf.returns(1000);
    await mockPermitToken.mock.allowance.returns(0);
    await mockPermitToken.mock.permit.returns();
    router.functions.execute(
      // input
      [
        [mockPermitToken.address, ethers.utils.parseUnits('1', 18), AMOUNT_RELATIVE],
        ['3', '0x9fd5a6cf'],
      ],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, zeroFee, zeroFee, owner.address, mockCaller.address, EMPTY_BYTES],
      // account signature
      zeroSignature,
      // fee signature
      zeroSignature,
    );
  });
});
