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
      url: 'https://rpc.zerion.io/v1/arbitrum',
    },
    aurora: {
      url: 'https://rpc.zerion.io/v1/aurora',
    },
    avalanche: {
      url: 'https://rpc.zerion.io/v1/avalanche',
    },
    base: {
      url: 'https://rpc.zerion.io/v1/base',
    },
    blast: {
      url: 'https://rpc.zerion.io/v1/blast',
    },
    bsc: {
      url: 'https://rpc.zerion.io/v1/binance-smart-chain',
    },
    celo: {
      url: 'https://rpc.zerion.io/v1/celo',
    },
    gnosis: {
      url: 'https://rpc.zerion.io/v1/xdai',
    },
    linea: {
      url: 'https://rpc.zerion.io/v1/linea',
    },
    mainnet: {
      url: 'https://rpc.zerion.io/v1/ethereum',
    },
    mantle: {
      url: 'https://rpc.zerion.io/v1/mantle',
    },
    mode: {
      url: 'https://rpc.zerion.io/v1/mode',
    },
    opera: {
      url: 'https://rpc.zerion.io/v1/fantom',
    },
    optimisticEthereum: {
      url: 'https://rpc.zerion.io/v1/optimism',
    },
    polygon: {
      url: 'https://rpc.zerion.io/v1/polygon',
    },
    'polygon-zkevm': {
      url: 'https://rpc.zerion.io/v1/polygon-zkevm',
    },
    scroll: {
      url: 'https://rpc.zerion.io/v1/scroll',
    },
    taiko: {
      url: 'https://rpc.zerion.io/v1/taiko',
    },
    zora: {
      url: 'https://rpc.zora.energy',
    },
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBITRUM_API_KEY ? process.env.ARBITRUM_API_KEY.toString() : '',
      aurora: 'no',
      avalanche: process.env.AVALANCHE_API_KEY ? process.env.AVALANCHE_API_KEY.toString() : '',
      base: process.env.BASE_API_KEY ? process.env.BASE_API_KEY.toString() : '',
      blast: process.env.BLAST_API_KEY ? process.env.BLAST_API_KEY.toString() : '',
      bsc: process.env.BSC_API_KEY ? process.env.BSC_API_KEY.toString() : '',
      celo: process.env.CELO_API_KEY ? process.env.CELO_API_KEY.toString() : '',
      gnosis: process.env.GNOSIS_API_KEY ? process.env.GNOSIS_API_KEY.toString() : '',
      linea: process.env.LINEA_API_KEY ? process.env.LINEA_API_KEY.toString() : '',
      mainnet: process.env.ETHEREUM_API_KEY ? process.env.ETHEREUM_API_KEY.toString() : '',
      mantle: process.env.MANTLE_API_KEY ? process.env.MANTLE_API_KEY.toString() : '',
      mode: 'mode',
      opera: process.env.FANTOM_API_KEY ? process.env.FANTOM_API_KEY.toString() : '',
      optimisticEthereum: process.env.OPTIMISM_API_KEY ? process.env.OPTIMISM_API_KEY.toString() : '',
      polygon: process.env.POLYGON_API_KEY ? process.env.POLYGON_API_KEY.toString() : '',
      'polygon-zkevm': process.env.POLYGON_ZKEVM_API_KEY ? process.env.POLYGON_ZKEVM_API_KEY.toString() : '',
      scroll: process.env.SCROLL_API_KEY ? process.env.SCROLL_API_KEY.toString() : '',
      taiko: process.env.TAIKO_API_KEY ? process.env.TAIKO_API_KEY.toString() : '',
      zora: "zora",
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
      {
        network: 'blast',
        chainId: 81457,
        urls: {
          apiURL: 'https://api.blastscan.io/api',
          browserURL: 'https://blastscan.io/'
        },
      },
      {
        network: 'scroll',
        chainId: 534352,
        urls: {
          apiURL: 'https://api.scrollscan.com/api',
          browserURL: 'https://scrollscan.com/'
        },
      },
      {
        network: 'linea',
        chainId: 59144,
        urls: {
          apiURL: 'https://api.lineascan.build/api',
          browserURL: 'https://api.lineascan.build/'
        },
      },
      {
        network: 'polygon-zkevm',
        chainId: 1101,
        urls: {
          apiURL: 'https://api-zkevm.polygonscan.com/api',
          browserURL: 'https://api-zkevm.polygonscan.com/'
        },
      },
      {
        network: "zora",
        chainId: 7777777,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/mainnet/evm/7777777/etherscan",
          browserURL: "https://zorascan.xyz"
        }
      },
      {
        network: "taiko",
        chainId: 167000,
        urls: {
          apiURL: "https://api.taikoscan.io/api",
          browserURL: "https://taikoscan.io"
        }
      },
      {
        network: "mantle",
        chainId: 5000,
        urls: {
          apiURL: "https://api.mantlescan.xyz/api",
          browserURL: "https://mantlescan.xyz"
        }
      },
      {
        network: "mode",
        chainId: 34443,
        urls: {
          apiURL: "https://explorer.mode.network/api",
          browserURL: "https://explorer.mode.network"
        }
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
