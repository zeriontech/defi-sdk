import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { Signer } from 'ethers';

describe('Ownable', () => {
  let owner: Signer;
  let notOwner: Signer;
  let Router: any;
  let router: any;
  let notOwnerRouter: any;

  before(async () => {
    Router = await ethers.getContractFactory('Router');

    [owner, notOwner] = await ethers.getSigners();

    router = await Router.deploy();
    notOwnerRouter = router.connect(notOwner);
  });

  it('should be correct router owner', async () => {
    expect(await router.getOwner()).to.be.equal(await owner.getAddress());
  });

  it('should be correct router pending owner', async () => {
    expect(await router.getPendingOwner()).to.be.equal(ethers.ZeroAddress);
    await router.setPendingOwner(await notOwner.getAddress());
    expect(await router.getPendingOwner()).to.be.equal(await notOwner.getAddress());
  });

  it('should not propose ownership by not pending owner', async () => {
    await expect(notOwnerRouter.setPendingOwner(await notOwner.getAddress())).to.be.revertedWith(
      'O: only owner',
    );
  });

  it('should not accept ownership by not pending owner', async () => {
    await expect(router.setOwner()).to.be.revertedWith('O: only pending owner');
  });

  it('should accept ownership by pending owner', async () => {
    await notOwnerRouter.setOwner();
    expect(await notOwnerRouter.getOwner()).to.be.equal(await notOwner.getAddress());
  });
}); 
