import { wethAddress, ethAddress } from '../helpers/tokens';

const { expect } = require('chai');
const { waffle, ethers } = require('hardhat');
const TokenAdapterArtifacts = require('../../artifacts/contracts/tokenAdapters/TokenAdapter.sol/TokenAdapter.json');

const { deployMockContract } = waffle;
const { AddressZero, HashZero } = ethers.constants;

describe('TokenAdapterNamesManager', () => {
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
    await mockTokenAdapter.mock.getComponents.returns([]);
    await mockTokenAdapter.mock.getERC20Metadata.returns(['Name', 'Symbol', 18]);
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
    await mockTokenAdapter.mock.getComponents
      .withArgs(wethAddress)
      .returns([[ethAddress, ethers.utils.parseUnits('1', 18)]]);
    await mockTokenAdapter.mock.getERC20Metadata.withArgs(ethAddress).reverts();
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
    await mockTokenAdapter.mock.getComponents
      .withArgs(wethAddress)
      .returns([[ethAddress, ethers.utils.parseUnits('1', 18)]]);
    await mockTokenAdapter.mock.getComponents
      .withArgs(ethAddress)
      .returns([[AddressZero, ethers.utils.parseUnits('0.5', 18)]]);
    await mockTokenAdapter.mock.getComponents.withArgs(AddressZero).reverts();
    const [fullTokenBalance] = await adapterRegistry.callStatic[
      'getFinalFullTokenBalances((address,int256)[])'
    ]([[wethAddress, '100']]);
    expect(fullTokenBalance.base.tokenBalance.token).to.be.equal(wethAddress);
    expect(fullTokenBalance.underlying[0].tokenBalance.token).to.be.equal(AddressZero);
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
