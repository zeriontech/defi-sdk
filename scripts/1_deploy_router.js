import deploy from './deploy';

try {
  deploy('Router');
} catch (error) {
  console.error(error);
  process.exit(1);
}
