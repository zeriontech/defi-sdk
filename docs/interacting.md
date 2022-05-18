# How to interact with different protocols using DeFi SDK contracts

!!! note ""
   Interactive adapters are maintained in [`interactive`](https://github.com/zeriontech/defi-sdk/tree/interactive-updates){target="_blank"} branch of defi-sdk repo.

## Using InteractiveAdapter for interaction with different protocols
The main contract for interaction is [Router](https://etherscan.io/address/0xB2BE281e8b11b47FeC825973fc8BB95332022A54){target=_blank}.
Using interactive adapters directly is not encouraged as **Router** contract implements the required security checks.

Overall, we highly recommend using our Transaction Builder [API](https://transactions.zerion.io/docs#/){target="_blank"}.

## Router interface

---
```solidity
function startExecution(
   Action[] actions,
   TokenAmount[] inputs,
   Fee fee,
   AbsoluteTokenAmount[] requiredOutputs
) returns (AbsoluteTokenAmount[] actualOutputs)
```
This is the main function for interaction with the **Router** contract.

The list of actions describes the sequence of operations (like swap, deposit, etc.) made in a single transaction.
Every action consists of the following elements:
 - interactive adapter name
 - action type, whether to call `deposit()` or `withdraw()` function of the adapter
 - amounts of tokens that should be used in this action
 - additional `data` parameter, which depends on the adapter implementation

The last two elements of action are passed to the proper function as parameters.

The list of inputs describes the input tokens that should be transferred from the caller account.
Note, that enough amounts of tokens should be previously approved for the **Router** contract.

The fee parameter is responsible for charging additional fees from the input amount.
However, its usage is discouraged as it significantly raises the network fee.

The last parameter is the list of output tokens with the amount requirements.
In case the requirement is not fulfilled, the transaction reverts.

The return value is a list of actual output amounts.
It may be used for off-chain estimations.

## InteractiveAdapter interface

---
```solidity
deposit(TokenAmount[] tokenAmounts, bytes data) payable returns (address[])
```

The function is used to deposit tokens to the protocol.
`data` parameter is optional and usage is described in the protocol's adapter NatSpec comments.
The return value is a list of tokens returned by the adapter.

---
```solidity
withdraw(TokenAmount[] tokenAmounts, bytes data) payable returns (address[])
```

The function is used to withdraw tokens from the protocol.
`data` parameter is optional and usage is described in the protocol's adapter NatSpec comments.
The return value is a list of tokens returned by the adapter.
