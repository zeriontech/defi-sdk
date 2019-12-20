# Protocol Wrappers

This is a project with protocol wrappers that looks for assets locked on different protocols.

## Using this Project

This project uses [Buidler](https://buidler.dev) as the platform layer and [Ethers](https://docs.ethers.io/ethers.js/html/index.html) is used for all Ethereum interactions and testing.

## Available Functionality

### Build Contracts

`npm run compile`

### Generate TypeChain Typings

`npm run build`

### Run Contract Tests

`npm run test`

### Deploy to Ethereum

Create/modify network config in `buidler.config.ts` and add API key and private key, then run:

`npx buidler run --network rinkeby scripts/deploy.ts`

### Verify on Etherscan

Add Etherscan API key to `buidler.config.ts`, then run:

`npx buidler verify-contract --contract-name Counter --address <DEPLOYED ADDRESS>`
