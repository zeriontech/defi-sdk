import signTypedData from '../helpers/signTypedData';
import buyTokenOnUniswap from '../helpers/buyTokenOnUniswap';
import { wethAddress, ethAddress, daiAddress, usdcAddress } from '../helpers/tokens';

const { expect } = require('chai');

const { waffle, ethers } = require('hardhat');
const CallerArtifacts = require('../../artifacts/contracts/interfaces/ICaller.sol/ICaller.json');
const TokenArtifacts = require('../../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json');

const { deployMockContract, provider } = waffle;
const { AddressZero, MaxUint256 } = ethers.constants;

const AMOUNT_RELATIVE = 1;
const AMOUNT_ABSOLUTE = 2;
const SWAP_FIXED_INPUTS = 1;
const SWAP_FIXED_OUTPUTS = 2;
const EMPTY_BYTES = '0x';
const FUTURE_TIMESTAMP = 1893456000;
const EXECUTE_SIGNATURE =
  'execute(((address,uint256,uint8),(uint8,bytes)),(address,uint256),(uint8,(uint256,address),address,address,bytes))';
const EXECUTE_WITH_CHI_SIGNATURE =
  'executeWithCHI(((address,uint256,uint8),(uint8,bytes)),(address,uint256),(uint8,(uint256,address),address,address,bytes))';

