# How to interact with DeFi SDK contracts

## Using AdapterManager contract with supported adapters

The main contract for interaction is **AdapterRegistry**.
It allows to check balances and exchange rates for tokens used in the different protocols.

Please, read the [Notes](#notes) before using this contract.

--- 
```solidity
getBalances(address account) returns (ProtocolBalance[])
```

The function takes account address as the only parameter.

It iterates over supported protocols, all their adapters and supported tokens and return balances of the tokens locked on the supported protocols.

The function returns an array of the `ProtocolBalance` structs.
Its exact definition may be found in [Structs.sol](https://github.com/zeriontech/defi-sdk/blob/master/contracts/Structs.sol){target=_blank}.

This struct has protocol metadata as the first field.
After that, adapter balances are added.
The following object is an example of `ProtocolBalance` struct.

```javascript
{
  metadata : {
    name: "Curve",
    description: "Exchange liquidity pool for stablecoin trading",
    iconURL: "protocol-icons.s3.amazonaws.com/curve.fi.png",
    websiteURL: "curve.fi",
    version: 1,
  },
  adapterBalances: [
    {
      adapterType: "Asset",
      balances: [
        {
          base: {
            info: {
              token: "0x3740fb63ab7a09891d7c0d4299442A551D06F5fD",
              name: "cDAI+cUSDC pool",
              symbol: "cDAI+cUSDC",
              decimals: 18
            },
            value: 398803979082926895
          },
          underlying: [
            {
              info: {
                token: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
                name: "Dai Stablecoin",
                symbol: "DAI",
                decimals: 18
              },
              value: 31350436734836604220961509427578200
            },
            {
              info: {
                token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                name: "USD//C",
                symbol: "USDC",
                decimals: 6
              },
              value: 370922396493302226989865
            }
          ]
        },
        ...
      ]
    }
  ]
}
```

--- 
```solidity
getProtocolBalances(address account, string[] protocolNames) returns (ProtocolBalance[])
```

The function works exactly as `getBalances()`, but iterates only over the selected protocols. `protocolNames` consists of protocol names that are listed in [Supported protocols](#supported-protocols) section.

--- 
```solidity
getAdapterBalances(address account, address[] adapters) returns (AdapterBalance[])
```

The function iterates only over the selected adapters.
`adapters` may consist both of supported and unsupported adapters.

--- 
```solidity
getAdapterBalance(address account, address adapter, address[] tokens) returns (AdapterBalance)
```

The function iterates only over the selected tokens for the selected adapter.
This is the preferred way of getting balances for pools like Uniswap V1 and Balancer (as they do not have any supported tokens in the registry).
The best option of getting the adapter address is calling `getProtocolAdapters('Protocol name')[0]`.

--- 
```solidity
getProtocolNames() returns (string[])
```

The function returns the list of protocols supported by the **AdapterManager** contract.

--- 
```solidity
getProtocolMetadata(string protocolName) returns (ProtocolMetadata)
```

The function returns the protocol metadata, i.e. name, one line description, icon and website URL's, and version.
This info may be upgraded by the `owner`.
After any upgrade, the protocol version will be increased by 1.

--- 
```solidity
getProtocolAdapters(string protocolName) returns (address[])
```
 
 The function returns the list of protocol adapters for the given protocol name.
After any upgrade, the protocol version will be increased by 1.

--- 
```solidity
getSupportedTokens(address adapter) returns (address[])
```
 
 The function returns the list supported tokens for the given adapter address.
After any upgrade, the protocol version will be increased by 1.

--- 
```solidity
getFullTokenBalance(string tokenType, address token) returns (FullTokenBalance)
getFinalFullTokenBalance(string tokenType, address token) returns (FullTokenBalance)
```

Both functions returns the representation of the token's full share (1e18) in the underlying tokens.
The first one will show the real underlying tokens (e.g. cDAI and cUSDC for Curve Compound pool).
The second will try to recover the "deepest" underlying tokens (e.g. DAI and USDC for Curve Compound pool).

## Using AdapterRegistry contract with non-supported adapters

In case adapter or asset is not supported by **AdapterManager** contract, functions with adapters (and assets) being function's arguments may be used (e.g. `getAdapterBalances()` function).
In this case, one should be sure that token type used in the adapter is supported by the registry (or use "ERC20" token type instead).

More detailed information about adapters may be found in [adapters](supported-protocols/read-only-adapters.md) and [AdapterRegistry](supported-protocols/adapter-registry.md) documentation.

## Notes

1. To check DSR balance, Maker **DSProxy**'s address should be used as `account` parameter.

2. Zero balances are filtered out, adapter balances and protocols without positive balances are filtered out, too.

3. If the balance is inaccessible, the registry will return 0 and, thus, will filter out the balance.

4. If the token's metadata is inaccessible, the **AdapterRegistry** contract will return 
    - "Not available" as token name, 
    - "N/A" as token symbol,
    - 0 as token decimals.
