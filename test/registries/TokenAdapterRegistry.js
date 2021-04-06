import { wethAddress, ethAddress, daiAddress, usdcAddress } from '../helpers/tokens';

const { expect } = require('chai');
const { waffle, ethers } = require('hardhat');
const TokenAdapterArtifacts = require('../../artifacts/contracts/tokenAdapters/TokenAdapter.sol/TokenAdapter.json');

const { deployMockContract } = waffle;
const { AddressZero, HashZero } = ethers.constants;

describe('TokenAdapterRegistry', () => {
  let owner;
  let AdapterRegistry;
  let mockTokenAdapter;
  let adapterRegistry;

  before(async () => {
    AdapterRegistry = await ethers.getContractFactory('TokenAdapterRegistry');

    [owner] = await ethers.getSigners();

    mockTokenAdapter = await deployMockContract(owner, TokenAdapterArtifacts.abi);
  });

  beforeEach(async () => {
    adapterRegistry = await AdapterRegistry.deploy();
    await adapterRegistry.setAdapters([HashZero], [mockTokenAdapter.address]);
    await mockTokenAdapter.mock.getUnderlyingTokenBalances.returns([]);
    await mockTokenAdapter.mock.getMetadata.returns(['Name', 'Symbol', 18]);
  });

  it('should be correct router owner', async () => {
    expect(await adapterRegistry.owner()).to.be.equal(owner.address);
  });

  it('should get empty full token balance for address', async () => {
    const [fullTokenBalance] = await adapterRegistry.callStatic[
      'getFullTokenBalances((address,int256)[])'
    ]([[ethAddress, '100']]);

    expect(fullTokenBalance.base.tokenBalance.token).to.be.equal(ethAddress);
    expect(fullTokenBalance.base.tokenBalance.amount).to.be.equal('100');
    expect(fullTokenBalance.base.erc20metadata.name).to.be.equal('Name');
    expect(fullTokenBalance.base.erc20metadata.symbol).to.be.equal('Symbol');
    expect(fullTokenBalance.base.erc20metadata.decimals).to.be.equal(18);
    expect(fullTokenBalance.underlying.length).to.be.equal(0);
  });

  it('should get empty final full token balance for address', async () => {
    const [fullTokenBalance] = await adapterRegistry.callStatic[
      'getFullTokenBalances(address[])'
    ]([ethAddress]);

    expect(fullTokenBalance.base.tokenBalance.token).to.be.equal(ethAddress);
    expect(fullTokenBalance.base.tokenBalance.amount).to.be.equal(
      ethers.utils.parseUnits('1', 18),
    );
    expect(fullTokenBalance.underlying.length).to.be.equal(0);
  });

  it('should get empty full token balance', async () => {
    const [fullTokenBalance] = await adapterRegistry.callStatic[
      'getFinalFullTokenBalances(address[])'
    ]([wethAddress]);

    expect(fullTokenBalance.base.tokenBalance.token).to.be.equal(wethAddress);
    expect(fullTokenBalance.base.tokenBalance.amount).to.be.equal(
      ethers.utils.parseUnits('1', 18),
    );
    expect(fullTokenBalance.underlying.length).to.be.equal(0);
  });

  it('should get non-empty full token balance', async () => {
    await mockTokenAdapter.mock.getUnderlyingTokenBalances
      .withArgs([wethAddress, '100'])
      .returns([[ethAddress, '100']]);
    await mockTokenAdapter.mock.getMetadata.withArgs([ethAddress, '100']).reverts();
    const [fullTokenBalance] = await adapterRegistry.callStatic[
      'getFullTokenBalances((address,int256)[])'
    ]([[wethAddress, '100']]);
    expect(fullTokenBalance.base.tokenBalance.token).to.be.equal(wethAddress);
    expect(fullTokenBalance.base.tokenBalance.amount).to.be.equal('100');
    expect(fullTokenBalance.base.erc20metadata.name).to.be.equal('Name');
    expect(fullTokenBalance.base.erc20metadata.symbol).to.be.equal('Symbol');
    expect(fullTokenBalance.base.erc20metadata.decimals).to.be.equal(18);
    expect(fullTokenBalance.underlying[0].tokenBalance.token).to.be.equal(ethAddress);
    expect(fullTokenBalance.underlying[0].tokenBalance.amount).to.be.equal('100');
    expect(fullTokenBalance.underlying[0].erc20metadata.name).to.be.equal('Not available');
    expect(fullTokenBalance.underlying[0].erc20metadata.symbol).to.be.equal('N/A');
    expect(fullTokenBalance.underlying[0].erc20metadata.decimals).to.be.equal(0);
  });

  it('should get non-empty final full token balance', async () => {
    await mockTokenAdapter.mock.getUnderlyingTokenBalances
      .withArgs([wethAddress, '100'])
      .returns([[ethAddress, '100']]);
    await mockTokenAdapter.mock.getUnderlyingTokenBalances
      .withArgs([ethAddress, '100'])
      .returns([[AddressZero, '50']]);
    await mockTokenAdapter.mock.getUnderlyingTokenBalances.withArgs([AddressZero, '50']).reverts();
    const [fullTokenBalance] = await adapterRegistry.callStatic[
      'getFinalFullTokenBalances((address,int256)[])'
    ]([[wethAddress, '100']]);
    expect(fullTokenBalance.base.tokenBalance.token).to.be.equal(wethAddress);
    expect(fullTokenBalance.underlying[0].tokenBalance.token).to.be.equal(AddressZero);
  });

  it('should get non-empty final full token balance', async () => {
    await mockTokenAdapter.mock.getUnderlyingTokenBalances.withArgs([wethAddress, '100']).returns([
      [ethAddress, '100'],
      [daiAddress, '20'],
    ]);
    await mockTokenAdapter.mock.getUnderlyingTokenBalances.withArgs([ethAddress, '100']).returns([
      [AddressZero, '50'],
      [usdcAddress, '10'],
    ]);
    await mockTokenAdapter.mock.getUnderlyingTokenBalances.withArgs([AddressZero, '50']).reverts();
    const [fullTokenBalance] = await adapterRegistry.callStatic[
      'getFinalFullTokenBalances((address,int256)[])'
    ]([[wethAddress, '100']]);
    expect(fullTokenBalance.base.tokenBalance.token).to.be.equal(wethAddress);
    expect(fullTokenBalance.underlying[0].tokenBalance.token).to.be.equal(AddressZero);
    expect(fullTokenBalance.underlying[0].tokenBalance.amount).to.be.equal('50');
    expect(fullTokenBalance.underlying[1].tokenBalance.token).to.be.equal(usdcAddress);
    expect(fullTokenBalance.underlying[1].tokenBalance.amount).to.be.equal('10');
    expect(fullTokenBalance.underlying[2].tokenBalance.token).to.be.equal(daiAddress);
    expect(fullTokenBalance.underlying[2].tokenBalance.amount).to.be.equal('20');
  });

  it('should get full token balance without adapter', async () => {
    await adapterRegistry.setAdapters([HashZero], [AddressZero]);
    const [fullTokenBalance] = await adapterRegistry.callStatic[
      'getFullTokenBalances((address,int256)[])'
    ]([[wethAddress, '100']]);
    expect(fullTokenBalance.base.tokenBalance.token).to.be.equal(wethAddress);
    expect(fullTokenBalance.base.erc20metadata.name).to.be.equal('Not available');
    expect(fullTokenBalance.base.erc20metadata.symbol).to.be.equal('N/A');
    expect(fullTokenBalance.base.erc20metadata.decimals).to.be.equal(0);
    expect(fullTokenBalance.underlying.length).to.be.equal(0);
  });
});
