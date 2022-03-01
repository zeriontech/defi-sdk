import deployContract from './deployContract';

try {
  deployContract('Router');
} catch (error) {
  console.error(error);
  process.exit(1);
}
