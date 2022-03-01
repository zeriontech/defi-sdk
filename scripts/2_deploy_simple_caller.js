import deploy from './deploy';

try {
  deploy('SimpleCaller');
} catch (error) {
  console.error(error);
  process.exit(1);
}
