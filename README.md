![](https://i.ibb.co/JFgRB6H/cover.png)
[![Build status](https://github.com/zeriontech/protocol-wrappers/workflows/build/badge.svg)](https://github.com/zeriontech/defi-sdk/actions?query=workflow:build)
[![Test status](https://github.com/zeriontech/protocol-wrappers/workflows/test/badge.svg)](https://github.com/zeriontech/defi-sdk/actions?query=workflow:test)
[![Coverage status](https://github.com/zeriontech/protocol-wrappers/workflows/coverage/badge.svg)](https://github.com/zeriontech/defi-sdk/actions?query=workflow:coverage)
[![Lint status](https://github.com/zeriontech/protocol-wrappers/workflows/lint/badge.svg)](https://github.com/zeriontech/defi-sdk/actions?query=workflow:lint)
[![License](https://badgen.net/github/license/zeriontech/defi-sdk)](https://www.gnu.org/licenses/lgpl-3.0.en.html)
[![Discord](https://badgen.net/badge/zerion/Zerion?icon=discord&label=discord)](https://go.zerion.io/discord)
[![Twitter Follow](https://badgen.net/twitter/follow/zerion_io?icon=twitter)](https://twitter.com/intent/follow?screen_name=zerion_io)

**DeFi SDK** is an open-source system of smart contracts designed for precise DeFi portfolio accounting. To put it simply, DeFi SDK is the on-chain *balanceOf* for DeFi protocols.

If you have any questions about DeFi SDK, feel free to reach out to us on our [Discord server](https://zerion.io/discord).

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

Find more examples of defi-sdk usage [here](https://github.com/zeriontech/defi-sdk-examples) (`web3js`, `ethers.js`).

### Fetch Compound debt and collateral

As of now, to get all cTokens along with a user's debt on Compound you need to perform over 10 calls to the Ethereum node to different contracts or rely on a centralized API. With DeFi SDK, you can call

```solidity
getProtocolBalances('0xdead...beef', ['Compound'])
```

on the [api.zerion.eth](https://etherscan.io/address/0x06fe76b2f432fdfecaef1a7d4f6c3d41b5861672#code) smart contract and get all borrowed and supplied tokens

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
getFinalFullTokenBalance("Uniswap V1 pool token", 0x34E89740adF97C3A9D3f63Cc2cE4a914382c230b)
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
getBalances(0x0ef51b7dac3933b8109482e7d910c21848e45da0f) 
```

and obtain all balances for a given account. The response from the smart-contract will contain information about each of the protocols

```javascript
100 DAI // collateral on Compound
0.1 ETH // debt on Compound
100 USDC // locked in PoolTogether
213 TUSD + 201 USDC + 82 USDT + 11 DAI // Curve Y pool
...
```

### Get account balances across DeFi protocols that uses liquidity pools

For the protocols that uses a lot of liquidity pools (Bancor, Balancer, Uniswap) balances are not available by default in `getBalances()` function.
Balances for such protocols must be fetched by `getAdapterBalance()` function with a list of pools passed as a function parameter. If you call

```solidity
getBalances(
    0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990, // account address
    0x581Ae5AF7afa6f8171Bbf40d1981779F168A9523, // balancer adapter address
    [0x53b89CE35928dda346c574D9105A5479CB87231c,
        0x987D7Cc04652710b74Fff380403f5c02f82e290a] // balancer pools addresses 
) 
```

you will obtain Balancer balances for given pools. The response from the smart-contract will contain information about each of the pools

```javascript
1.3 ETH + 552.4 DAI // 30% WETH + 70% DAI pool
4.2 MKR + 2.5 WETH // 75% MKR + 25% WETH pool
```

## DeFi SDK Architecture

<p align="center">
  <img src="https://i.ibb.co/9WHj59L/architecture.png" width="650">
</p>

- **ProtocolAdapter** is a special contract for every protocol. Its main purpose is to wrap all the protocol interactions.
There are different types of protocol adapters: "Asset" adapter returns the amount of the account's tokens held on the protocol and the "Debt" adapter returns the amount of the account's debt to the protocol. Some protocols do not use "simple" ERC20 tokens but instead have complex derivatives, for example the Compound protocol has CTokens. The **ProtocolAdapter** contract also provides information about the type of tokens used within it.
- **TokenAdapter** is a contract for every derivative token type (e.g cTokens, aTokens, yTokens, etc.)
Its main purpose is to provide ERC20-style token metadata as well as information about the underlying ERC20 tokens (like DAI for cDAI). Namely, it provides addresses, types and rates of underlying tokens.
- **AdapterRegistry** is a contract that a) maintains a list of *ProtocolAdapters* and *TokenAdapters* and b) is called to fetch user balances.

More detailed documentation about contracts can be found in [adapters](../../wiki/Adapters) and [AdapterRegistry](../../wiki/AdapterRegistry) documentation.

## Addresses

**AdapterRegistry** contract's mainnet address is **0x06FE76B2f432fdfEcAEf1a7d4f6C3d41B5861672**.
Its source code is verified on [etherscan](https://etherscan.io/address/0x06fe76b2f432fdfecaef1a7d4f6c3d41b5861672#code).

All the deployed contracts' addresses are available [here](../../wiki/Addresses).

## Supported Protocols

| Protocol Name | Description | Protocol Adapters | Token Adapters |
| :-----------: | :---------: | :---------------: | :------------: |
| [Aave](./contracts/adapters/aave) | Decentralized lending & borrowing protocol. Aave market.| [Asset adapter](./contracts/adapters/aave/AaveAssetAdapter.sol) <br> [Debt adapter](contracts/adapters/aave/AaveDebtAdapter.sol) | ["AToken"](./contracts/adapters/aave/AaveTokenAdapter.sol) |
| [Aave • Uniswap Market](./contracts/adapters/aaveUniswap) | Decentralized lending & borrowing protocol. Uniswap market. | [Asset adapter](./contracts/adapters/aaveUniswap/AaveUniswapAssetAdapter.sol) <br> [Debt adapter](contracts/adapters/aaveUniswap/AaveUniswapDebtAdapter.sol) | ["AToken Uniswap Market"](./contracts/adapters/aave/AaveTokenAdapter.sol) |
| [Ampleforth](./contracts/adapters/ampleforth) | An adaptive money built on sound economics. | [Asset adapter](./contracts/adapters/ampleforth/AmpleforthAdapter.sol) | — |
| [Aragon](./contracts/adapters/aragon) | ANT staking rewards. | [Staking adapter](./contracts/adapters/aragon/AragonStakingAdapter.sol) | — |
| [Balancer](./contracts/adapters/balancer) | Non-custodial portfolio manager, liquidity provider, and price sensor. | [Asset adapter](./contracts/adapters/balancer/BalancerAdapter.sol) supports all Balancer pools | ["Balancer pool token"](./contracts/adapters/balancer/BalancerTokenAdapter.sol) |
| [Bancor](./contracts/adapters/bancor) | Automated liquidity protocol. | [Asset adapter](./contracts/adapters/bancor/BancorAdapter.sol) supports Bancor pools starting from version 11 | ["SmartToken"](./contracts/adapters/bancor/BancorTokenAdapter.sol) |
| [Bzx](./contracts/adapters/bzx) | Decentralized margin trading & lending & borrowing protocol.| [Asset adapter](./contracts/adapters/bzx/BzxAssetAdapter.sol) <br> [Debt adapter](contracts/adapters/bzx/BzxDebtAdapter.sol) <br> [Staking Adapter](./contracts/adapters/bzx/BzxStakingAdapter.sol) <br> [Vesting Staking Adapter](./contracts/adapters/bzx/BzxVestingStakingAdapter.sol) | [iToken Adapter](./contracts/adapters/bzx/BzxTokenAdapter.sol) |
| [Compound](./contracts/adapters/compound) | Decentralized lending & borrowing protocol. | [Asset adapter](./contracts/adapters/compound/CompoundAssetAdapter.sol) <br> [Debt adapter](./contracts/adapters/compound/CompoundDebtAdapter.sol) <br> [Governance adapter](./contracts/adapters/compound/CompoundGovernanceAdapter.sol) | ["CToken"](./contracts/adapters/compound/CompoundTokenAdapter.sol) |
| [C.R.E.A.M.](./contracts/adapters/cream) | A lending platform based on Compound Finance and exchange platform based on Balancer Labs. | [Asset adapter](./contracts/adapters/cream/CreamAssetAdapter.sol) <br> [Debt adapter](./contracts/adapters/cream/CreamDebtAdapter.sol) <br> [Staking adapter](./contracts/adapters/cream/CreamStakingAdapter.sol) | — |
| [Curve](./contracts/adapters/curve) | Exchange liquidity pool for stablecoin trading. | [Asset adapter](./contracts/adapters/curve/CurveAdapter.sol) <br> [Staking adapter](./contracts/adapters/curve/CurveStakingAdapter.sol) <br> [Vesting adapter](./contracts/adapters/curve/CurveVestingAdapter.sol) | ["Curve pool token"](contracts/adapters/curve/CurveTokenAdapter.sol) |
| [DDEX • Lending](./contracts/adapters/ddexLending) | Decentralized lending and borrowing | [Asset adapter](./contracts/adapters/ddexLending/DdexLendingAssetAdapter.sol) | — |
| [DDEX • Margin](./contracts/adapters/ddexMargin) | Decentralized margin trading | [Asset adapter](./contracts/adapters/ddexMargin/DdexMarginAssetAdapter.sol) <br> [Debt adapter](./contracts/adapters/ddexMargin/DdexMarginDebtAdapter.sol) | — |
| [DDEX • Spot](./contracts/adapters/ddexSpot) | Decentralized trading | [Asset adapter](./contracts/adapters/ddexSpot/DdexSpotAssetAdapter.sol) | — |
| [DeFi Money Market](./contracts/adapters/dmm) | Crypto through revenue-producing real world assets. | [Asset adapter](./contracts/adapters/dmm/DmmAssetAdapter.sol) | ["MToken"](contracts/adapters/dmm/DmmTokenAdapter.sol) |
| [DODO](./contracts/adapters/dodo) | Your on-chain liquidity provider. | [Asset adapter](./contracts/adapters/dodo/DodoAdapter.sol) <br> [Staking adapter](./contracts/adapters/dodo/DodoStakingAdapter.sol) | ["DODO pool token"](contracts/adapters/dodo/DodoTokenAdapter.sol) |
| [dYdX](./contracts/adapters/dydx) | Decentralized trading platform. All 4 markets (WETH, SAI, USDC, DAI) are supported. | [Asset adapter](./contracts/adapters/dydx/DyDxAssetAdapter.sol) <br> [Debt adapter](./contracts/adapters/dydx/DyDxDebtAdapter.sol) | — |
| [Idle](./contracts/adapters/idle) | Yield aggregator for lending platforms. | [Asset adapter](./contracts/adapters/idle/IdleAdapter.sol) | ["IdleToken"](./contracts/adapters/idle/IdleTokenAdapter.sol) |
| [iearn.finance (v2/v3)](./contracts/adapters/iearn) | Yield aggregator for lending platforms. Protocol adapter is duplicated for v2 and v3 versions of protocol. | [Asset adapter](./contracts/adapters/iearn/IearnAdapter.sol) | ["YToken"](./contracts/adapters/iearn/IearnTokenAdapter.sol) |
| [Harvest](./contracts/adapters/harvest) | Your hard work is about to become easier with Harvest. | [Staking adapter](./contracts/adapters/harvest/HarvestStakingAdapter.sol) | — |
| [KeeperDAO](./contracts/adapters/keeperDao) | An on-chain liquidity underwriter for DeFi. | [Asset adapter](./contracts/adapters/keeperDao/KeeperDaoAssetAdapter.sol) | ["KToken"](contracts/adapters/keeperDao/KeeperDaoTokenAdapter.sol) |
| [KIMCHI](contracts/adapters/kimchi) | Farm KIMCHI by staking LP tokens. | [Staking adapter](contracts/adapters/kimchi/KimchiStakingAdapter.sol) | — |
| [KyberDAO](./contracts/adapters/kyber) | Platform that allows KNC token holders to participate in governance. | [Asset adapter](./contracts/adapters/kyber/KyberAssetAdapter.sol) | — |
| [Livepeer](./contracts/adapters/livepeer) | Delegated stake based protocol for decentralized video streaming. | [Staking adapter](./contracts/adapters/livepeer/LivepeerStakingAdapter.sol) | — |
| [Chai](./contracts/adapters/maker) | A simple ERC20 wrapper over the Dai Savings Protocol. | [Asset adapter](./contracts/adapters/maker/ChaiAdapter.sol) | ["Chai token"](./contracts/adapters/maker/ChaiTokenAdapter.sol) |
| [Dai Savings Protocol](./contracts/adapters/maker) | Decentralized lending protocol. | [Asset adapter](./contracts/adapters/maker/DSRAdapter.sol) | — |
| [Maker Governance](./contracts/adapters/maker) | MKR tokens locked on the MakerDAO governance contracts. | [Asset adapter](./contracts/adapters/maker/MakerGovernanceAdapter.sol) | — |
| [Multi-Collateral Dai](./contracts/adapters/maker) | Collateralized loans on Maker. | [Asset adapter](./contracts/adapters/maker/MCDAssetAdapter.sol) <br> [Debt adapter](./contracts/adapters/maker/MCDDebtAdapter.sol) | — |
| [Matic](contracts/adapters/matic) | A scaling solution for public blockchains. | [Staking adapter](contracts/adapters/matic/MaticStakingAdapter.sol) | — |
| [Melon](contracts/adapters/melon) | A protocol for decentralized on-chain asset management. | [Asset adapter](contracts/adapters/melon/MelonAssetAdapter.sol) | ["MelonToken"](./contracts/adapters/melon/MelonTokenAdapter.sol) |
| [mStable](./contracts/adapters/mstable) | mStable unifies stablecoins, lending and swapping into one standard. | [Asset adapter](./contracts/adapters/mstable/MstableAssetAdapter.sol) <br> [Staking adapter](./contracts/adapters/mstable/MstableStakingAdapter.sol) | ["Masset"](./contracts/adapters/mstable/MstableTokenAdapter.sol) |
| [Nexus Mutual](./contracts/adapters/nexus) | A people-powered alternative to insurance. | [Staking adapter](./contracts/adapters/nexus/NexusStakingAdapter.sol) | — |
| [Pendle Finance](./contracts/adapters/pendle) | Trading future yield. | [Asset adapter](./contracts/adapters/pendle/PendleMarketAdapter.sol) <br> [Staking adapter](./contracts/adapters/pendle/PendleStakingAdapter.sol) | ["Pendle Market"](./contracts/adapters/pendle/PendleMarketTokenAdapter.sol) |
| [Pickle Finance](./contracts/adapters/pickle) | Off peg bad, on peg good. | [Asset adapter](./contracts/adapters/pickle/PickleAssetAdapter.sol) <br> [Staking adapter V1](./contracts/adapters/pickle/PickleStakingV1Adapter.sol) <br> [Staking adapter V2](./contracts/adapters/pickle/PickleStakingV2Adapter.sol) | ["PickleJar"](./contracts/adapters/pickle/PickleTokenAdapter.sol) |
| [PieDAO](./contracts/adapters/pieDAO) | The Asset Allocation DAO. | [Asset adapter](./contracts/adapters/pieDAO/PieDAOPieAdapter.sol) <br> [Staking adapter](./contracts/adapters/pieDAO/PieDAOStakingAdapter.sol) | ["PieDAO Pie Token"](./contracts/adapters/pieDAO/PieDAOPieTokenAdapter.sol) |
| [PoolTogether](./contracts/adapters/poolTogether) | Decentralized no-loss lottery. Supports SAI, DAI, and USDC pools. | [Asset adapter](./contracts/adapters/poolTogether/PoolTogetherAdapter.sol) | ["PoolTogether pool"](./contracts/adapters/poolTogether/PoolTogetherTokenAdapter.sol) |
| [SashimiSwap](contracts/adapters/sashimi) | Earn SASHIMI tokens by staking Uniswap V2 LP Tokens. | [Staking adapter](contracts/adapters/sashimi/SashimiStakingAdapter.sol) | — |
| [SushiSwap](contracts/adapters/sushi) | Stake Uniswap LP tokens to claim your very own yummy SUSHI! | [Staking adapter](contracts/adapters/sushi/SushiStakingAdapter.sol) | — |
| [Swerve](contracts/adapters/swerve) | A fork that's 100% community owned and governed. | [Asset adapter](./contracts/adapters/swerve/SwerveAdapter.sol) <br> [Staking adapter](contracts/adapters/swerve/SwerveStakingAdapter.sol) | ["Swerve pool token"](contracts/adapters/swerve/SwerveTokenAdapter.sol) |
| [Synthetix](./contracts/adapters/synthetix) | Synthetic assets protocol. Asset adapter returns amount of SNX locked as collateral. | [Asset adapter](./contracts/adapters/synthetix/SynthetixAssetAdapter.sol) <br> [Debt adapter](./contracts/adapters/synthetix/SynthetixDebtAdapter.sol) | — |
| [TokenSets](./contracts/adapters/tokenSets) | Automated asset management strategies. | [Asset adapter](./contracts/adapters/tokenSets/TokenSetsAdapter.sol) <br> [Asset adapter V2](./contracts/adapters/tokenSets/TokenSetsV2Adapter.sol) | ["SetToken"](./contracts/adapters/tokenSets/TokenSetsTokenAdapter.sol) <br> ["SetToken V2"](./contracts/adapters/tokenSets/TokenSetsV2TokenAdapter.sol) |
| [Unagii](./contracts/adapters/unagii) | DeFi yields on auto-pilot. | [Asset adapter](./contracts/adapters/unagii/UnagiiVaultAdapter.sol) | — |
| [Uniswap V1](./contracts/adapters/uniswap) | Automated liquidity protocol. | [Asset adapter](./contracts/adapters/uniswap/UniswapV1Adapter.sol) supports all Uniswap V1 pools | ["Uniswap V1 pool token"](./contracts/adapters/uniswap/UniswapV1TokenAdapter.sol) |
| [Uniswap V2](./contracts/adapters/uniswap) | Automated liquidity protocol. | [Asset adapter](./contracts/adapters/uniswap/UniswapV2Adapter.sol) supports all Uniswap V2 pools | ["Uniswap V2 pool token"](./contracts/adapters/uniswap/UniswapV2TokenAdapter.sol) |
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
