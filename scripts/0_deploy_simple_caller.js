import deployContract from './deployContract';

try {
  console.log('Make sure 0x161b29D1919D4E06b53eE449376181B5082b30B9 is used and nonce is 3');
  deployContract('SimpleCaller');
} catch (error) {
  console.error(error);
  process.exit(1);
}
