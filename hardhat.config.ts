require("@babel/register");
require("core-js");
require("regenerator-runtime/runtime");
require("dotenv").config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "hardhat-tracer";
import "hardhat-docgen";
import "solidity-coverage";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.1",
    settings: {
      optimizer: {
        enabled: false,
        runs: 10,
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
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    gasPrice: 100,
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
