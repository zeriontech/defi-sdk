# Router contract

!!! note ""
   Router contract is maintained in [`router`](https://github.com/zeriontech/defi-sdk/tree/router){target="_blank"} branch of defi-sdk repo.

## Main features

 - Trade any ERC20 token
 - Two types of amounts: absolute (usual amount) and relative (percentage of balance)
 - Three types of `permit()` functions for approving tokens in the same transaction (EIP2612, DAI-like, Yearn-like)
 - Two types of swaps: with fixed input amount or fixed output amount
 - Two types of fees:
    - protocol fee managed by the **Router** contract owner with possibility of one-time discounts requiring signature of an address with the special role
    - marketplace fee managed by the transaction creator
 - Relayed transactions requiring just an EIP712 signature of the user

## Usage

We highly recommend using our Transaction Builder [API](https://transactions.zerion.io/docs#/){target="_blank"}.
It automatically uses Router contract on L2 chains.
Using Router contract on Ethereum is not encouraged as it has a huge gas overhead.
