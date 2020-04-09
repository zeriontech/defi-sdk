![](https://i.ibb.co/RC54SjL/defisdk.png)

# DeFi SDK

[![Build status](https://github.com/zeriontech/protocol-wrappers/workflows/build/badge.svg)](https://github.com/zeriontech/defi-sdk/actions?query=workflow:build)
[![Test status](https://github.com/zeriontech/protocol-wrappers/workflows/test/badge.svg)](https://github.com/zeriontech/defi-sdk/actions?query=workflow:test)
[![Coverage status](https://github.com/zeriontech/protocol-wrappers/workflows/coverage/badge.svg)](https://github.com/zeriontech/defi-sdk/actions?query=workflow:coverage)
[![Lint status](https://github.com/zeriontech/protocol-wrappers/workflows/lint/badge.svg)](https://github.com/zeriontech/defi-sdk/actions?query=workflow:lint)
[![License](https://badgen.net/github/license/zeriontech/defi-sdk)](https://www.gnu.org/licenses/lgpl-3.0.en.html)
[![Discord](https://badgen.net/badge/zerion/Zerion?icon=discord&label=discord)](https://go.zerion.io/discord)
[![Twitter Follow](https://badgen.net/twitter/follow/zerion_io?icon=twitter)](https://twitter.com/intent/follow?screen_name=zerion_io)

**DeFi SDK** is an open-source system of smart contracts designed for precise DeFi portfolio accounting. To put it simply, DeFi SDK is the on-chain *balanceOf* for DeFi protocols.

If you have any questions about DeFi SDK, feel free to reach out to us on our [Discord server](https://go.zerion.io/discord).

## Features


#### 💥Query user assets and debt deposited in DeFi protocols like *Maker, Aave, dYdX*, etc. 
> How much debt does `0xdead..beef` have on Compound?
#### 📊Get the underlying components of complex derivative ERC20 tokens 
> How much `cUSDC` vs `ETH` does `ETHMACOAPY` have?
#### ✨Interact with multiple DeFi protocols in a unified way (coming soon)
> See [What’s next for DeFi SDK](#whats-next-for-defi-sdk-)

## Table of Contents

  - [Examples](#examples)
  - [DeFi SDK architecture](#defi-sdk-architecture)
  - [Addresses](#addresses)
  - [Supported protocols](#supported-protocols)
  - [How to add your adapter](#how-to-add-your-adapter)
  - [What’s next for DeFi SDK](#whats-next-for-defi-sdk-)
  - [Security vulnerabilities](#security-vulnerabilities-)

## Examples

### Fetch Compound debt and collateral

As of now, to get all cTokens along with a user's debt on Compound you need to perform over 10 calls to the Ethereum node to different contracts or rely on a centralized API. With DeFi SDK, you can call

```solidity
getProtocolBalances('0xdead...beef', ['Compound'])
```

on the `api.zerion.eth` smart contract and get all borrowed and supplied tokens

```javascript
[{
  metadata: {
    name: 'Compound',
    description: 'Decentralized Lending & Borrowing Protocol',
    websiteURL: 'compound.finance',
    iconURL: 'protocol-icons.s3.amazonaws.com/compound.png',
    version: '0'
  },
  adapterBalances: [{
    metadata: {
      adapterAddress: '0x90F0Ed76cfCf75Ccab31A9b4E51782F230aA0747',
      adapterType: 'Asset'
    },
    balances: [{
      base: {
        metadata: {
          token: '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E',
          name: 'Compound Basic Attention Token',
          symbol: 'cBAT',
          decimals: '8'
        },
        amount: '314159265'
      },
      underlying: [{
        metadata: {
          token: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
          name: 'Basic Attention Token',
          symbol: 'BAT',
          decimals: '18'
        },
        amount: '6626070040000000000'
      }]
    }]
  },{
      metadata: {
        adapterAddress: '0xD0646777520Aff625F976a8D81b95B5B42cDa1B9',
        adapterType: 'Debt'
      },
      balances: [{
        base: {
          metadata: {
            token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            name: 'Dai Stablecoin',
            symbol: 'DAI',
            decimals: '18'
          },
          amount: '1971081500000000000'
        },
        underlying: []
      }]
    }
  ]
}]
```

### Make sense of tokens like `UNI-V1 ETH-cDAI`

<p align="center">
  <img src="https://i.ibb.co/ZHq39S3/derivatives.png" width="650">
</p>

Sometimes, a DeFi token contains several other tokens, and to calculate their price, you need to know their underlying assets. For example, a `Uniswap V1 cDAI pool` consists of `ETH` and `cDAI`. `cDAI`, in turn, has `DAI` as an underlying token. With DeFi SDK you can call

```solidity 
// Uniswap V1 cDAI pool
getFinalFullTokenBalance('0x34E89740adF97C3A9D3f63Cc2cE4a914382c230b', "Uniswap V1 pool token")
```

 and fetch the decomposition of UNI-token into ERC20 tokens, like `ETH` and `DAI`

```javascript
0.98 ETH
215.6 DAI
```

### Get account balances across all supported DeFi protocols

In case you want to get account balances across all supported DeFi protocols, you can call

```solidity 
// bankless.zerion.eth portfolio 
getBalances('0x0ef51b7dac3933b8109482e7d910c21848e45da0f') 
```

and obtain all balances for a given account. The response from the smart-contract will contain information about each of the protocols

```javascript
100 DAI // collateral on Compound
0.1 ETH // debt on Compound
100 USDC // locked in PoolTogether
213 TUSD + 201 USDC + 82 USDT + 11 DAI // Curve Y pool
...
```

## DeFi SDK Architecture

- **ProtocolAdapter** is a special contract for every protocol. Its main purpose is to wrap all the protocol interactions.
There are different types of protocol adapters: "Asset" adapter returns the amount of the account's tokens held on the protocol and the "Debt" adapter returns the amount of the account's debt to the protocol. Some protocols do not use "simple" ERC20 tokens but instead have complex derivatives, for example the Compound protocol has CTokens. The **ProtocolAdapter** contract also provides information about the type of tokens used within it.
- **TokenAdapter** is a contract for every derivative token type (e.g cTokens, aTokens, yTokens, etc.)
Its main purpose is to provide ERC20-style token metadata as well as information about the underlying ERC20 tokens (like DAI for cDAI). Namely, it provides addresses, types and rates of underlying tokens.
- **AdapterRegistry** is a contract that a) maintains a list of *ProtocolAdapters* and *TokenAdapters* and b) is called to fetch user balances.

More detailed documentation about contracts can be found in [adapters](../../wiki/Adapters) and [AdapterRegistry](../../wiki/AdapterRegistry) documentation.

## Addresses

**AdapterRegistry** contract is deployed to the mainnet and its source code is verified on [etherscan](https://etherscan.io/address/0x06fe76b2f432fdfecaef1a7d4f6c3d41b5861672#code).

All the deployed contracts' addresses are available [here](../../wiki/Addresses).

## Supported Protocols

| Protocol Name | Description | Protocol Adapters | Token Adapters |
| :-----------: | :---------: | :---------------: | :------------: |
| [Aave](./contracts/adapters/aave) | Decentralized lending & borrowing protocol. | [Asset adapter](./contracts/adapters/aave/AaveAssetAdapter.sol) <br> [Debt adapter](contracts/adapters/aave/AaveDebtAdapter.sol) | ["AToken"](./contracts/adapters/aave/AaveTokenAdapter.sol) |
| [Balancer](./contracts/adapters/balancer) | Non-custodial portfolio manager, liquidity provider, and price sensor. | [Asset adapter](./contracts/adapters/balancer/BalancerAdapter.sol) supports all Balancer pools | ["Balancer pool token"](./contracts/adapters/aave/BalancerTokenAdapter.sol) |
| [Compound](./contracts/adapters/compound) | Decentralized lending & borrowing protocol. | [Asset adapter](./contracts/adapters/compound/CompoundAssetAdapter.sol) <br> [Debt adapter](./contracts/adapters/compound/CompoundDebtAdapter.sol) | ["CToken"](./contracts/adapters/compound/CompoundTokenAdapter.sol) |
| [Curve](./contracts/adapters/curve) | Exchange liquidity pool for stablecoin trading. Supports Compound, Y, and BUSD pools. | [Asset adapter](./contracts/adapters/curve/CurveAdapter.sol) | ["Curve pool token"](contracts/adapters/curve/CurveTokenAdapter.sol) |
| [dYdX](./contracts/adapters/dydx) | Decentralized trading platform. All 4 markets (WETH, SAI, USDC, DAI) are supported. | [Asset adapter](./contracts/adapters/dydx/DyDxAssetAdapter.sol) <br> [Debt adapter](./contracts/adapters/dydx/DyDxDebtAdapter.sol) | — |
| [Idle](./contracts/adapters/idle) | Yield aggregator for lending platforms. | [Asset adapter](./contracts/adapters/idle/IdleAdapter.sol) | ["IdleToken"](./contracts/adapters/idle/IdleTokenAdapter.sol) |
| [iearn.finance (v2/v3)](./contracts/adapters/iearn) | Yield aggregator for lending platforms. Protocol adapter is duplicated for v2 and v3 versions of protocol. | [Asset adapter](./contracts/adapters/iearn/IearnAdapter.sol) | ["YToken"](./contracts/adapters/iearn/IearnTokenAdapter.sol) |
| [Chai](./contracts/adapters/maker) | A simple ERC20 wrapper over the Dai Savings Rate. | [Asset adapter](./contracts/adapters/maker/ChaiAdapter.sol) | ["Chai token"](./contracts/adapters/maker/ChaiTokenAdapter.sol) |
| [DSR](./contracts/adapters/maker) | Decentralized lending protocol by MakerDAO. | [Asset adapter](./contracts/adapters/maker/DSRAdapter.sol) | — |
| [MCD](./contracts/adapters/maker) | Collateralized loans on Maker. | [Asset adapter](./contracts/adapters/maker/MCDAssetAdapter.sol) <br> [Debt adapter](./contracts/adapters/maker/MCDDebtAdapter.sol) | — |
| [PoolTogether](./contracts/adapters/poolTogether) | Decentralized no-loss lottery. Supports SAI, DAI, and USDC pools. | [Asset adapter](./contracts/adapters/poolTogether/PoolTogetherAdapter.sol) | ["PoolTogether pool"](./contracts/adapters/poolTogether/PoolTogetherTokenAdapter.sol) |
| [Synthetix](./contracts/adapters/synthetix) | Synthetic assets protocol. Asset adapter returns amount of SNX locked as collateral. | [Asset adapter](./contracts/adapters/synthetix/SynthetixAssetAdapter.sol) <br> [Debt adapter](./contracts/adapters/synthetix/SynthetixDebtAdapter.sol) | — |
| [Uniswap V1](./contracts/adapters/uniswap) | Automated liquidity protocol. Top 30 pools are added to the **AdapterRegistry** contract, however  adapter supports all Uniswap pools. | [Asset adapter](./contracts/adapters/uniswap/UniswapV1Adapter.sol) supports all Uniswap pools | ["Uniswap V1 pool token"](./contracts/adapters/uniswap/UniswapV1TokenAdapter.sol) |
| [0x Staking](./contracts/adapters/zrx) | Liquidity rewards for staking ZRX. | [Asset adapter](./contracts/adapters/zrx/ZrxAdapter.sol) | — |

## How to Add Your Adapter

The full instructions on how to add a custom adapter to the **AdapterRegistry** contract may be found in our [wiki](../../wiki/Adding-new-adapters).

If you have questions and/or want to add your adapter to Zerion reach out to us on our [Discord server](https://go.zerion.io/discord).


## What’s Next for DeFi SDK? 🚀

This first version of DeFi SDK is for read-only accounting purposes. Our next step is to introduce Interactive Adapters that allow users to make cross-protocol transactions from a single interface. We are incredibly excited to work with developers, users and the wider DeFi community to make these integrations as secure and accessible as possible. Watch this space, because the “De” in DeFi is about to get a whole lot more user-friendly!

## Security Vulnerabilities 🛡

If you discover a security vulnerability within DeFi SDK, please send us an e-mail at inbox@zerion.io. All security vulnerabilities will be promptly addressed.

## Dev Notes

This project uses Truffle and web3js for all Ethereum interactions and testing.

#### Compile contracts

`npm run compile`

#### Run tests

`npm run test`

#### Run Solidity code coverage

`npm run coverage`

Currently, unsupported files are ignored.

#### Run Solidity and JS linters

`npm run lint`

Currently, unsupported files are ignored.

#### Run all the migrations scripts

`npm run deploy:network`, `network` is either `development` or `mainnet`

#### Verify contract's code on Etherscan

`truffle run verify ContractName@0xcontractAddress --network mainnet`

## License

All smart contracts are released under GNU LGPLv3.
