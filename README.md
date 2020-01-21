# Zerion Smart Contracts

This is a project with Zerion Smart Contracts interacting with different DeFi protocols.

![](https://github.com/zeriontech/protocol-wrappers/workflows/lint/badge.svg)
![](https://github.com/zeriontech/protocol-wrappers/workflows/build/badge.svg)
![](https://github.com/zeriontech/protocol-wrappers/workflows/coverage/badge.svg)

## Table of Contents

  - [WatcherRegistry](#watcherregistry-is-protocolassetsmanager)
  - [ProtocolAssetsManager](#protocolassetsmanager-is-ownable)
  - [Ownable](#ownable)
  - [watchers/DSRWatcher](#dsrwatcher-is-protocolwatcher)
  - [watchers/SynthetixWatcher](#synthetixwatcher-is-protocolwatcher)
  - [watchers/CurveWatcher](#curvewatcher-is-protocolwatcher)
  - [watchers/ProtocolWatcher (abstract contract)](#protocolwatcher-abstract-contract)
  - [Logic](#logic)
  - [TokenSpender](#tokenspender)
  - [wrappers/ProtocolWrapper (abstract contract)](#protocolwrapper-is-protocolwatcher-abstract-contract)
  - [Use-cases for Logic contract](#use-cases-for-logic-contract)
    * [Swap cDAI to DSR (Chai)](#swap-cdai-to-dsr-chai)
  - [Dev notes](#dev-notes)
    * [Adding new protocol wrapper](#adding-new-protocol-wrapper)
    * [Available Functionality](#available-functionality)

## WatcherRegistry is [ProtocolAssetsManager](#protocolassetsmanager-is-ownable)

Registry holding array of protocol watchers and checking balances via these watchers.

### `view` functions

#### `function balanceOf(address user) returns (ProtocolBalance[] memory)`

Iterates over `protocolWatchers` and appends balances and rates.

#### `function balanceOf(address user, address protocolWatcher) returns (AssetBalance[] memory)`

Iterates over `protocolWatcher`s assets and appends balances.

#### `function balanceOf(address user, address protocolWatcher, address[] memory assets) returns (AssetBalance[] memory)`

Iterates over given assets for given `protocolWatcher` and appends balances.

#### `function exchangeRates(address protocolWatcher) returns (Rate[] memory)`

Iterates over `protocolWatcher`s assets and appends rates.

#### `function exchangeRates(address protocolWatcher, address[] memory assets) returns (Rate[] memory)`

Iterates over given assets for given `protocolWatcher` and appends rates.

## ProtocolAssetsManager is [Ownable](#ownable)

Base contract for `WatcherRegistry` contract.
Implements logic connected with `protocolWatcher`s and their `assets` management.

### State variables

```
address[] internal protocolWatchers;
mapping(address => address[]) internal assets;
```

### `onlyOwner` functions

#### `function addProtocolWatcher(address protocolWatcher, address[] calldata _assets)`

#### `function removeProtocolWatcher(uint256 watcherIndex)`

#### `function addProtocolWatcherAsset(uint256 watcherIndex, address asset)`

#### `function removeProtocolWatcherAsset(uint256 watcherIndex, uint256 assetIndex)`

### `view` functions

#### `function getProtocolWatcherAssets(address protocolWatcher) returns (address[] memory)`

#### `function getProtocolWatchers() returns (address[] memory)`

## Ownable 

Base contract for `ProtocolAssetsManager` and `Logic` contracts.
Implements `Ownable` logic.
Includes `onlyOwner` modifier, `transferOwnership(address)` function, and public state variable `owner`. 

## DSRWatcher is [ProtocolWatcher](#protocolwatcher-abstract-contract)

Watcher for DSR protocol.
There will be only watcher as DSR protocol is not tokenized.

## SynthetixWatcher is [ProtocolWatcher](#protocolwatcher-abstract-contract)

Watcher for Synthetix protocol.
Amount returned by `balanceOf()` function is the amount of tokens locked by minting sUSD tokens.
There will be only watcher as debt at Synthetix protocol is not tokenized.

## CurveWatcher is [ProtocolWatcher](#protocolwatcher-abstract-contract)

Watcher for Curve.fi protocol.
Currently, there is the only pool with cDAI/cUSDC locked on it.

## ProtocolWatcher (abstract contract)

Base contract for protocol watchers.
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

1. Iterates over array of actions, checks whitelist, and calls corresponding ProtocolWrappers with asset, amount, and additional data as arguments (deposit, or withdraw).
2. Finalization (returns all resulting tokens back to the user).

```
function executeActions(Action[] actions) external payable
```

## TokenSpender

Verifies the supplied signature and extracts the address of spender from it. Sends all the assets to the logic layer. Adds all the transferred assets to the list of withdrawable/toBeWithdrawn/resulting tokens.

```
function transferApprovedAssets(Approval[] approvals, Action[] actions, bytes signature) external
```

## ProtocolWrapper is [ProtocolWatcher](#protocolwatcher-abstract-contract) (abstract contract)

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
        protocolWrapper: <address of cDAI wrapper>,
        asset: 0x5d3a536e4d6dbd6114cc1ead35777bab948e3643,
        amount: Amount({
            amountType: AmountType.Relative,
            value: RELATIVE_AMOUNT_BASE
        }),
        data: ""
    },
    {
        actionType: ActionType.Deposit,
        protocolWrapper: <address of chai wrapper>,
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

### Adding new protocol wrapper

To add new protocol wrapper, you have to inherit from  `ProtocolWrapper` contract.
Then implement `deposit()` and `withdraw()` functions.
Both functions MUST return addresses of the assets sent beck to the `msg.sender`.

You also have to implement functions from  `ProtocolWatcher` contract as well.
`protocolName()`, `balanceOf()`, and `exchangeRate()` functions MUST be implemented.

Note: only `internal constant` state variables and `internal` functions MUST be used.

`protocolName()` function has no arguments and MUST return the name of protocol.

`balanceOf(address,address)` function has two arguments of `address` type:
 the first one is asset address and the second one is user address.
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
