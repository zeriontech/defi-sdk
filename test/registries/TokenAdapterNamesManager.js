import { uniDaiEthAddress, uniUsdcEthAddress } from '../helpers/tokens';

const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('TokenAdapterNamesManager', () => {
  let owner;
  let AdapterRegistry;
  let adapterRegistry;

  before(async () => {
    AdapterRegistry = await ethers.getContractFactory('TokenAdapterRegistry');

    [owner] = await ethers.getSigners();
  });

  beforeEach(async () => {
    adapterRegistry = await AdapterRegistry.deploy();
  });

  it('should be correct router owner', async () => {
    expect(await adapterRegistry.getOwner()).to.be.equal(owner.address);
  });

  it('should not set adapters names by hashes with 0 length', async () => {
    await expect(
      adapterRegistry.setTokenAdapterNamesByHashes(
        [],
        [ethers.utils.formatBytes32String('UniswapV2')],
      ),
    ).to.be.revertedWith('TANM: empty');
  });

  it('should not set adapters names by hashes with different lengths', async () => {
    await expect(
      adapterRegistry.setTokenAdapterNamesByHashes(
        [uniDaiEthAddress],
        [
          ethers.utils.formatBytes32String('UniswapV2'),
          ethers.utils.formatBytes32String('UniswapV2'),
        ],
      ),
    ).to.be.revertedWith('TANM: lengths differ');
  });

  it('should set adapters names by hashes', async () => {
    await adapterRegistry.setTokenAdapterNamesByHashes(
      [uniDaiEthAddress],
      [ethers.utils.formatBytes32String('UniswapV2')],
    );

    let name = await adapterRegistry.getTokenAdapterName(uniDaiEthAddress);
    expect(name).to.be.equal(ethers.utils.formatBytes32String('UniswapV2'));

    name = await adapterRegistry.getTokenAdapterName(uniUsdcEthAddress);
    expect(name).to.be.equal(ethers.utils.formatBytes32String('UniswapV2'));
  });

  it('should not set adapters names by tokens with 0 length', async () => {
    await expect(
      adapterRegistry.setTokenAdapterNamesByTokens(
        [],
        [ethers.utils.formatBytes32String('UniswapV2')],
      ),
    ).to.be.revertedWith('TANM: empty');
  });

  it('should not set adapters names by tokens with different lengths', async () => {
    await expect(
      adapterRegistry.setTokenAdapterNamesByTokens(
        [uniDaiEthAddress],
        [
          ethers.utils.formatBytes32String('UniswapV2'),
          ethers.utils.formatBytes32String('UniswapV2'),
        ],
      ),
    ).to.be.revertedWith('TANM: lengths differ');
  });

  it('should set adapters names by tokens', async () => {
    await adapterRegistry.setTokenAdapterNamesByTokens(
      [uniDaiEthAddress],
      [ethers.utils.formatBytes32String('UniswapV2')],
    );

    let name = await adapterRegistry.getTokenAdapterName(uniDaiEthAddress);
    expect(name).to.be.equal(ethers.utils.formatBytes32String('UniswapV2'));
  });

  it('should not set adapters nameswith 0 length', async () => {
    await expect(
      adapterRegistry.setTokenAdapterNames([], [ethers.utils.formatBytes32String('UniswapV2')]),
    ).to.be.revertedWith('TANM: empty');
  });

  it('should not set adapters nameswith different lengths', async () => {
    await expect(
      adapterRegistry.setTokenAdapterNames(
        ['0xf4cf7fdef2319300c5fbaf8213a507362bc4dd64c9d4c40a27d04e19ed1a4f82'],
        [
          ethers.utils.formatBytes32String('UniswapV2'),
          ethers.utils.formatBytes32String('UniswapV2'),
        ],
      ),
    ).to.be.revertedWith('TANM: lengths differ');
  });

  it('should set adapters names', async () => {
    await adapterRegistry.setTokenAdapterNames(
      ['0xf4cf7fdef2319300c5fbaf8213a507362bc4dd64c9d4c40a27d04e19ed1a4f82'],
      [ethers.utils.formatBytes32String('UniswapV2')],
    );

    let name = await adapterRegistry.getTokenAdapterName(uniDaiEthAddress);
    expect(name).to.be.equal(ethers.utils.formatBytes32String('UniswapV2'));
  });
});
