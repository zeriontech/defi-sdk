require('@babel/register');
require('core-js');
require('regenerator-runtime/runtime');
require('dotenv').config();

const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  plugins: [
    'solidity-coverage',
    'truffle-plugin-verify',
  ],
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      gas: 2000000,
      gasPrice: 1100000000,
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`, 0),
      network_id: 1,
      gas: 3000000,
      gasPrice: 1100000000,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    kovan: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`, 0),
      network_id: 42,
      gas: 3000000,
      gasPrice: 1100000000,
      timeoutBlocks: 10,
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: '0.6.2',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
  api_keys: {
    etherscan: `${process.env.ETHERSCAN_API_KEY}`,
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD',
      gasPrice: 1,
    },
  },
};
