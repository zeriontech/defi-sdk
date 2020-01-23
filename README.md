# Zerion Smart Contracts

This is a project with Zerion Smart Contracts interacting with different DeFi protocols.

![](https://github.com/zeriontech/protocol-wrappers/workflows/lint/badge.svg)
![](https://github.com/zeriontech/protocol-wrappers/workflows/build/badge.svg)
![](https://github.com/zeriontech/protocol-wrappers/workflows/coverage/badge.svg)

## Table of Contents

  - [AdapterRegistry](#adapterregistry-is-AdapterAssetsManager)
  - [AdapterAssetsManager](#AdapterAssetsManager-is-ownable)
  - [Ownable](#ownable)
  - [adapters/DSRAdapter](#dsradapter-is-Adapter)
  - [adapters/SynthetixAdapter](#synthetixadapter-is-Adapter)
  - [adapters/CurveAdapter](#curveadapter-is-Adapter)
  - [adapters/Adapter (abstract contract)](#Adapter-abstract-contract)
  - [Logic](#logic)
  - [TokenSpender](#tokenspender)
  - [interactiveAdapters/InteractiveAdapter (abstract contract)](#protocolwrapper-is-Adapter-abstract-contract)
  - [Use-cases for Logic contract](#use-cases-for-logic-contract)
    * [Swap cDAI to DSR (Chai)](#swap-cdai-to-dsr-chai)
  - [Dev notes](#dev-notes)
    * [Adding new adapter](#adding-new-adapter)
    * [Available Functionality](#available-functionality)

## AdapterRegistry is [AdapterAssetsManager](#AdapterAssetsManager-is-ownable)

Registry holding array of protocol adapters and checking balances via these adapters.

### `view` functions

#### `function getBalancesAndRates(address user) returns (ProtocolDetail[] memory)`

Iterates over `adapters` list and appends balances and rates.

#### `function getBalances(address user) returns (ProtocolBalance[] memory)`

Iterates over `adapters` list and appends balances.

#### `function getRates() returns (ProtocolRate[] memory)`

Iterates over `adapters` list and appends rates.

#### `function getBalances(address user, address adapter) returns (AssetBalance[] memory)`

Iterates over `adapter`'s assets and appends balances.

#### `function getRates(address adapter) returns (AssetRate[] memory)`

Iterates over `adapter`'s assets and appends rates.

#### `function getBalances(address user, address adapter, address[] memory assets) returns (AssetBalance[] memory)`

Iterates over given `assets` for given `adapter` and appends balances.

#### `function getRates(address adapter, address[] memory assets) returns (AssetRate[] memory)`

Iterates over given `assets` for given `adapter` and appends rates.
s
## AdapterAssetsManager is [Ownable](#ownable)

Base contract for `AdapterRegistry` contract.
Implements logic connected with `Adapter`s and their `assets` management.

### State variables

```
mapping(address => address) internal adapters;
mapping(address => address[]) internal assets;
```

### `onlyOwner` functions

#### `function addAdapter(address adapter, address[] calldata _assets)`

New adapter is added before the first existing adapter.

#### `function removeAdapter(address adapter)`

#### `function addAdapterAsset(address adapter, address asset)`

New asset is added after the last adapter's asset.

#### `function removeAdapterAsset(address adapter, uint256 assetIndex)`

### `view` functions

#### `function getAdapterAssets(address adapter) returns (address[] memory)`

#### `function getAdapters() returns (address[] memory)`

## Ownable 

Base contract for `AdapterAssetsManager` and `Logic` contracts.
Implements `Ownable` logic.
Includes `onlyOwner` modifier, `transferOwnership(address)` function, and public state variable `owner`. 

## DSRAdapter is [Adapter](#Adapter-abstract-contract)

Adapter for DSR protocol.
There will be only adapter as DSR protocol is not tokenized.

## SynthetixAdapter is [Adapter](#Adapter-abstract-contract)

Adapter for Synthetix protocol.
Amount returned by `balanceOf()` function is the amount of tokens locked by minting sUSD tokens.
There will be only adapter as debt at Synthetix protocol is not tokenized.

## CurveAdapter is [Adapter](#Adapter-abstract-contract)

Adapter for Curve.fi protocol.
Currently, there is the only pool with cDAI/cUSDC locked on it.

## Adapter (abstract contract)

Base contract for protocol adapters.
Includes all the functions required to be implemented.
Should be stateless.
Only `internal constant` state variables may be used.

### Functions

#### `function protocolName() external pure virtual returns (string memory)`

MUST return name of the protocol.

#### `balanceOf(address, address) external view virtual returns (uint256)`

MUST return amount of the given asset locked on the protocol by the given user.

#### `function exchangeRate(address asset) external view virtual returns (Component[] memory)`

MUST return struct with underlying assets exchange rates for the given asset.

Exchange rate is a number, such that 

```
underlying asset amount = asset amount * exchange rate / 1e18
``` 

Note: rates are scaled by `1e18` due to rounding issues.

## Logic

0. (optional) Verifies the supplied signature and extracts the address of spender from it. 
1. Iterates over array of actions, checks adapter in AdapterRegistry, and `delegatecall`s corresponding InteractiveAdapter with assets, amounts, and additional data as arguments (deposit, or withdraw).
2. Returns all the resulting tokens back to the user.

```
function executeActions(Action[] actions) external payable
function executeActions(Action[] actions, Approval[] approvals, bytes signature) external payable
```

## TokenSpender

Sends all the assets under the request of Logic contract. Adds all the transferred assets to the list of withdrawable/toBeWithdrawn/resulting tokens.

```
function transferApprovedAssets(Approval[] approvals) external returns (address[])
```

## InteractiveAdapter is [Adapter](#Adapter-abstract-contract) (abstract contract)

Base contract for protocol wrappers.
Includes all the functions required to be implemented.
Should be stateless.
Only `internal constant` state variables may be used.

### Functions

#### `deposit(address, uint256, bytes memory) external payable virtual returns (address[] memory)`

Deposits assets to the lending/borrow/swap/liquidity.
MUST return addresses of the assets sent back to the `msg.sender`.

#### `withdraw(address, uint256, bytes memory) external payable virtual returns (address[] memory)`

Withdraws assets from the lending/borrow/swap/liquidity.
MUST return addresses of the assets sent back to the `msg.sender`.

## Use-cases for Logic contract

### Swap cDAI to DSR (Chai)

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

1. Call `redeem()` function with `balanceOf(address(this))` argument.
2. Approve DAI to `Chai` contract.
3. Call `join()` function with `address(this)` and `balanceOf(address(this))` arguments.
4. Add Chai token to the list of withdrawable/toBeWithdrawn/resulting tokens.

## Dev notes

This project uses Truffle and web3js for all Ethereum interactions and testing.

### Adding new adapter

To add new adapter, you have to inherit from `InteractiveAdapter` contract.
Then implement `deposit()` and `withdraw()` functions.
Both functions MUST return addresses of the assets sent beck to the `msg.sender`, except for ETH.

You have to implement functions from `Adapter` contract as well.
`protocolName()`, `balanceOf()`, and `exchangeRate()` functions MUST be implemented.

Note: only `internal constant` state variables and `internal` functions MUST be used.

`protocolName()` function has no arguments and MUST return the name of protocol.

`balanceOf(address,address)` function has two arguments of `address` type: the first one is asset address and the second one is user address.
The function MUST return amount of given asset held on the protocol for given user.

`exchangeRate(address)` function has only one argument – asset address.
The function MUST return all the underlying assets and their exchange rates scaled by `1e18`.

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

`truffle run verify ContractName@0xcontractAddress --network mainnet`
