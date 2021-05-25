import { wethAddress, ethAddress } from '../helpers/tokens';

const { expect } = require('chai');

const { waffle, ethers } = require('hardhat');
const ProtocolAdapterArtifacts = require('../../artifacts/contracts/protocolAdapters/ProtocolAdapter.sol/ProtocolAdapter.json');

const { deployMockContract } = waffle;

describe('ProtocolAdapterRegistry', () => {
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
    await adapterRegistry.setAdapters(
      [ethers.utils.formatBytes32String('Mock')],
      [mockProtocolAdapter.address],
    );
  });

  it('should return correct balances', async () => {
    await mockProtocolAdapter.mock.getBalance.returns('100');

    const [adapterBalance] = await adapterRegistry.callStatic.getAdapterBalances(
      [[ethers.utils.formatBytes32String('Mock'), [wethAddress]]],
      owner.address,
    );

    expect(adapterBalance.name).to.be.equal(ethers.utils.formatBytes32String('Mock'));
    expect(adapterBalance.tokenBalances[0].token).to.be.equal(wethAddress);
    expect(adapterBalance.tokenBalances[0].amount).to.be.equal('100');
  });

  it('should return correct non-zero balances', async () => {
    await mockProtocolAdapter.mock.getBalance.withArgs(wethAddress, owner.address).returns('100');
    await mockProtocolAdapter.mock.getBalance.withArgs(ethAddress, owner.address).reverts();
    await adapterRegistry.setAdapters(
      [ethers.utils.formatBytes32String('Mock1')],
      [mockProtocolAdapter.address],
    );
    const adapterBalances = await adapterRegistry.callStatic.getNonZeroAdapterBalances(
      [
        [ethers.utils.formatBytes32String('Mock'), [wethAddress, ethAddress]],
        [ethers.utils.formatBytes32String('Mock1'), [ethAddress]],
      ],
      owner.address,
    );

    expect(adapterBalances.length).to.be.equal(1);
    expect(adapterBalances[0].tokenBalances.length).to.be.equal(1);
    expect(adapterBalances[0].tokenBalances[0].token).to.be.equal(wethAddress);
    expect(adapterBalances[0].tokenBalances[0].amount).to.be.equal('100');
  });

  it('should not return correct balances for 0 adapter', async () => {
    await expect(
      adapterRegistry.callStatic.getAdapterBalances(
        [[ethers.utils.formatBytes32String('Mock1'), [ethAddress]]],
        owner.address,
      ),
    ).to.be.reverted;
    await expect(
      adapterRegistry.callStatic.getNonZeroAdapterBalances(
        [[ethers.utils.formatBytes32String('Mock1'), [ethAddress]]],
        owner.address,
      ),
    ).to.be.reverted;
  });
});
