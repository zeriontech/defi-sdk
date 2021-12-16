import signTypedData from '../helpers/signTypedData';

const { expect } = require('chai');

const { waffle, ethers } = require('hardhat');
const CallerArtifacts = require('../../artifacts/contracts/callers/ZerionCaller.sol/ZerionCaller.json');

const { deployMockContract, provider } = waffle;
const { AddressZero } = ethers.constants;

const AMOUNT_ABSOLUTE = 2;
const SWAP_FIXED_INPUTS = 1;
const EMPTY_BYTES = '0x';
const FUTURE_TIMESTAMP = 1893456000;

const zeroFee = [ethers.BigNumber.from('0'), AddressZero];
const zeroPermit = ['0', EMPTY_BYTES];
const zeroSignature = ['0', EMPTY_BYTES];

describe('SignatureVerifier', () => {
  let owner;
  let Router;
  let mockCaller;
  let router;
  let wallet;

  before(async () => {
    Router = await ethers.getContractFactory('Router');

    [owner] = await ethers.getSigners();

    [wallet] = provider.getWallets();

    mockCaller = await deployMockContract(owner, CallerArtifacts.abi);
    await mockCaller.mock.callBytes.returns();
  });

  beforeEach(async () => {
    router = await Router.deploy();
  });

  it.only('should be correct account signature', async () => {
    const typedData = {
      types: {
        Execute: [
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
          { name: 'callData', type: 'bytes' },
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
        version: '2',
        chainId: 31337,
        verifyingContract: router.address,
      },
      message: {
        input: {
          tokenAmount: {
            token: AddressZero,
            amount: '0',
            amountType: AMOUNT_ABSOLUTE,
          },
          permit: {
            permitType: '0',
            permitCallData: EMPTY_BYTES,
          },
        },
        output: {
          token: AddressZero,
          absoluteAmount: '0',
        },
        swapDescription: {
          swapType: SWAP_FIXED_INPUTS,
          protocolFee: {
            share: '0',
            beneficiary: AddressZero,
          },
          marketplaceFee: {
            share: '0',
            beneficiary: AddressZero,
          },
          account: wallet.address,
          caller: mockCaller.address,
          callData: EMPTY_BYTES,
        },
        salt: 0,
      },
    };
    const salt = '0';
    const signature = await signTypedData(wallet, typedData);
    const input = [[AddressZero, '0', AMOUNT_ABSOLUTE], zeroPermit];
    const output = [AddressZero, '0'];
    const swapDescription = [
      SWAP_FIXED_INPUTS,
      zeroFee,
      zeroFee,
      wallet.address,
      mockCaller.address,
      EMPTY_BYTES,
    ];

    const hashedData = await router.hashData(
      // input
      input,
      // output
      output,
      // swap description
      swapDescription,
      // double usage protection param
      salt,
    );
    console.log(hashedData);
    // eslint-disable-next-line no-unused-expressions
    expect(await router.isHashUsed(hashedData)).to.be.false;

    const accountSignature = [salt, ethers.utils.joinSignature(signature)];
    console.log(accountSignature);
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

    // eslint-disable-next-line no-unused-expressions
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

  it('should be correct protocol fee signature', async () => {
    const typedData = {
      types: {
        Execute: [
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
          { name: 'callData', type: 'bytes' },
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
        version: '2',
        chainId: 31337,
        verifyingContract: router.address,
      },
      message: {
        input: {
          tokenAmount: {
            token: AddressZero,
            amount: '0',
            amountType: AMOUNT_ABSOLUTE,
          },
          permit: {
            permitType: '0',
            permitCallData: EMPTY_BYTES,
          },
        },
        output: {
          token: AddressZero,
          absoluteAmount: '0',
        },
        swapDescription: {
          swapType: SWAP_FIXED_INPUTS,
          protocolFee: {
            share: '1',
            beneficiary: owner.address,
          },
          marketplaceFee: {
            share: '0',
            beneficiary: AddressZero,
          },
          account: wallet.address,
          caller: mockCaller.address,
          callData: EMPTY_BYTES,
        },
        salt: FUTURE_TIMESTAMP,
      },
    };
    const signature = await signTypedData(wallet, typedData);
    const input = [[AddressZero, '0', AMOUNT_ABSOLUTE], zeroPermit];
    const output = [AddressZero, '0'];
    const protocolFee = [ethers.BigNumber.from('1'), owner.address];
    const swapDescription = [
      SWAP_FIXED_INPUTS,
      protocolFee,
      zeroFee,
      wallet.address,
      mockCaller.address,
      EMPTY_BYTES,
    ];

    const protocolFeeSignature = [FUTURE_TIMESTAMP, ethers.utils.joinSignature(signature)];

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
    ).to.be.reverted;

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
    ).to.be.reverted;

    await router.setProtocolFeeSigner(wallet.address);
    expect(await router.getProtocolFeeSigner()).to.be.equal(wallet.address);

    // signature is valid the first time
    await router.execute(
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
    await router.execute(
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
        [FUTURE_TIMESTAMP + 1, protocolFeeSignature[1]],
      ),
    ).to.be.reverted;

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
    ).to.be.reverted;
  });
});
