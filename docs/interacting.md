# How to interact with different protocols using DeFi SDK contracts

!!! note ""
   Interactive adapters are maintained in [`interactive-updates`](https://github.com/zeriontech/defi-sdk/tree/interactive-updates){target="_blank"} branch of defi-sdk repo.

## Using InteractiveAdapter for interaction with different protocols

Using interactive adapters is not encouraged. We highly recommend using our Transaction Builder [API](https://transactions.zerion.io/docs#/){target="_blank"}.

--- 
```solidity
deposit(TokenAmount[] tokenAmounts, bytes data) payable returns (address[])
```

The function is used to deposit tokens to the protocol.
`data` parameter is optional and usage is described in protocol's adapter NatSpec comments.
Return values is a list of tokens returned by the adapter.

---
```solidity
withdraw(TokenAmount[] tokenAmounts, bytes data) payable returns (address[])
```

The function is used to withdraw tokens from the protocol.
`data` parameter is optional and usage is described in protocol's adapter NatSpec comments.
Return values is a list of tokens returned by the adapter.
