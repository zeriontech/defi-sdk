const { expect } = require('chai');

const { waffle, ethers } = require('hardhat');
const ProtocolAdapterArtifacts = require('../../artifacts/contracts/protocolAdapters/ProtocolAdapter.sol/ProtocolAdapter.json');

const { deployMockContract } = waffle;

describe('AdapterManager', () => {
  let owner;
  let AdapterRegistry;
  let mockProtocolAdapter;
  let adapterRegistry;

  before(async () => {
    AdapterRegistry = await ethers.getContractFactory('ProtocolAdapterRegistry');

    [owner] = await ethers.getSigners();

    mockProtocolAdapter = await deployMockContract(owner, ProtocolAdapterArtifacts.abi);
  });

  beforeEach(async () => {
    adapterRegistry = await AdapterRegistry.deploy();
  });

  it('should be correct router owner', async () => {
    expect(await adapterRegistry.owner()).to.be.equal(owner.address);
  });

  it('should not set adapters with 0 length', async () => {
    await expect(
      adapterRegistry.setAdapters([], [mockProtocolAdapter.address]),
    ).to.be.revertedWith('AM: empty');
  });

  it('should not set adapters with different lengths', async () => {
    await expect(
      adapterRegistry.setAdapters(
        [ethers.utils.formatBytes32String('Mock')],
        [mockProtocolAdapter.address, mockProtocolAdapter.address],
      ),
    ).to.be.revertedWith('AM: lengths differ');
  });

  it('should set adapters', async () => {
    await adapterRegistry.setAdapters(
      [ethers.utils.formatBytes32String('Mock')],
      [mockProtocolAdapter.address],
    );

    let address = await adapterRegistry.getAdapterAddress(
      ethers.utils.formatBytes32String('Mock'),
    );
    expect(address).to.be.equal(mockProtocolAdapter.address);
  });

  it('should not set adapters twice', async () => {
    await adapterRegistry.setAdapters(
      [ethers.utils.formatBytes32String('Mock')],
      [mockProtocolAdapter.address],
    );

    await expect(
      adapterRegistry.setAdapters(
        [ethers.utils.formatBytes32String('Mock')],
        [mockProtocolAdapter.address],
      ),
    ).to.be.revertedWith('AM: same');
  });

  it('should perlace adapters', async () => {
    await adapterRegistry.setAdapters(
      [ethers.utils.formatBytes32String('Mock')],
      [mockProtocolAdapter.address],
    );

    const newMockProtocolAdapter = await deployMockContract(owner, ProtocolAdapterArtifacts.abi);

    await adapterRegistry.setAdapters(
      [ethers.utils.formatBytes32String('Mock')],
      [newMockProtocolAdapter.address],
    );

    let address = await adapterRegistry.getAdapterAddress(
      ethers.utils.formatBytes32String('Mock'),
    );
    expect(address).to.be.equal(newMockProtocolAdapter.address);
  });
});
