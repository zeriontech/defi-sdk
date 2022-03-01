require("@babel/register");
require("core-js");
require("regenerator-runtime/runtime");
require("dotenv").config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-tracer";
import "hardhat-docgen";
import "solidity-coverage";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000000,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      },
      blockGasLimit: 10000000,
      gas: 10000000,
      allowUnlimitedContractSize: true,
    },
    "truffle-dashboard": {
      url: "http://localhost:24012/rpc"
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  docgen: {
    path: "./docs",
    clear: false,
    runOnCompile: false,
  },
  mocha: {
    timeout: "200000",
  },
};

export default config;
