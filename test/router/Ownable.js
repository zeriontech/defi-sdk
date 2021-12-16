const { expect } = require('chai');

const { ethers } = require('hardhat');

const { AddressZero } = ethers.constants;

describe('Ownable', () => {
  let owner;
  let notOwner;
  let Router;
  let router;
  let notOwnerRouter;

  before(async () => {
    Router = await ethers.getContractFactory('Router');

    [owner, notOwner] = await ethers.getSigners();

    router = await Router.deploy();
    notOwnerRouter = router.connect(notOwner);
  });

  it('should be correct router owner', async () => {
    expect(await router.getOwner()).to.be.equal(owner.address);
  });

  it('should be correct router pending owner', async () => {
    expect(await router.getPendingOwner()).to.be.equal(AddressZero);
    await router.setPendingOwner(notOwner.address);
    expect(await router.getPendingOwner()).to.be.equal(notOwner.address);
  });

  it('should not propose ownership by not pending owner', async () => {
    await expect(notOwnerRouter.setPendingOwner(notOwner.address)).to.be.revertedWith(
      'O: only owner',
    );
  });

  it('should not accept ownership by not pending owner', async () => {
    await expect(router.setOwner()).to.be.revertedWith('O: only pending owner');
  });

  it('should accept ownership by pending owner', async () => {
    await notOwnerRouter.setOwner();
    expect(await notOwnerRouter.getOwner()).to.be.equal(notOwner.address);
  });
});
