import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { Signer } from 'ethers';
import signTypedData from '../helpers/signTypedData';
import hashTypedData from '../helpers/hashTypedData';
import { ethAddress } from '../helpers/tokens';
import hre from 'hardhat';

const AMOUNT_ABSOLUTE = 2;
const SWAP_FIXED_INPUTS = 1;
const EMPTY_BYTES = '0x';
const FUTURE_TIMESTAMP = 1893456000;

const zeroProtocolFee = [ethers.getBigInt('0'), ethers.ZeroAddress];
const zeroMarketplaceFee = [ethers.getBigInt('0'), ethers.ZeroAddress];
const zeroPermit = ['0', EMPTY_BYTES];
const zeroSignature = ['0', EMPTY_BYTES];

describe('SignatureVerifier', () => {
  let owner: Signer;
  let notOwner: Signer;
  let Router: any;
  let mockCaller: any;
  let router: any;
  let wallet: any;

  before(async () => {
    [owner, notOwner, wallet] = await ethers.getSigners();
    Router = await ethers.getContractFactory('Router', owner);
    const MockCaller = await ethers.getContractFactory('MockCaller');
    mockCaller = await MockCaller.deploy();
  });

  beforeEach(async () => {
    router = await Router.deploy();
  });

  it('should be correct account signature', async () => {
    const routerAddr = await router.getAddress();
    const walletAddr = await wallet.getAddress();
    const mockCallerAddr = await mockCaller.getAddress();
    const typedData = {
      types: {
        AccountSignature: [
          { name: 'input', type: 'Input' },
          { name: 'output', type: 'AbsoluteTokenAmount' },
          { name: 'swapDescription', type: 'SwapDescription' },
          { name: 'salt', type: 'uint256' },
        ],
        SwapDescription: [
          { name: 'swapType', type: 'uint8' },
          { name: 'protocolFee', type: 'Fee' },
          { name: 'marketplaceFee', type: 'Fee' },
          { name: 'account', type: 'address' },
          { name: 'caller', type: 'address' },
          { name: 'callerCallData', type: 'bytes' },
        ],
        Input: [
          { name: 'tokenAmount', type: 'TokenAmount' },
          { name: 'permit', type: 'Permit' },
        ],
        TokenAmount: [
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'amountType', type: 'uint8' },
        ],
        Permit: [
          { name: 'permitType', type: 'uint8' },
          { name: 'permitCallData', type: 'bytes' },
        ],
        Fee: [
          { name: 'share', type: 'uint256' },
          { name: 'beneficiary', type: 'address' },
        ],
        AbsoluteTokenAmount: [
          { name: 'token', type: 'address' },
          { name: 'absoluteAmount', type: 'uint256' },
        ],
      },
      domain: {
        name: 'Zerion Router',
        version: '4',
        chainId: 31337,
        verifyingContract: routerAddr,
      },
      message: {
        input: {
          tokenAmount: {
            token: ethAddress,
            amount: '0',
            amountType: AMOUNT_ABSOLUTE,
          },
          permit: {
            permitType: '0',
            permitCallData: EMPTY_BYTES,
          },
        },
        output: {
          token: ethAddress,
          absoluteAmount: '0',
        },
        swapDescription: {
          swapType: SWAP_FIXED_INPUTS,
          protocolFee: {
            share: '0',
            beneficiary: ethers.ZeroAddress,
          },
          marketplaceFee: {
            share: '0',
            beneficiary: ethers.ZeroAddress,
          },
          account: walletAddr,
          caller: mockCallerAddr,
          callerCallData: EMPTY_BYTES,
        },
        salt: 0,
      },
    };
    const salt = '0';
    const signature = await signTypedData(wallet, typedData);
    const input = [[ethAddress, '0', AMOUNT_ABSOLUTE], zeroPermit];
    const output = [ethAddress, '0'];
    const swapDescription = [
      SWAP_FIXED_INPUTS,
      zeroProtocolFee,
      zeroMarketplaceFee,
      walletAddr,
      mockCallerAddr,
      EMPTY_BYTES,
    ];

    // const hashedData = await router.hashAccountSignatureData(
    //   // input
    //   input,
    //   // output
    //   output,
    //   // swap description
    //   swapDescription,
    //   // double usage protection param
    //   salt,
    // );
    const hashedData = await hashTypedData(typedData);

     
    expect(await router.isHashUsed(hashedData)).to.be.false;

    const accountSignature = [salt, ethers.Signature.from(signature).serialized];

    // signature is valid the first time
    await router.execute(
      // input
      input,
      // output
      output,
      // swap description
      swapDescription,
      // account signature
      accountSignature,
      // protocol fee signature
      zeroSignature,
    );

     
    expect(await router.isHashUsed(hashedData)).to.be.true;

    // signature is not valid twice
    await expect(
      router.execute(
        // input
        input,
        // output
        output,
        // swap description
        swapDescription,
        // account signature
        accountSignature,
        // protocol fee signature
        zeroSignature,
      ),
    ).to.be.reverted;

    // signature is not valid if change double usage protection param
    await expect(
      router.execute(
        // input
        input,
        // output
        output,
        // swap description
        swapDescription,
        // account signature
        ['1', accountSignature[1]],
        // protocol fee signature
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should be correct account signature cancellation', async () => {
    const routerAddr = await router.getAddress();
    const walletAddr = await wallet.getAddress();
    const mockCallerAddr = await mockCaller.getAddress();
    const typedData = {
      types: {
        AccountSignature: [
          { name: 'input', type: 'Input' },
          { name: 'output', type: 'AbsoluteTokenAmount' },
          { name: 'swapDescription', type: 'SwapDescription' },
          { name: 'salt', type: 'uint256' },
        ],
        SwapDescription: [
          { name: 'swapType', type: 'uint8' },
          { name: 'protocolFee', type: 'Fee' },
          { name: 'marketplaceFee', type: 'Fee' },
          { name: 'account', type: 'address' },
          { name: 'caller', type: 'address' },
          { name: 'callerCallData', type: 'bytes' },
        ],
        Input: [
          { name: 'tokenAmount', type: 'TokenAmount' },
          { name: 'permit', type: 'Permit' },
        ],
        TokenAmount: [
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'amountType', type: 'uint8' },
        ],
        Permit: [
          { name: 'permitType', type: 'uint8' },
          { name: 'permitCallData', type: 'bytes' },
        ],
        Fee: [
          { name: 'share', type: 'uint256' },
          { name: 'beneficiary', type: 'address' },
        ],
        AbsoluteTokenAmount: [
          { name: 'token', type: 'address' },
          { name: 'absoluteAmount', type: 'uint256' },
        ],
      },
      domain: {
        name: 'Zerion Router',
        version: '4',
        chainId: 31337,
        verifyingContract: routerAddr,
      },
      message: {
        input: {
          tokenAmount: {
            token: ethAddress,
            amount: '0',
            amountType: AMOUNT_ABSOLUTE,
          },
          permit: {
            permitType: '0',
            permitCallData: EMPTY_BYTES,
          },
        },
        output: {
          token: ethAddress,
          absoluteAmount: '0',
        },
        swapDescription: {
          swapType: SWAP_FIXED_INPUTS,
          protocolFee: {
            share: '0',
            beneficiary: ethers.ZeroAddress,
          },
          marketplaceFee: {
            share: '0',
            beneficiary: ethers.ZeroAddress,
          },
          account: walletAddr,
          caller: mockCallerAddr,
          callerCallData: EMPTY_BYTES,
        },
        salt: 1,
      },
    };
    const signature = await signTypedData(wallet, typedData);
    // Use struct objects, not arrays, for input/output/swapDescription
    const input = {
      tokenAmount: {
        token: ethAddress,
        amount: '0',
        amountType: AMOUNT_ABSOLUTE,
      },
      permit: {
        permitType: 0,
        permitCallData: EMPTY_BYTES,
      },
    };
    const output = {
      token: ethAddress,
      absoluteAmount: '0',
    };
    const swapDescription = {
      swapType: SWAP_FIXED_INPUTS,
      protocolFee: { share: 0n, beneficiary: ethers.ZeroAddress },
      marketplaceFee: { share: 0n, beneficiary: ethers.ZeroAddress },
      account: walletAddr,
      caller: mockCallerAddr,
      callerCallData: EMPTY_BYTES,
    };
    const hashedData = await hashTypedData(typedData);
    expect(await router.isHashUsed(hashedData)).to.be.false;
    const accountSignature = { salt: 1n, signature: ethers.Signature.from(signature).serialized };
    // signature cancellation is not possible by the owner
    await expect(
      router.cancelAccountSignature(
        // input
        input,
        // output
        output,
        // swap description
        swapDescription,
        // account signature
        accountSignature,
      ),
    ).to.be.reverted;
    // signature cancellation is possible only by the wallet
    await router.connect(wallet).cancelAccountSignature(
      // input
      input,
      // output
      output,
      // swap description
      swapDescription,
      // account signature
      accountSignature,
    );
    expect(await router.isHashUsed(hashedData)).to.be.true;
    // should not execute after cancellation
    await expect(
      router.connect(notOwner).execute(
        input,
        output,
        swapDescription,
        accountSignature,
        zeroSignature,
      ),
    ).to.be.reverted;
  });

  it('should be correct protocol fee signature', async () => {
    const routerAddr = await router.getAddress();
    const ownerAddr = await owner.getAddress();
    const walletAddr = await wallet.getAddress();
    const mockCallerAddr = await mockCaller.getAddress();
    const typedData = {
      types: {
        ProtocolFeeSignature: [
          { name: 'input', type: 'Input' },
          { name: 'output', type: 'AbsoluteTokenAmount' },
          { name: 'swapDescription', type: 'SwapDescription' },
          { name: 'deadline', type: 'uint256' },
        ],
        SwapDescription: [
          { name: 'swapType', type: 'uint8' },
          { name: 'protocolFee', type: 'Fee' },
          { name: 'marketplaceFee', type: 'Fee' },
          { name: 'account', type: 'address' },
          { name: 'caller', type: 'address' },
          { name: 'callerCallData', type: 'bytes' },
        ],
        Input: [
          { name: 'tokenAmount', type: 'TokenAmount' },
          { name: 'permit', type: 'Permit' },
        ],
        TokenAmount: [
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'amountType', type: 'uint8' },
        ],
        Permit: [
          { name: 'permitType', type: 'uint8' },
          { name: 'permitCallData', type: 'bytes' },
        ],
        Fee: [
          { name: 'share', type: 'uint256' },
          { name: 'beneficiary', type: 'address' },
        ],
        AbsoluteTokenAmount: [
          { name: 'token', type: 'address' },
          { name: 'absoluteAmount', type: 'uint256' },
        ],
      },
      domain: {
        name: 'Zerion Router',
        version: '4',
        chainId: 31337,
        verifyingContract: routerAddr,
      },
      message: {
        input: {
          tokenAmount: {
            token: ethAddress,
            amount: '0',
            amountType: AMOUNT_ABSOLUTE,
          },
          permit: {
            permitType: '0',
            permitCallData: EMPTY_BYTES,
          },
        },
        output: {
          token: ethAddress,
          absoluteAmount: '0',
        },
        swapDescription: {
          swapType: SWAP_FIXED_INPUTS,
          protocolFee: {
            share: '1',
            beneficiary: ownerAddr,
          },
          marketplaceFee: {
            share: '0',
            beneficiary: ethers.ZeroAddress,
          },
          account: walletAddr,
          caller: mockCallerAddr,
          callerCallData: EMPTY_BYTES,
        },
        deadline: FUTURE_TIMESTAMP,
      },
    };
    const signature = await signTypedData(wallet, typedData);
    const input = [[ethAddress, '0', AMOUNT_ABSOLUTE], zeroPermit];
    const output = [ethAddress, '0'];
    const protocolFee = [ethers.getBigInt('1'), ownerAddr];
    const swapDescription = [
      SWAP_FIXED_INPUTS,
      protocolFee,
      zeroMarketplaceFee,
      walletAddr,
      mockCallerAddr,
      EMPTY_BYTES,
    ];

    const protocolFeeSignature = [FUTURE_TIMESTAMP, signature.serialized];

    // signature is not valid if exceeds limit fee
    await expect(
      router.execute(
        // input
        input,
        // output
        output,
        // swap description
        swapDescription,
        // account signature
        zeroSignature,
        // protocol fee signature
        protocolFeeSignature,
      ),
    ).to.be.revertedWithCustomError(router, 'ExceedingLimitFee').withArgs(1, 0);

    await router.setProtocolFeeDefault(protocolFee);
    expect(await router.getProtocolFeeDefault()).to.deep.equal(protocolFee);

    // signature is not valid with wrong signer
    await expect(
      router.execute(
        // input
        input,
        // output
        output,
        // swap description
        swapDescription,
        // account signature
        zeroSignature,
        // protocol fee signature
        protocolFeeSignature,
      ),
    ).to.be.revertedWithCustomError(router, 'BadFeeSignature');

    await router.setProtocolFeeSigner(walletAddr);
    expect(await router.getProtocolFeeSigner()).to.be.equal(walletAddr);

    // signature is valid the first time
    await router.connect(wallet).execute(
      // input
      input,
      // output
      output,
      // swap description
      swapDescription,
      // account signature
      zeroSignature,
      // protocol fee signature
      protocolFeeSignature,
    );

    // signature is valid twice
    await router.connect(wallet).execute(
      // input
      input,
      // output
      output,
      // swap description
      swapDescription,
      // account signature
      zeroSignature,
      // protocol fee signature
      protocolFeeSignature,
    );

    // signature is not valid if change timestamp
    await expect(
      router.connect(wallet).execute(
        // input
        input,
        // output
        output,
        // swap description
        swapDescription,
        // account signature
        zeroSignature,
        // protocol fee signature
        [FUTURE_TIMESTAMP + 1, protocolFeeSignature[1]],
      ),
    ).to.be.revertedWithCustomError(router, 'BadFeeSignature');

    // skip time to future timestamp
    await hre.network.provider.request({
      method: 'evm_setNextBlockTimestamp',
      params: [FUTURE_TIMESTAMP + 1],
    });

    // signature is not valid if passed deadline
    await expect(
      router.execute(
        // input
        input,
        // output
        output,
        // swap description
        swapDescription,
        // account signature
        zeroSignature,
        // protocol fee signature
        protocolFeeSignature,
      ),
    ).to.be.revertedWithCustomError(router, 'PassedDeadline');
  });
}); 
