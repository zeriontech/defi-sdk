import deployContract from './deployContract';

try {
  deployContract('SimpleCaller');
} catch (error) {
  console.error(error);
  process.exit(1);
}
