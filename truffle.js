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
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`, 0),
      network_id: 1,
      gas: 2000000,
      gasPrice: 1000000000,
      timeoutBlocks: 200,
    },
  },
  compilers: {
    solc: {
      version: '0.6.1',
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
    }, // See options below
  },
};
