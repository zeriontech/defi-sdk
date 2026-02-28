# AdapterRegistry

AdapterRegistry is [ProtocolManager](#protocolmanager-is-ownable-abstract-contract), [TokenAdapterManager](#tokenadaptermanager-is-ownable-abstract-contract)

Registry holding array of protocol adapters and checking balances and rates via these adapters.

### `view` functions

--- 
```solidity
function getBalances(address account) returns (ProtocolBalance[])
```

Iterates over all the supported protocols, their adapters and supported tokens and appends balances.
> NOTE! Filters out zero balances, adapters, and protocols without positive balances.

--- 
```solidity
function getProtocolBalances(address account, string[] protocolNames) returns (ProtocolBalance[])
```

Iterates over the `protocolNames`, their adapters and supported tokens and appends balances.
> NOTE! Filters out zero balances, adapters, and protocols without positive balances.

--- 
```solidity
function getAdapterBalances(address account, address[] adapters) returns (AdapterBalance[])
```

Iterates over `adapters` and their tokens and appends balances.
> NOTE! Filters out zero balances and adapters without positive balances.

---
```solidity
function getAdapterBalance(address account, address adapter, address[] tokens) returns (AdapterBalance)
```
Iterates over `tokens` and appends balances.
> NOTE! Filters out zero balances.

--- 
```solidity
function getFullTokenBalance(string tokenType, address token) returns (FullTokenBalance)
```

Returns the representation of the token's full share (1e18) in the underlying tokens.
This function will show the real underlying tokens (e.g. cDAI and cUSDC for Curve Compound pool).

--- 
```solidity
function getFinalFullTokenBalance(string tokenType, address token) returns (FullTokenBalance)
```

Returns the representation of the token's full share (1e18) in the underlying tokens.
This function will try to recover the "deepest" underlying tokens (e.g. DAI and USDC for Curve Compound pool).

## ProtocolManager 

ProtocolManager is [Ownable](#ownable) (abstract contract)

Base contract for `AdapterRegistry` contract.
Implements logic connected with `ProtocolName`s, `ProtocolAdapter`s, and their `supportedTokens` management.

### State variables

```
mapping (string => string) internal nextProtocolName;
mapping (string => ProtocolMetadata) internal protocolMetadata;
mapping (string => address[]) internal protocolAdapters;
mapping (address => address[]) internal supportedTokens;
```

### `onlyOwner` functions

--- 
```solidity
function addProtocols(string[] protocolNames, ProtocolMetadata[] metadata, address[][] adapters, address[][][] tokens)
```

--- 
```solidity
function removeProtocols(string[] protocolNames)
```

--- 
```solidity
function updateProtocolMetadata(string protocolName, string name, string description, string websiteURL, string iconURL)
```

Increases protocol version by 1.

--- 
```solidity
function addProtocolAdapters(string protocolName, address[] adapters, address[][] tokens)
```

Increases protocol version by 1.

--- 
```solidity
function removeProtocolAdapters(string protocolName, uint256[] adapterIndices)
```

Increases protocol version by 1.

--- 
```solidity
function updateProtocolAdapter(string protocolName, uint256 index, address newAdapterAddress, address[] newSupportedTokens)
```

Increases protocol version by 1.

### `view` functions

--- 
```solidity
function getProtocolNames() returns (string[])
```

Returns list of protocols' names.

--- 
```solidity
function getProtocolMetadata(string protocolName) returns (ProtocolMetadata)
```

Returns name, description, websiteURL, iconURL and version of the protocol.

--- 
```solidity
function getProtocolAdapters(string protocolName) returns (address[])
```

Returns adapters addresses.

--- 
```solidity
function getSupportedTokens(address adapter) returns (address[])
```

Returns adapter's supported tokens.

--- 
```solidity
function isValidProtocol(string protocolName) returns (bool)
```

Returns `true` if protocol name is listed in the registry and `false` otherwise.

## TokenAdapterManager 

TokenAdapterManager is [Ownable](#ownable) (abstract contract)

Base contract for `AdapterRegistry` contract.
Implements logic connected with `ProtocolName`s, `ProtocolAdapter`s, and their `supportedTokens` management.

### State variables

```
mapping (string => string) internal nextTokenAdapterName;
mapping (string => address) internal tokenAdapter;
```

### `onlyOwner` functions

--- 
```solidity
function addTokenAdapters(string[] tokenAdapterNames, address[] adapters)
```

--- 
```solidity
function removeTokenAdapters(string[] tokenAdapterNames)
```

--- 
```solidity
function updateTokenAdapter(string tokenAdapterName, address adapter)
```

### `view` functions

--- 
```solidity
function getTokenAdapterNames() returns (string[])
```

Returns list of token adapters' names.

--- 
```solidity
function getTokenAdapter(string tokenAdapterName) returns (address)
```

Returns token adapter address.

--- 
```solidity
function isValidTokenAdapter(string tokenAdapterName) returns (bool)
```

Returns `true` if token adapter name is listed in the registry and `false` otherwise.

## Ownable 

Base contract for `ProtocolManager` and `TokenAdapterManager` contracts.
Implements `Ownable` logic.
Includes `onlyOwner` modifier, `transferOwnership()` function, and public state variable `owner`. 
