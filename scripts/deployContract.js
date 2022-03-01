async function deployAsync(contractName) {
  // We get the contract to deploy
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();

  console.log(`${contractName} deployed to: ${contract.address}`);

  return contract.address;
}

const deployContract = (contractName) => {
  return deployAsync(contractName);
};

export default deployContract;
