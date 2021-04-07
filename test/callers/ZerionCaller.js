import { wethAddress, ethAddress, daiAddress } from '../helpers/tokens';

const { expect } = require('chai');

const { ethers } = require('hardhat');

const { AddressZero } = ethers.constants;

const ACTION_DEPOSIT = 1;
const ACTION_WITHDRAW = 2;
const AMOUNT_ABSOLUTE = 2;
const SWAP_FIXED_INPUTS = 1;
const SWAP_FIXED_OUTPUTS = 2;
const EMPTY_BYTES = '0x';
const EXECUTE_SIGNATURE =
  'execute(((address,uint256,uint8),(uint8,bytes)),(address,uint256),(uint8,(uint256,address),address,address,bytes))';

describe('ZerionCaller', () => {
  let owner;
  let ProtocolAdapterRegistry;
  let Caller;
  let Router;
  let MockInteractiveAdapter;
  let mockInteractiveAdapter;
  let router;
  let caller;
  let protocolAdapterRegistry;
  let weth;
  const logger = new ethers.utils.Logger('1');
  const abiCoder = new ethers.utils.AbiCoder();

  before(async () => {
    ProtocolAdapterRegistry = await ethers.getContractFactory('ProtocolAdapterRegistry');
    Caller = await ethers.getContractFactory('ZerionCaller');
    Router = await ethers.getContractFactory('Router');
    MockInteractiveAdapter = await ethers.getContractFactory('MockInteractiveAdapter');

    [owner] = await ethers.getSigners();

    const weth9 = await ethers.getContractAt('IWETH', wethAddress);
    await weth9.deposit({
      value: ethers.utils.parseEther('1'),
      gasLimit: 1000000,
    });

    weth = await ethers.getContractAt('IERC20', wethAddress, owner);

    protocolAdapterRegistry = await ProtocolAdapterRegistry.deploy();
    caller = await Caller.deploy(protocolAdapterRegistry.address);
    mockInteractiveAdapter = await MockInteractiveAdapter.deploy();
    await protocolAdapterRegistry.setAdapters(
      [ethers.utils.formatBytes32String('Mock')],
      [mockInteractiveAdapter.address],
    );
  });

  beforeEach(async () => {
    router = await Router.deploy();
  });

  it('should be correct getProtocolAdapterRegistry response', async () => {
    expect(await caller.getProtocolAdapterRegistry()).to.be.equal(protocolAdapterRegistry.address);
  });

  it('should not deploy caller with no protocolAdapterRegistry', async () => {
    await expect(Caller.deploy(AddressZero)).to.be.revertedWith(
      'C: empty protocolAdapterRegistry',
    );
  });

  it('should execute with mock adapter deposit', async () => {
    const tx = await router.functions[EXECUTE_SIGNATURE](
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
        ['0', AddressZero],
        caller.address,
        caller.address,
        abiCoder.encode(
          ['bytes'],
          [
            abiCoder.encode(
              ['(bytes32,uint8,(address,uint256,uint8)[],bytes)[]'],
              [[[ethers.utils.formatBytes32String('Mock'), ACTION_DEPOSIT, [], EMPTY_BYTES]]],
            ),
          ],
        ),
      ],
      // call options
      {
        value: '100',
      },
    );
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
  });

  it('should execute with mock adapter withdraw', async () => {
    await weth.approve(router.address, '100');
    const tx = await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [wethAddress, '100', AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [ethAddress, '0'],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        ['0', AddressZero],
        caller.address,
        caller.address,
        abiCoder.encode(
          ['bytes'],
          [
            abiCoder.encode(
              ['(bytes32,uint8,(address,uint256,uint8)[],bytes)[]'],
              [[[ethers.utils.formatBytes32String('Mock'), ACTION_WITHDRAW, [], EMPTY_BYTES]]],
            ),
          ],
        ),
      ],
    );
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
  });

  it('should execute with mock adapter withdraw with 0 tokens', async () => {
    const tx = await router.functions[EXECUTE_SIGNATURE](
      // input
      [
        [wethAddress, '0', AMOUNT_ABSOLUTE],
        ['0', EMPTY_BYTES],
      ],
      // output
      [ethAddress, '0'],
      // swap description
      [
        SWAP_FIXED_INPUTS,
        ['0', AddressZero],
        caller.address,
        caller.address,
        abiCoder.encode(
          ['bytes'],
          [
            abiCoder.encode(
              ['(bytes32,uint8,(address,uint256,uint8)[],bytes)[]'],
              [[[ethers.utils.formatBytes32String('Mock'), ACTION_WITHDRAW, [], EMPTY_BYTES]]],
            ),
          ],
        ),
      ],
    );
    logger.info(`Called router for ${(await tx.wait()).gasUsed} gas`);
  });

  it('should not execute with bad adapter name', async () => {
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
          ['0', AddressZero],
          caller.address,
          caller.address,
          abiCoder.encode(
            ['bytes'],
            [
              abiCoder.encode(
                ['(bytes32,uint8,(address,uint256,uint8)[],bytes)[]'],
                [
                  [
                    [
                      ethers.utils.formatBytes32String('not Mock'),
                      ACTION_DEPOSIT,
                      [],
                      EMPTY_BYTES,
                    ],
                  ],
                ],
              ),
            ],
          ),
        ],
        // call options
        {
          value: '100',
        },
      ),
    ).to.be.revertedWith('ZC: bad name');
  });

  it('should not execute with bad action type', async () => {
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
          ['0', AddressZero],
          caller.address,
          caller.address,
          abiCoder.encode(
            ['bytes'],
            [
              abiCoder.encode(
                ['(bytes32,uint8,(address,uint256,uint8)[],bytes)[]'],
                [[[ethers.utils.formatBytes32String('Mock'), 0, [], EMPTY_BYTES]]],
              ),
            ],
          ),
        ],
        // call options
        {
          value: '100',
        },
      ),
    ).to.be.revertedWith('ZC: bad action type');
  });

  it('should not execute with fixed outputs', async () => {
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
          SWAP_FIXED_OUTPUTS,
          ['0', AddressZero],
          caller.address,
          caller.address,
          abiCoder.encode(
            ['bytes'],
            [
              abiCoder.encode(
                ['(bytes32,uint8,(address,uint256,uint8)[],bytes)[]'],
                [[[ethers.utils.formatBytes32String('Mock'), ACTION_DEPOSIT, [], EMPTY_BYTES]]],
              ),
            ],
          ),
        ],
        // call options
        {
          value: '100',
        },
      ),
    ).to.be.revertedWith('ZC: fixed outputs');
  });
});
