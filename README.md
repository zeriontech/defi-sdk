# Zerion Smart Contracts

This is a project with Zerion Smart Contracts interacting with different DeFi protocols.

![](https://github.com/zeriontech/protocol-wrappers/workflows/lint/badge.svg)
![](https://github.com/zeriontech/protocol-wrappers/workflows/build/badge.svg)
![](https://github.com/zeriontech/protocol-wrappers/workflows/test/badge.svg)
![](https://github.com/zeriontech/protocol-wrappers/workflows/coverage/badge.svg)

## Summary
This is a system of smart contracts created for intercting with the different DeFi protocols.
In the current implementation, one can check balances of assets locked on the [supported](#list-of-supported-protocols) protocols.
There is a special **Adapter** contract for every protocol.
All the adapters are kept and managed in **AdapterRegistry** contact.
All the interactions are done via **AdapterRegistry** contract as well.

## Table of Contents

  - [Addresses of deployed contracts](#addresses-of-deployed-contracts)
  - [Interacting with AdapterManager](#interacting-with-adaptermanager)
  - [List of supported protocols](#list-of-supported-protocols)
  - [Creating and adding new adapters](#creating-and-adding-new-adapters)
  - [What's next](#whats-next)

## Addresses of deployed contracts

[AdapterRegistry](https://etherscan.io/address/0xaf51e57d3c78ce8495219ceb6d559b85e62f680e#code) is currently the only contract with verified source code.

## Interacting with AdapterManager

### Functions description

AdapterManager is the contract managing the list of supported adapters and their assets.

`getAdapters()` function returns the list of adapters supported by the **AdapterManager** contract.

`getAdapterAssets(address adapter)` function returns the list of assets supported for the given adapter.

This contract is also used for checking balances and exchange rates. 
`getProtocolsBalancesAndRates(address user)`, `getProtocolsBalances(address user)`, `getProtocolsRates()` functions iterate over supported adapters and return balances and/or rates of the assets locked on the supported protocols.

In case adapter or asset is not supported by **AdapterManager** contract, functions with adapters (and assets) being function's arguments may be used.

More detailed information about adapters may be found in [adapters documentation](./docs/ADAPTERS.md).

### Output description

All the functions returns arrays of structs that are defined in [Structs.sol](./contracts/Structs.sol).

Three functions listed above return arrays of the `ProtocolBalancesAndRates`, `ProtocolBalances`, or `ProtocolRates` structs respectively.
All these structs have protocol metadata as the first field. After that, balances and/or rates are added.
The following object is the example of `getProtocolsBalancesAndRates(address user)` function response:

```javascript
{
  protocol: {
    name: "Curve.fi",
    description: "Exchange liquidity pool for stablecoin trading",
    icon: "https://protocol-icons.s3.amazonaws.com/curve.fi.png",
    version: 1
  },
  balances: [
    {
      asset: {
        contractAddress: 0x3740fb63ab7a09891d7c0d4299442A551D06F5fD,
        decimals: 18,
        symbol: "cDAIUSDC"
      },
      balance: 348612565020359685
    }
  ],
  rates: [
    {
      asset: {
        contractAddress: 0x3740fb63ab7a09891d7c0d4299442A551D06F5fD,
          decimals: 18,
          symbol: "cDAIUSDC"
      },
      components: [
        {
          asset: {
            contractAddress: 0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643,
            decimals: 8,
            symbol: "cDAI"
          },
          rate: 2369927755
        },
        {
          asset: {
            contractAddress: 0x39AA39c021dfbaE8faC545936693aC917d5E7563,
            decimals: 8,
            symbol: "cUSDC"
          },
          rate: 2528831163
        }
      ]
    }
  ]
}
```

## List of supported protocols

The following protocols are currently supported:

- Aave
- Compound
- Curve
- DSR
- MCD
- Pool Together
- Synthetix
- 0x Staking

## Creating and adding new adapters

To create new adapter, one have to implement `Adapter` interface.
`getProtocol()`, `getAssetBalance()`, `getAssetRate()`, and `getAsset()` functions MUST be implemented.

> **NOTE**: only `internal constant` state variables MUST be used, i.e. adapter MUST be stateless.
Only `internal` functions SHOULD be used, as all the other functions will not be accessible by **AdapterRegistry** contract.

`getProtocol()` function has no arguments and MUST return the protocol info, namely:

- `name`: `string` with protocol name,
- `description`: `string` with short protocol description,
- `icon`: `string` with icon link,
- `version`: `uint256` number with adapter version.

`getAssetAmount(address,address)` function has two arguments of `address` type:
the first one is asset address and the second one is user address.
The function MUST return balance of given asset held on the protocol for the given user.

`getAssetRate(address)` function has the only argument – asset address.
The function MUST return all the underlying assets and their exchange rates scaled by `1e18`.

`getAsset(address)` function has the only argument – asset address.
The function MUST return the asset info, namely:

- `contractAddress`: `address` of the asset contract,
- `decimals`: `uint8` number with asset decimals,
- `symbol`: `string` with asset symbol.

After the adapter is deployed and tested, one can contact Zerion team in order to add the adapter to the **AdapterRegistry** contract – balances will automatically appear in Zerion interface.

## What's next

We are currently developing interactive part of our system.
All the interactions will be separated into parts – actions.
Actions will be of two kinds – deposit and withdraw.
The actions will be sent to the interactive adapters – adapters interacting with the supported protocols.

The system will consist of the following parts:
  - **Logic** contract. 
The main contract that receives an array of actions, conducts all the calculations, redirects actions to the corresponding interactive adapters.
  - **TokenSpender** contract.
The contract that holds all the approvals from users.
It transfers all the required assets under the request of Logic contract.

### Use-cases for Logic contract

#### Swap cDAI to DSR (Chai)

The following actions array will be sent to `Logic` contract:

```
[
    {
        actionType: ActionType.Withdraw,
        InteractiveAdapter: <address of cDAI wrapper>,
        asset: 0x5d3a536e4d6dbd6114cc1ead35777bab948e3643,
        amount: Amount({
            amountType: AmountType.Relative,
            value: RELATIVE_AMOUNT_BASE
        }),
        data: ""
    },
    {
        actionType: ActionType.Deposit,
        InteractiveAdapter: <address of chai wrapper>,
        asset: 0x5d3a536e4d6dbd6114cc1ead35777bab948e3643,
        amount: Amount({
            amountType: AmountType.Relative,
            value: RELATIVE_AMOUNT_BASE
        }),
        data: ""
    }
]
```

Logic layer should do the following:

1. Call `redeem()` function with `getAssetAmount(address(this))` argument.
2. Approve all the DAI to `Chai` contract.
3. Call `join()` function with `address(this)` and `getAssetAmount(address(this))` arguments.
4. Withdraw Chai tokens to the user.

More detailed information about interactive adapters may be found in [interactive adapters documentation](./docs/INTERACTIVE_ADAPTERS.md).

## Dev notes

This project uses Truffle and web3js for all Ethereum interactions and testing.

### Available Functionality

#### Compile contracts

`npm run compile`

#### Run tests

`npm run test`

#### Run Solidity code coverage

`npm run coverage`

#### Run Solidity and JS linters

`npm run lint`

#### Run all the migrations scripts

`npm run deploy:network`, `network` is either `development` or `mainnet`

#### Verify contract's code on Etherscan

`truffle run verify ContractName@0xcontractAddress –network mainnet`
