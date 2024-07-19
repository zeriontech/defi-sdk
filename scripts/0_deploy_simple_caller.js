import deployContract from './deployContract';

try {
  console.log('Make sure 0x014040C6A9cd6366f8fa858535b7DdfAc507dB20 is used and nonce is 1');
  deployContract('SimpleCaller');
} catch (error) {
  console.error(error);
  process.exit(1);
}
