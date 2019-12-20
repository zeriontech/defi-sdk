import { BuidlerConfig, usePlugin } from "@nomiclabs/buidler/config";
import { resolve } from "path";
import { config as dotenvConfig } from "dotenv";
import waffleDefaultAccounts from "ethereum-waffle/dist/config/defaultAccounts";

dotenvConfig({ path: resolve(__dirname, ".env") });

usePlugin("@nomiclabs/buidler-ethers");
usePlugin("@nomiclabs/buidler-etherscan");
usePlugin("buidler-typechain");

const config: BuidlerConfig = {
  solc: {
    version: "0.5.14",
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  paths: {
    artifacts: "./build",
  },
  networks: {
    buidlerevm: {
      accounts: waffleDefaultAccounts.map(acc => ({
        balance: acc.balance,
        privateKey: acc.secretKey
      }))
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.API_KEY}`,
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.API_KEY}`,
      accounts: [`${process.env.PRIVATE_KEY}`]
    },
  },
  etherscan: {
    url: "https://api-rinkeby.etherscan.io/api",
    apiKey: `${process.env.ETHERSCAN_API_KEY}`
  },
  typechain: {
    outDir: "typechain",
    target: "ethers"
  }
};

export default config;
