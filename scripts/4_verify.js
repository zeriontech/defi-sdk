import deploymentAddresses from './deployment';

try {
  (async () => {
    await hre.run('verify:verify', {
      address: deploymentAddresses.router,
    });
    await hre.run('verify:verify', {
      address: deploymentAddresses.simpleCaller,
    });
  })();
} catch (error) {
  console.error(error);
  process.exit(1);
}
