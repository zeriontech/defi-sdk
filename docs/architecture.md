# Architecture

## Read-only adapters

 - **ProtocolAdapter** is a special contract for every protocol. Its main purpose is to wrap all the protocol interactions.
  There are different types of protocol adapters:
   - "Asset" adapter returns the amount of the account's tokens held on the protocol and the 
   - "Debt" adapter returns the amount of the account's debt to the protocol. 
  
  Some protocols do not use "simple" ERC20 tokens but instead have complex derivatives, for example the Compound protocol has CTokens.
  The **ProtocolAdapter** contract also provides information about the type of tokens used within it.
 
 - **TokenAdapter** is a contract for every derivative token type (e.g cTokens, aTokens, yTokens, etc.)
 Its main purpose is to provide ERC20-style token metadata as well as information about the underlying ERC20 tokens (like DAI for cDAI).
 Namely, it provides addresses, types and rates of underlying tokens.
 
 - **AdapterRegistry** is a contract that a) maintains a list of *ProtocolAdapters* and *TokenAdapters* and b) is called to fetch user balances.

More detailed documentation about contracts can be found in [reading](./reading.md) from DeFi SDK.

## Interactive adapters

 - An interactive adapter is the unified interface for multiple protocols. It has two main functions:
    - `deposit()` function is used to deposit assets to a protocol.
    - `withdraw()` function is used to withdraw assets from a protocol.

More detailed documentation about contracts can be found in [interacting](./interacting.md) with DeFi SDK.

## Router

 - Router contract is used for trades on multiple chains.
 It acts like a single endpoint for all the trades on L2 chains in Zerion.
 It uses multiple liquidity sources, interactive adapters may be used as one of liquidity source.

More detailed documentation about [Router](./router.md) contract.
