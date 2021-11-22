![](https://i.ibb.co/7QCQKPD/MEDIUM-FINAL.png)
[![Build status](https://github.com/zeriontech/protocol-wrappers/workflows/build/badge.svg)](https://github.com/zeriontech/defi-sdk/actions?query=workflow:build)
[![Test status](https://github.com/zeriontech/protocol-wrappers/workflows/test/badge.svg)](https://github.com/zeriontech/defi-sdk/actions?query=workflow:test)
[![Coverage status](https://github.com/zeriontech/protocol-wrappers/workflows/coverage/badge.svg)](https://github.com/zeriontech/defi-sdk/actions?query=workflow:coverage)
[![Lint status](https://github.com/zeriontech/protocol-wrappers/workflows/lint/badge.svg)](https://github.com/zeriontech/defi-sdk/actions?query=workflow:lint)
[![License](https://badgen.net/github/license/zeriontech/defi-sdk)](https://www.gnu.org/licenses/lgpl-3.0.en.html)
[![Discord](https://badgen.net/badge/zerion/Zerion?icon=discord&label=discord)](https://go.zerion.io/discord)
[![Twitter Follow](https://badgen.net/twitter/follow/zerion_io?icon=twitter)](https://twitter.com/intent/follow?screen_name=zerion_io)

**DeFi SDK** is an open-source system of smart contracts allows you to track balances on diffenert protocols and execute trades with ERC20 tokens.

If you have any questions about DeFi SDK, feel free to reach out to us on our [Discord server](https://go.zerion.io/discord).

![](https://i.ibb.co/RC54SjL/defisdk.png)

## Features

**💥Query user assets and debt deposited in DeFi protocols like *Maker, Aave, dYdX*, etc.**
> How much debt does `0xdead..beef` have on Compound?

**📊Get the underlying components of complex derivative ERC20 tokens**
> How much `cUSDC` vs `ETH` does `ETHMACOAPY` have?

**✨Interact with multiple DeFi protocols in a unified way**
> See [How to interact with DeFi SDK contracts](docs/interacting.md)

## Addresses

**AdapterRegistry** contract is deployed to the mainnet and its source code is verified on [etherscan](https://etherscan.io/address/0x06fe76b2f432fdfecaef1a7d4f6c3d41b5861672#code){target=_blank}.

All the deployed contracts' addresses are available [here](docs/addresses.md).


## How to Add Your Adapter

The full instructions on how to add a custom adapter to the **AdapterRegistry** contract may be found in our [wiki](../../wiki/Adding-new-adapters).

If you have questions and/or want to add your adapter to Zerion reach out to us on our [Discord server](https://go.zerion.io/discord).


## Trading

* Trade any ERC20 token
* Two types of amounts: absolute (usual amount) and relative (percentage of balance)
* Three types of `permit()` functions for approving tokens in the same transaction (EIP2612, DAI-like, Yearn-like)
* Two types of swaps: with fixed input amount or fixed output amount
* Two types of fees:
  * protocol fee managed by the Router contract owner with possibility of one-time discounts requiring signature of an address with the special role
  * marketplace fee managed by the transaction creator
* Relayed transactions requiring just an EIP712 signature of the user

## Security Vulnerabilities 🛡

If you discover a security vulnerability within DeFi SDK, please send us an e-mail at inbox@zerion.io.
All security vulnerabilities will be promptly addressed.

## Dev Notes

This project uses Hardhat, which runs tests extremely fast!

The project (Router contract and its dependencies) is fully covered with tests.

Fees are applied so that return amount = actual output amount / (1 + fee percentage).

### Set environment

Rename `.env.sample` file to `.env`, and fill in the env variables.

`INFURA_API_KEY` is required for Router contract tests as it uses mainnet forking feature.

### Compile contracts

`npm run compile`

### Run tests

`npm run test`

### Run Solidity code coverage

`npm run coverage`

Currently, unsupported files are ignored.

### Run Solidity and JS linters

`npm run lint`

Currently, unsupported files are ignored.

### Run all the migrations scripts

`npm run deploy:network`, `network` is either `development` or `mainnet`.

### Serve docs

`npm run docs:serve`

## License

All smart contracts are released under GNU LGPLv3.
