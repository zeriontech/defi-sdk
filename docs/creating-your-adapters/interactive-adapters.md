# Interactive adapters

## Create an interactive adapter

!!! note ""
    The current version of code for interactive adapters is placed in [`interactive-updates`](https://github.com/zeriontech/defi-sdk/tree/interactive-updates){target="_blank"} branch.


To create new token adapter, one has to implement [**InteractiveAdapter**](https://github.com/zeriontech/defi-sdk/blob/interactive-updates/contracts/interactiveAdapters/InteractiveAdapter.sol){target="_blank"} interface. It inherits [**ProtocolAdapter**](https://github.com/zeriontech/defi-sdk/blob/interactive-updates/contracts/adapters/ProtocolAdapter.sol){target="_blank"}, so one has to implement it, too.

**InteractiveAdapters** should implement 2 main functions: `deposit()` and `withdraw()`.

!!! note ""
    **InteractiveAdapters** should not have any storage variables used within deposit and withdraw functions. Use `internal constant` or `immutable constant`.


```solidity
function deposit(TokenAmount[] calldata tokenAmounts, bytes calldata data)
        external
        payable
        override
        returns (address[] memory tokensToBeWithdrawn)
```

`tokenAmounts` — tokens that will be used in the action \(e.g. DAI in case of deposit to Compound\).

!!! note ""
    Add `require()` if length of `tokenAmounts` should be fixed. Use the abbreviation of the contract name to use in `revert()`/`require()` errors \(later referred to as ABBR\_OF\_NAME\).


Usually, `tokenAmounts` are decomposed in `token` and `amount` like that:

```solidity
address token = tokenAmounts[0].token;
uint256 amount = getAbsoluteAmountDeposit(tokenAmounts[0]);
```

!!! note ""
    Use `getAbsoluteAmountDeposit()` in `deposit()` function and `getAbsoluteAmountWithdraw()` in `withdraw()` function.

If tokens are required to be approved, use the following function:

```solidity
ERC20(token).safeApproveMax(APPROVE_RECEIVER, amount, ABBR_OF_NAME);
```

Get additional data \(e.g. user address or the desired derivative address\) required for the interaction from `bytes data` using `abi.decode` like that:

```solidity
address userAddress = abi.decode(data, (address));
```

Interact with the protocol using try-catch syntax:

```solidity
try
    Interface(callee).foo{ value: value }(arg1, arg2)
returns (returntype1, returntype2) {} catch Error(string memory reason) {
    // solhint-disable-previous-line no-empty-blocks
    revert(reason);
} catch {
    revert("ABBR_OF_NAME: deposit fail");
}
```

Fill in `tokensToBeWithdrawn` array. It should consist of tokens returning to the user \(e.g. cDAI in case of deposit to Compound\).

Remove names of unused arguments.

Use `npx prettier ./contracts/**/*.sol --write` to fix linter issues.

Add tests for interactions it `test/` directory, use Uniswap, Weth, and other required adapters.

