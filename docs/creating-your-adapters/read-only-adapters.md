# Read-only adapters

## How to add your protocol to DeFi SDK

Once a protocol is added to **ProtocolAdapterRegistry** contract, it will immediately appear in all the interfaces that use DeFi SDK \(including Zerion\). In order to add protocol to to DeFi SDK one has to implement the following contracts.

### `ProtocolAdapter`

To create new protocol adapter, one has to implement [ProtocolAdapter](https://github.com/zeriontech/defi-sdk/blob/master/contracts/adapters/ProtocolAdapter.sol){target=_blank} interface. `adapterType()`, `tokenType()`, and `getBalance()` functions MUST be implemented.

!!! note ""
    **NOTE**: only `internal constant` state variables MUST be used, i.e. adapter MUST be stateless.
    Only `internal` functions SHOULD be used, as all the other functions will not be accessible by **AdapterRegistry** contract.

```solidity
adapterType() returns (string)
```
The function has no arguments and MUST return type of the adapter:

- "Asset" in case the adapter returns the amount of account's tokens held on the protocol;
- "Debt" in case the adapter returns the amount of account's debt to the protocol.

```solidity
tokenType() returns (string)
```

The function has no arguments and MUST return type of the token used by the adapter:

- "ERC20" is the default type;
- "AToken", "CToken", "YToken", "Uniswap pool token", "Curve pool token", "PoolTogether pool" are the currently supported ones.

```solidity
getBalance(address token, address account) returns (int256)
```

The function has two arguments of `address` type: the first one is token address and the second one is account address. The function MUST return balance of given asset held on the protocol for the given account.

---

### `TokenAdapter`

To create new protocol adapter, one has to implement [TokenAdapter](https://github.com/zeriontech/defi-sdk/blob/master/contracts/adapters/TokenAdapter.sol){target="_blank"} interface.

```solidity
getMetadata(address token) external view returns (ERC20Metadata memory)
```

The function has the only argument – token address. The function MUST return the ERC20-style token metadata, namely:

* `name`: `string` with token name;
* `symbol`: `string` with token symbol;
* `decimals`: `uint8` number with token decimals.

```solidity
getComponents(address token) external view returns (Component[] memory)
```

The function has the only argument – token address. The function MUST return all the underlying tokens info:

* `token` : `address` of the underlying token contract;
* `rate` : `uint256` with price per base token share \(1e18\).

After the adapters are deployed and tested, one can contact Zerion team in order to add the adapters to **AdapterRegistry** contract.

---

### Tests

To get a PR merged, one should write tests for all the functions implemented. Examples may be found in the [repo](https://github.com/zeriontech/defi-sdk/tree/master/test){target="_blank"}.

---

### Migrations scripts

In case ProtocolAdapter should work with the short list of tokens, these tokens should be added to the list of supported tokens in ProtocolAdapterRegistry contract. In order to do that, one should add tokens in PR's comments.

