require('@babel/register');
require('core-js');
require('regenerator-runtime/runtime');
require('dotenv').config();
import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';
import '@nomicfoundation/hardhat-verify';
import 'hardhat-tracer';
import 'hardhat-docgen';
import 'solidity-coverage';
// import '@matterlabs/hardhat-zksync-deploy';
// import '@matterlabs/hardhat-zksync-solc';
// import '@matterlabs/hardhat-zksync-verify';


const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.12',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000000,
      },
    },
  },
  // zksolc: {
  //   version: 'latest', // Uses latest available in https://github.com/matter-labs/zksolc-bin/
  //   settings: {},
  // },
  networks: {
    // zkSyncEra: {
    //   zksync: true,
    //   url: 'https://mainnet.era.zksync.io',
    //   ethNetwork: 'mainnet',
    //   verifyURL: 'https://explorer.zksync.io/contracts/verify',
    // },
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      },
      blockGasLimit: 10000000,
      gas: 10000000,
      allowUnlimitedContractSize: true,
      accounts: [
        {
          privateKey: '0xbe5d6e330de6c44c137f8fb45fa44dada079fb8bc29d290cadd8f882035dd189',
          balance: '10000000000000000000000',
        },
        {
          privateKey: '0x473acc210edb35998de9dc65495bafbf0a3804950482cd2b48af7bba7046d7de',
          balance: '10000000000000000000000',
        },
      ]
    },
    'truffle-dashboard': {
      url: 'http://localhost:24012/rpc',
      timeout: 400000,
    },
    arbitrumOne: {
      url: 'https://arb1.arbitrum.io/rpc',
    },
    aurora: {
      url: 'https://mainnet.aurora.dev',
    },
    avalanche: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
    },
    base: {
      url: 'https://mainnet.base.org',
    },
    bsc: {
      url: 'https://bsc-dataseed.binance.org',
    },
    celo: {
      url: 'https://1rpc.io/celo',
    },
    gnosis: {
      url: 'https://rpc.gnosischain.com',
    },
    mainnet: {
      url: 'https://cloudflare-eth.com',
    },
    opera: {
      url: 'https://rpc.ftm.tools',
    },
    optimisticEthereum: {
      url: 'https://mainnet.optimism.io',
    },
    polygon: {
      url: 'https://polygon-rpc.com',
    },
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBITRUM_API_KEY ? process.env.ARBITRUM_API_KEY.toString() : '',
      aurora: 'no',
      avalanche: process.env.AVALANCHE_API_KEY ? process.env.AVALANCHE_API_KEY.toString() : '',
      base: process.env.BASE_API_KEY ? process.env.BASE_API_KEY.toString() : '',
      bsc: process.env.BSC_API_KEY ? process.env.BSC_API_KEY.toString() : '',
      celo: process.env.CELO_API_KEY ? process.env.CELO_API_KEY.toString() : '',
      gnosis: process.env.GNOSIS_API_KEY ? process.env.GNOSIS_API_KEY.toString() : '',
      mainnet: process.env.ETHEREUM_API_KEY ? process.env.ETHEREUM_API_KEY.toString() : '',
      opera: process.env.FANTOM_API_KEY ? process.env.FANTOM_API_KEY.toString() : '',
      optimisticEthereum: process.env.OPTIMISM_API_KEY ? process.env.OPTIMISM_API_KEY.toString() : '',
      polygon: process.env.POLYGON_API_KEY ? process.env.POLYGON_API_KEY.toString() : '',
    },
    customChains: [
      {
        network: 'celo',
        chainId: 42220,
        urls: {
          apiURL: 'https://api.celoscan.io/api',
          browserURL: 'https://celoscan.io/'
        },
      },
    ],
  },
  docgen: {
    path: './docs',
    clear: false,
    runOnCompile: false,
  },
  mocha: {
    timeout: '200000',
  },
};

export default config;
