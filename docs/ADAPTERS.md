## Table of Contents

  - [AdapterRegistry](#adapterregistry-is-adapterassetsmanager)
  - [AdapterAssetsManager (abstract contract)](#adapterassetsmanager-is-ownable-abstract-contract)
  - [Ownable](#ownable)
  - [adapters/AaveDepositAdapter](#aaveadapter-is-adapter)
  - [adapters/CompoundBorrowAdapter](#compoundadapter-is-adapter)
  - [adapters/CurveLiquidityAdapter](#curveadapter-is-adapter)
  - [adapters/DSRAdapter](#dsradapter-is-adapter)
  - [adapters/MCDDepositAdapter](#mcdadapter-is-adapter)
  - [adapters/MKRAdapter (abstract contract)](#mkradapter-abstract-contract)
  - [adapters/PoolTogetherAdapter](#pooltogetheradapter-is-adapter)
  - [adapters/SynthetixDepositAdapter](#synthetixadapter-is-adapter)
  - [adapters/ZrxAdapter](#zrxadapter-is-adapter)
  - [adapters/Adapter (interface)](#adapter-interface)

## AdapterRegistry is [AdapterAssetsManager](#adapterassetsmanager-is-ownable-abstract-contract)

Registry holding array of protocol adapters and checking balances and rates via these adapters.

### `view` functions

#### `function getProtocolsBalancesAndRates(address user) returns (ProtocolBalancesAndRates[] memory)`

Iterates over `adapters` list and appends balances and rates for all the supported assets.

#### `function getProtocolsBalances(address user) returns (ProtocolBalances[] memory)`

Iterates over `adapters` list and appends balances for all the supported assets.

#### `function getProtocolsRates() returns (ProtocolRates[] memory)`

Iterates over `adapters` list and appends rates for all the supported assets.

#### `function getAssetBalances(address user, address adapter) returns (AssetBalance[] memory)`

Iterates over `adapter`'s assets and appends balances.

#### `function getAssetRates(address adapter) returns (AssetRate[] memory)`

Iterates over `adapter`'s assets and appends rates.

#### `function getAssetBalances(address user, address adapter, address[] memory assets) returns (AssetBalance[] memory)`

Iterates over the given `assets` for the given `adapter` and appends balances.

#### `function getAssetRates(address adapter, address[] memory assets) returns (AssetRate[] memory)`

Iterates over the given `assets` for the given `adapter` and appends rates.

## AdapterAssetsManager is [Ownable](#ownable) (abstract contract)

Base contract for `AdapterRegistry` contract.
Implements logic connected with `Adapter`s and their `assets` management.

### State variables

```
mapping(address => address) internal adapters;
mapping(address => uint256) public addedAt;
mapping(address => address[]) internal assets;
```

### `onlyOwner` functions

#### `function addAdapter(address newAdapter, address[] calldata newAssets)`

New adapter is added before the first existing adapter.

#### `function removeAdapter(address oldAdapter)`

#### `function replaceAdapter(address oldAdapter, address newAdapter, address[] newAssets)`

`newAssets` array is optional parameter. If empty, assets will remain unchanged.

#### `function addAdapterAsset(address adapter, address asset)`

New asset is added after the last adapter's asset.

#### `function removeAdapterAsset(address adapter, uint256 assetIndex)`

### `view` functions

#### `function getAdapterAssets(address adapter) returns (address[] memory)`

#### `function getAdapters() returns (address[] memory)`

## Ownable 

Base contract for `AdapterAssetsManager` and `Logic` contracts.
Implements `Ownable` logic.
Includes `onlyOwner` modifier, `transferOwnership()` function, and public state variable `owner`. 

## AaveDepositAdapter is [Adapter](#Adapter-interface)

Adapter for Aave protocol.

## CompoundBorrowAdapter is [Adapter](#Adapter-interface)

Adapter for Compound protocol.

## CurveLiquidityAdapter is [Adapter](#Adapter-interface)

Adapter for [curve.fi](https://compound.curve.fi/) protocol.
Currently, there is the only pool with cDAI/cUSDC locked on it.

## DSRAdapter is [Adapter](#Adapter-interface)

Adapter for DSR protocol.

## MCDDepositAdapter is [Adapter](#Adapter-interface)

Adapter for MCD vaults.

## MKRAdapter (abstract contract)

Base contract for Maker adapters.
Includes all the required constants and `pure` functions with calculations.

## PoolTogetherAdapter is [Adapter](#Adapter-interface)

Adapter for PoolTogether protocol. Supports DAI and SAI pools.

## SynthetixDepositAdapter is [Adapter](#Adapter-interface)

Adapter for Synthetix protocol.

`getAssetAmount()` function returns the following amounts:
- amount of SNX tokens locked by minting sUSD tokens (positive);
- amount of sUSD that should be burned to unlock SNX tokens (negative).

## ZrxAdapter is [Adapter](#Adapter-interface)

Adapter for 0x Staking protocol.

## Adapter (interface)

Interface for protocol adapters.
Includes all the functions required to be implemented.
Adapters inheriting this interface should be stateless.
Only `internal constant` state variables may be used.

### Functions

#### `function getProtocol() external pure virtual returns (string memory)`

MUST return name of the protocol.

#### `getAssetAmount(address, address) external view virtual returns (uint256)`

MUST return amount of the given asset locked on the protocol by the given user.

#### `function getAssetRate(address asset) external view virtual returns (Component[] memory)`

MUST return struct with underlying assets exchange rates for the given asset.

Exchange rate is a number, such that 

```
underlying asset amount = asset amount * exchange rate / 1e18
``` 

Note: rates are scaled by `1e18` due to rounding issues.