describe('Router', () => {
  let owner;
  let notOwner;
  let feeRecipient;
  let Router;
  let mockCaller;
  let mockToken;
  let router;
  let weth;
  let dai;
  let usdc;

  before(async () => {
    Router = await ethers.getContractFactory('Router');

    [owner, notOwner, feeRecipient] = await ethers.getSigners();

    const weth9 = await ethers.getContractAt('I', wethAddress);

    await weth9.deposit({
      value: ethers.utils.parseUnits('1', 18),
      gasLimit: 1000000,
    });

    mockCaller = await deployMockContract(owner, CallerArtifacts.abi);
    mockToken = await deployMockContract(owner, TokenArtifacts.abi);
    await mockCaller.mock.callBytes.returns();

    weth = await ethers.getContractAt('IERC20', wethAddress, owner);
    dai = await ethers.getContractAt('IERC20', daiAddress, owner);
    usdc = await ethers.getContractAt('IERC20', usdcAddress, owner);
  });

  beforeEach(async () => {
    router = await Router.deploy();

    await mockCaller.mock.getExactInputAmount.returns('100');
    await mockToken.mock.transferFrom.returns(true);
    await mockToken.mock.transfer.returns(true);
  });

  it('should be correct router owner', async () => {
    expect(await router.owner()).to.be.equal(owner.address);
  });

  it('should return lost tokens', async () => {
    await weth.transfer(router.address, '1');
    expect(await weth.balanceOf(router.address)).to.be.equal('1');
    await router.returnLostTokens(wethAddress, owner.address, '1');
    expect(await weth.balanceOf(router.address)).to.be.equal('0');
  });

  it('should not return lost tokens if receiver cannot receive', async () => {
    await expect(router.returnLostTokens(ethAddress, router.address, '0')).to.be.revertedWith(
      'B: bad account',
    );
  });

  it('should not return lost tokens if called not by the owner', async () => {
    await expect(
      router.connect(notOwner).returnLostTokens(ethAddress, owner.address, '1'),
    ).to.be.revertedWith('O: only owner');
  });

  it('should not execute with bad swap type', async () => {
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [ethAddress, '100', AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [daiAddress, '0'],
        // swap description
        ['0', ['0', AddressZero], owner.address, mockCaller.address, EMPTY_BYTES],
        {
          value: '100',
        },
      ),
    ).to.be.revertedWith('R: bad swapType');
  });

  it('should not execute with bad fee beneficiary', async () => {
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [ethAddress, '100', AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [daiAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, ['1', AddressZero], owner.address, mockCaller.address, EMPTY_BYTES],
        {
          value: '100',
        },
      ),
    ).to.be.revertedWith('R: zero beneficiary');
  });

  it('should not execute with bad fee share', async () => {
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [ethAddress, '100', AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [daiAddress, '0'],
        // swap description
        [
          SWAP_FIXED_INPUTS,
          ['10000000000000001', owner.address],
          owner.address,
          mockCaller.address,
          EMPTY_BYTES,
        ],
        {
          value: '100',
        },
      ),
    ).to.be.revertedWith('R: bad fee');
  });

  it('should not execute with zero caller', async () => {
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [ethAddress, '100', AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [daiAddress, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, ['0', AddressZero], owner.address, AddressZero, EMPTY_BYTES],
        {
          value: '100',
        },
      ),
    ).to.be.revertedWith('R: zero caller');
  });

  it('should not execute with bad output requirement', async () => {
    await weth.approve(router.address, '100');
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [wethAddress, '100', AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [ethAddress, '1'],
        // swap description
        [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
      ),
    ).to.be.revertedWith('R: low output');
  });

  it('should execute with good input requirement', async () => {
    await weth.approve(router.address, '100');
    await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [wethAddress, '100', AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [AddressZero, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
    );
  });

  it('should execute with good input requirement (with CHI)', async () => {
    await weth.approve(router.address, '100');
    await router.functions[EXECUTE_WITH_CHI_SIGNATURE](
      // input
      [
        [wethAddress, '100', AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [AddressZero, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
    );
  });

  it('should not execute with bad input requirement (fixed outputs)', async () => {
    await weth.approve(router.address, '200');
    await mockCaller.mock.getExactInputAmount.returns('200');
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
        [
          SWAP_FIXED_OUTPUTS,
          ['0', AddressZero],
          notOwner.address,
          mockCaller.address,
          EMPTY_BYTES,
        ],
      ),
    ).to.be.revertedWith('R: high exact input');
  });

  it('should not execute with bad output requirement (fixed outputs)', async () => {
    await weth.approve(router.address, '100');
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [wethAddress, '100', AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [ethAddress, '1'],
        // swap description
        [
          SWAP_FIXED_OUTPUTS,
          ['0', AddressZero],
          notOwner.address,
          mockCaller.address,
          EMPTY_BYTES,
        ],
      ),
    ).to.be.revertedWith('R: low output');
  });

  it('should execute with good input requirement (fixed outputs)', async () => {
    await weth.approve(router.address, '100');
    await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [wethAddress, '100', AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_OUTPUTS, ['0', AddressZero], owner.address, mockCaller.address, EMPTY_BYTES],
    );
  });

  it('should execute with AddressZero tokens (absolute amount == 0)', async () => {
    await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [AddressZero, '0', AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [ethAddress, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, ['0', AddressZero], owner.address, mockCaller.address, EMPTY_BYTES],
    );
  });

  it('should not transfer tokens without allowance', async () => {
    await weth.approve(router.address, '99');
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [wethAddress, '100', AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [AddressZero, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
      ),
    ).to.be.revertedWith('BR: bad permit type');
  });

  it('should not transfer tokens with bad amount', async () => {
    await weth.approve(router.address, '100');
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [wethAddress, '100', '0'],
          ['0', EMPTY_BYTES],
        ],
        // output
        [AddressZero, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
      ),
    ).to.be.revertedWith('BR: bad amount type');
  });

  it('should not transfer AddressZero token (absolute amount > 0)', async () => {
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [AddressZero, '1', AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [AddressZero, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
      ),
    ).to.be.revertedWith('BR: zero token');
  });

  it('should not transfer AddressZero token (relative amount)', async () => {
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [AddressZero, '1', AMOUNT_RELATIVE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [AddressZero, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
      ),
    ).to.be.revertedWith('BR: bad token');
  });

  it('should transfer token fee correctly', async () => {
    await weth.approve(router.address, '100');
    await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [wethAddress, '100', AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [AddressZero, '0'],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        [ethers.utils.parseUnits('0.01', 18), feeRecipient.address],
        notOwner.address,
        mockCaller.address,
        EMPTY_BYTES,
      ],
    );
    expect(await weth.balanceOf(feeRecipient.address)).to.be.equal('1');
  });

  it('should not transfer ether if no value', async () => {
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [ethAddress, '100', AMOUNT_ABSOLUTE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [AddressZero, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
      ),
    ).to.be.revertedWith('BR: bad msg.value');
  });

  it('should transfer ether fee correctly', async () => {
    let amount = await feeRecipient.getBalance();
    await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [ethAddress, '100', AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [AddressZero, '0'],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        [ethers.utils.parseUnits('0.01', 18), feeRecipient.address],
        notOwner.address,
        mockCaller.address,
        EMPTY_BYTES,
      ],
      {
        value: '100',
      },
    );
    expect(await feeRecipient.getBalance()).to.be.equal(ethers.BigNumber.from(amount).add('1'));
  });

  it('should transfer ether without fee correctly', async () => {
    let amount = await provider.getBalance(mockCaller.address);
    await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [ethAddress, '100', AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [AddressZero, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, ['0', AddressZero], AddressZero, mockCaller.address, EMPTY_BYTES],
      {
        value: '100',
      },
    );
    expect(await provider.getBalance(mockCaller.address)).to.be.equal(
      ethers.BigNumber.from(amount).add('100'),
    );
  });

  it('should transfer 100% relative amount', async () => {
    let amount = await weth.balanceOf(owner.address);
    await weth.approve(router.address, amount);
    await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [wethAddress, ethers.utils.parseUnits('1', 18), AMOUNT_RELATIVE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [AddressZero, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
    );
    expect(await weth.balanceOf(owner.address)).to.be.equal('0');

    const weth9 = await ethers.getContractAt('IWETH', wethAddress);
    await weth9.deposit({
      value: ethers.utils.parseUnits('1', 18),
    });
  });

  it('should transfer 50% relative amount', async () => {
    let amount = await weth.balanceOf(owner.address);
    await weth.approve(router.address, amount);
    await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [wethAddress, ethers.utils.parseUnits('0.5', 18), AMOUNT_RELATIVE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [AddressZero, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
    );
    expect(await weth.balanceOf(owner.address)).to.be.equal(ethers.BigNumber.from(amount).div(2));
  });

  it('should not transfer 101% relative amount', async () => {
    let amount = await weth.balanceOf(owner.address);
    await weth.approve(router.address, amount);
    await expect(
      router.functions[EXECUTE_SIGNATURE](
        // input
        [
          [wethAddress, ethers.utils.parseUnits('1.01', 18), AMOUNT_RELATIVE],
          ['0', EMPTY_BYTES],
        ],
        // output
        [AddressZero, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
      ),
    ).to.be.revertedWith('BR: bad amount');
  });

  it('should not transfer DAI with permit with bad signature', async () => {
    const [wallet] = provider.getWallets();
    const daiPermit = await ethers.getContractAt('IDAI', daiAddress, wallet);

    await buyTokenOnUniswap(wallet, daiAddress);

    const nonce = await daiPermit.nonces(wallet.address);
    const typedData = {
      types: {
        Permit: [
          { name: 'holder', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'expiry', type: 'uint256' },
          { name: 'allowed', type: 'bool' },
        ],
      },
      domain: {
        name: 'Dai Stablecoin',
        version: '1',
        chainId: '1',
        verifyingContract: daiAddress,
      },
      message: {
        holder: owner.address,
        spender: wallet.address,
        nonce: nonce.toString(),
        expiry: 0,
        allowed: 'true',
      },
    };
    const signature = await signTypedData(wallet, typedData);
    const amount = await dai.balanceOf(wallet.address);

    await expect(
      router.connect(wallet).functions[EXECUTE_SIGNATURE](
        // input
        [
          [daiAddress, amount, AMOUNT_ABSOLUTE],
          [
            '2',
            `0x${
              (
                await daiPermit.populateTransaction.permit(
                  wallet.address,
                  router.address,
                  nonce.toString(),
                  0,
                  true,
                  signature.v,
                  signature.r,
                  signature.s,
                )
              ).data.slice(10) // slice '0x' and first 4 bytes
            }`,
          ],
        ],
        // output
        [AddressZero, '0'],
        // swap description
        [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
      ),
    ).to.be.revertedWith('Dai/invalid-permit');
  });

  it('should transfer DAI with permit', async () => {
    const [wallet] = provider.getWallets();
    const daiPermit = await ethers.getContractAt('IDAI', daiAddress, wallet);

    await buyTokenOnUniswap(wallet, daiAddress);

    const nonce = await daiPermit.nonces(wallet.address);
    const typedData = {
      types: {
        Permit: [
          { name: 'holder', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'expiry', type: 'uint256' },
          { name: 'allowed', type: 'bool' },
        ],
      },
      domain: {
        name: 'Dai Stablecoin',
        version: '1',
        chainId: '1',
        verifyingContract: daiAddress,
      },
      message: {
        holder: wallet.address,
        spender: router.address,
        nonce: nonce.toString(),
        expiry: FUTURE_TIMESTAMP,
        allowed: 'true',
      },
    };
    const signature = await signTypedData(wallet, typedData);
    const amount = await dai.balanceOf(wallet.address);

    await router.connect(wallet).functions[EXECUTE_SIGNATURE](
      // input
      [
        [daiAddress, amount, AMOUNT_ABSOLUTE],
        [
          '2',
          `0x${
            (
              await daiPermit.populateTransaction.permit(
                wallet.address,
                router.address,
                nonce.toString(),
                FUTURE_TIMESTAMP,
                true,
                signature.v,
                signature.r,
                signature.s,
              )
            ).data.slice(10) // slice '0x' and first 4 bytes
          }`,
        ],
      ],
      // output
      [AddressZero, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
    );

    expect(await dai.balanceOf(wallet.address)).to.be.equal('0');
  });

  it('should transfer USDC with permit', async () => {
    const [wallet] = provider.getWallets();
    const usdcPermit = await ethers.getContractAt('IEIP2612', usdcAddress, wallet);

    await buyTokenOnUniswap(wallet, usdcAddress);

    const nonce = await usdcPermit.nonces(wallet.address);
    const typedData = {
      types: {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      domain: {
        name: 'USD Coin',
        version: '2',
        chainId: '1',
        verifyingContract: usdcAddress,
      },
      message: {
        owner: wallet.address,
        spender: router.address,
        value: MaxUint256,
        nonce: nonce.toString(),
        deadline: FUTURE_TIMESTAMP,
      },
    };
    const signature = await signTypedData(wallet, typedData);
    const amount = await usdc.balanceOf(wallet.address);

    await router.connect(wallet).functions[EXECUTE_SIGNATURE](
      // input
      [
        [usdcAddress, amount, AMOUNT_ABSOLUTE],
        [
          1,
          `0x${
            (
              await usdcPermit.populateTransaction.permit(
                wallet.address,
                router.address,
                MaxUint256,
                FUTURE_TIMESTAMP,
                signature.v,
                signature.r,
                signature.s,
              )
            ).data.slice(10) // slice '0x' and first 4 bytes
          }`,
        ],
      ],
      // output
      [AddressZero, '0'],
      // swap description
      [SWAP_FIXED_INPUTS, ['0', AddressZero], notOwner.address, mockCaller.address, EMPTY_BYTES],
    );

    expect(await usdc.balanceOf(wallet.address)).to.be.equal('0');
  });
});
