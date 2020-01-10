# Zerion Smart Contracts

This is a project with Zerion Smart Contracts interacting with different DeFi protocols.

![](https://github.com/zeriontech/protocol-wrappers/workflows/lint+coverage/badge.svg)


## TokenSpender

Verifies the supplied signature and extracts the address of spender from it. Sends all the assets to the logic layer. Adds all the transferred assets to the list of withdrawable/toBeWithdrawn/resulting tokens.

```
function transferApprovedAssets(Approval[] approvals, Action[] actions, bytes signature) external payable;

struct Approval {
    address asset;
    uint256 amount;
}

struct Action {
    ActionType actionType;
    ProtocolWrapper protocolWrapper;
    address asset;
    Amount amount;
    bytes data;
}

// Amount is whether absolute or relative
// relative amount value is a fraction numerator with denominator 1000/100/10
struct Amount {
    AmountType amountType;
    uint256 value;
}

enum ActionType { None, Deposit, Withdraw }

enum AmountType { None, Absolute, Relative }
```

## Logic

1. Iterates over array of actions, checks whitelist, and calls corresponding ProtocolWrappers with asset, amount, and additional data as arguments (deposit, or withdraw).
2. Finalization (returns all resulting tokens back to the user).

```
function executeActions(Action[] actions) external payable;
```

## ProtocolWrapper (abstract contract) (is ProtocolWatcher or is AssetManager)

### Functions

#### `deposit(address, uint256, bytes memory) external payable virtual (returns (address));`

Deposits assets to the lending/borrow/swap/liquidity, returns address of the asset sent back to the `msg.sender`.

#### `withdraw(address, uint256, bytes memory) external payable virtual (returns (address));`

Withdraws assets from the lending/borrow/swap/liquidity, returns address of the asset sent back to the `msg.sender`.

## ProtocolWatcher (abstract contract) is AssetManager

###Functions

#### `balanceOf(address, address) public view virtual;`

Returns balance for given user and asset.

#### `balanceOf(user) external view override virtual;`

Returns balance for given user and all the assets supported by the protocol.

## AssetManager

### State variables

```
address public owner;
address[] public assets;
```

### onlyOwner functions

#### `function removeAsset(uint256 index) external onlyOwner`

#### `function addAsset(address asset) external onlyOwner`

#### `function transferOwnership(address _owner) external onlyOwner`

## WatcherRegistry

Registry holding array of protocol watchers and checking balances via these watchers.

### State variables

```
ProtocolWatcher[] protocolWatchers
address owner
```

### Functions

#### `constructor (ProtocolWatcher[] memory _protocolWrappers) public`

Stores `protocolWatchers` and `owner`.

#### `function balance(address user) external view returns(ProtocolBalance[] memory)`

Iterates over `protocolWatchers` and appends balances.

### onlyOwner functions

#### `function removeProtocolWrapper(uint256 index) external onlyOwner`

#### `function addProtocolWrapper(ProtocolWatcher protocolWatcher) external onlyOwner`

## DSRWatcher

Watcher for DSR protocol. There will be only watcher as DSR protocol is not tokenized.

### State variables

```
Pot public pot;
```

### Functions

#### `constructor(address[] memory _assets, Pot _pot) public`

Calls `ProtocolWatcher(_assets)`, stores `_pot` address

#### `function assetAmount(address, address user) internal view override returns(uint256)`

Checks user's balance (available after `drip()` function call).

#### `function protocolName() public view override returns(string memory)`

Returns `"DSR/MCD"` string.

## Use-cases

### Swap cDAI to DSR (Chai)

There will be the following actions array sent to the Logic layer:

```
[
    {
        actionType: ActionType.Withdraw,
        protocolWatcher: <address of cDAI wrapper>,
        asset: 0x5d3a536e4d6dbd6114cc1ead35777bab948e3643,
        amount: Amount({
            amountType: AmountType.Relative,
            value: RELATIVE_AMOUNT_BASE
        }),
        data: ""
    },
    {
        actionType: ActionType.Deposit,
        protocolWatcher: <address of chai wrapper>,
        asset: 0x5d3a536e4d6dbd6114cc1ead35777bab948e3643,
        amount: Amount({
            amountType: AmountType.Relative,
            value: RELATIVE_AMOUNT_BASE
        }),
        data: ""
    }
]
```

Logic layer should do the following:

1. Call redeem function with balanceOf(address(this)) argument.
2. Approve DAI to Chai contract.
3. Call join function with address(this) and balanceOf(address(this)) arguments.
4. Add Chai token to the list of withdrawable/toBeWithdrawn/resulting tokens.

# Dev notes

This project uses Truffle and web3js for all Ethereum interactions and testing.

## Adding new protocol wrappers

To add new protocol wrapper, you have to inherit from  `ProtocolWrapper` contract. Then, using additional storage variables and internal functions implement `deposit()` and `withdraw()` functions. Both functions MUST return address of the asset sent beck to the `msg.sender`.

If wrapper should also track balances, you have to inherit from  `ProtocolWatcher` contract as well. `protocolName()` and `balanceOf(address,address)` functions MUST be implemented.

`balanceOf(address,address)` function has two arguments of `address` type: the first one is asset address and the second one is user address. The function MUST return amount of given asset held on the protocol for given user.

`protocolName()` function has no arguments and MUST return the name of protocol.

## Available Functionality

### Run tests

`npm run test`

### Run Solidity code coverage locally

`npm run coverage`

### Run Solidity and JS linters

`npm run lint`

### Run all the migrations scripts

`npm run deploy:network`, `network` is `development` or `mainnet`

### Verify contract's code on Etherscan

`truffle run verify ContractName@0xcontractAddress --network mainnet`
