  - [Logic](#logic)
  - [TokenSpender](#tokenspender)
  - [interactiveAdapters/InteractiveAdapter (interface)](#interactiveadapter-is-adapter-interface)
  - [Use-cases for Logic contract](#use-cases-for-logic-contract)
    * [Swap cDAI to DSR (Chai)](#swap-cdai-to-dsr-chai)

## Logic
0. (optional) Verifies the supplied signature and extracts the address of spender from it.
1. Iterates over array of actions, checks adapter in AdapterRegistry, and delegatecalls corresponding InteractiveAdapter with assets, amounts, and additional data as arguments (deposit, or withdraw).
2. Returns all the resulting tokens back to the user.
```javascript
function executeActions(Action[] actions) external payable
function executeActions(Action[] actions, Approval[] approvals, bytes signature) external payable
```


## TokenSpender

Sends all the assets under the request of Logic contract. Adds all the transferred assets to the list of withdrawable/toBeWithdrawn/resulting tokens.

```javascript
function transferApprovedAssets(Approval[] approvals) external returns (address[])
```

## InteractiveAdapter is [Adapter](#Adapter-interface) (interface)

Interface for protocol wrappers.
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
