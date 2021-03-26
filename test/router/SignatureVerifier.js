import signTypedData from '../helpers/signTypedData';
import { wethAddress, ethAddress } from '../helpers/tokens';

const { expect } = require('chai');

const { waffle, ethers } = require('hardhat');
const CallerArtifacts = require('../../artifacts/contracts/callers/ZerionCaller.sol/ZerionCaller.json');

const { deployMockContract, provider } = waffle;
const { AddressZero } = ethers.constants;

const AMOUNT_ABSOLUTE = 2;
const SWAP_FIXED_INPUTS = 1;
const EMPTY_BYTES = '0x';
const EXECUTE_SIGNATURE =
  'execute(((address,uint256,uint8),(uint8,bytes)),(address,uint256),(uint8,(uint256,address),address,address,bytes),address,uint256,bytes)';
const EXECUTE_WITH_CHI_SIGNATURE =
  'executeWithCHI(((address,uint256,uint8),(uint8,bytes)),(address,uint256),(uint8,(uint256,address),address,address,bytes),address,uint256,bytes)';

describe.only('SignatureVerifier', () => {
  let owner;
  let notOwner;
  let Router;
  let mockCaller;
  let router;
  let wallet;
  let weth;

  before(async () => {
    Router = await ethers.getContractFactory('Router');

    [owner, notOwner] = await ethers.getSigners();

    [wallet] = provider.getWallets();

    const weth9 = await ethers.getContractAt('WETH9', wethAddress);

    await weth9.connect(wallet).deposit({
      value: ethers.utils.parseEther('1'),
      gasLimit: 1000000,
    });

    mockCaller = await deployMockContract(owner, CallerArtifacts.abi);
    await mockCaller.mock.callBytes.returns();

    weth = await ethers.getContractAt('ERC20', wethAddress, owner);
  });

  beforeEach(async () => {
    router = await Router.deploy();
  });

  it('should be correct signer for execute', async () => {
    let amount = await weth.balanceOf(notOwner.address);
    await weth.connect(wallet).approve(router.address, '100');
    const typedData = {
      types: {
        Execute: [
          { name: 'input', type: 'Input' },
          { name: 'requiredOutput', type: 'AbsoluteTokenAmount' },
          { name: 'swapDescription', type: 'SwapDescription' },
          { name: 'account', type: 'address' },
          { name: 'salt', type: 'uint256' },
        ],
        SwapDescription: [
          { name: 'swapType', type: 'uint8' },
          { name: 'fee', type: 'Fee' },
          { name: 'destination', type: 'address' },
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
        name: 'Zerion Router V2',
        chainId: 31337,
        verifyingContract: router.address,
      },
      message: {
        input: {
          tokenAmount: {
            token: wethAddress,
            amount: '100',
            amountType: AMOUNT_ABSOLUTE,
          },
          permit: {
            permitType: '0',
            permitCallData: EMPTY_BYTES,
          },
        },
        requiredOutput: {
          token: ethAddress,
          absoluteAmount: '0',
        },
        swapDescription: {
          swapType: SWAP_FIXED_INPUTS,
          fee: {
            share: '0',
            beneficiary: AddressZero,
          },
          destination: notOwner.address,
          caller: mockCaller.address,
          callData: EMPTY_BYTES,
        },
        account: wallet.address,
        salt: 0,
      },
    };
    const signature = await signTypedData(wallet, typedData);
    const hashedData = await router.hashData(
      // input
      [
        [wethAddress, '100', AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
      wallet.address,
      0,
    );

    // eslint-disable-next-line no-unused-expressions
    expect(await router.isHashUsed(hashedData, wallet.address)).to.be.false;

    expect(
      await router.getAccountFromSignature(hashedData, ethers.utils.joinSignature(signature)),
    ).to.be.equal(wallet.address);

    await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [wethAddress, '100', AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
      wallet.address,
      0,
      ethers.utils.joinSignature(signature),
    );

    expect(await weth.balanceOf(notOwner.address)).to.be.equal(
      ethers.BigNumber.from(amount).add('100'),
    );

    // eslint-disable-next-line no-unused-expressions
    expect(await router.isHashUsed(hashedData, wallet.address)).to.be.true;

    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [wethAddress, '100', AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
        wallet.address,
        0,
        ethers.utils.joinSignature(signature),
      ),
    ).to.be.revertedWith('SV: used hash');

    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [wethAddress, '100', AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
        wallet.address,
        1,
        ethers.utils.joinSignature(signature),
      ),
    ).to.be.revertedWith('R: bad signature');
  });

  it('should be correct signer for execute with CHI', async () => {
    await weth.connect(wallet).approve(router.address, '100');
    const typedData = {
      types: {
        Execute: [
          { name: 'input', type: 'Input' },
          { name: 'requiredOutput', type: 'AbsoluteTokenAmount' },
          { name: 'swapDescription', type: 'SwapDescription' },
          { name: 'account', type: 'address' },
          { name: 'salt', type: 'uint256' },
        ],
        SwapDescription: [
          { name: 'swapType', type: 'uint8' },
          { name: 'fee', type: 'Fee' },
          { name: 'destination', type: 'address' },
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
        name: 'Zerion Router V2',
        chainId: 31337,
        verifyingContract: router.address,
      },
      message: {
        input: {
          tokenAmount: {
            token: wethAddress,
            amount: '100',
            amountType: AMOUNT_ABSOLUTE,
          },
          permit: {
            permitType: '0',
            permitCallData: EMPTY_BYTES,
          },
        },
        requiredOutput: {
          token: ethAddress,
          absoluteAmount: '0',
        },
        swapDescription: {
          swapType: SWAP_FIXED_INPUTS,
          fee: {
            share: '0',
            beneficiary: AddressZero,
          },
          destination: notOwner.address,
          caller: mockCaller.address,
          callData: EMPTY_BYTES,
        },
        account: wallet.address,
        salt: 0,
      },
    };
    const signature = await signTypedData(wallet, typedData);

    await router.functions[EXECUTE_WITH_CHI_SIGNATURE](
      // input
      [
        [wethAddress, '100', AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
      wallet.address,
      0,
      ethers.utils.joinSignature(signature),
    );
    await expect(
      router.functions[EXECUTE_WITH_CHI_SIGNATURE](
        // input
        [
          [wethAddress, '100', AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [ethAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
        wallet.address,
        1,
        ethers.utils.joinSignature(signature),
      ),
    ).to.be.revertedWith('R: bad signature');
  });
});
