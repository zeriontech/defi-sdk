# Protocol Wrappers

This is a project with protocol wrappers that look for assets locked on different protocols.

![](https://github.com/zeriontech/protocol-wrappers/workflows/lint+coverage/badge.svg)

## `contract WrapperRegistry`

Registry holding array of protocol wrappers.

### State variables

```
ProtocolWrapper[] protocolWrappers
address owner
```

### Functions

#### `constructor (ProtocolWrapper[] memory _protocolWrappers) public`
Stores `protocolWrappers` and `owner`.

#### `function balance(address user) external view returns(ProtocolBalance[] memory)`

Iterates over `protocolWrappers` and appends balances.

#### `function removeProtocolWrapper(uint256 index) external onlyOwner`

#### `function addProtocolWrapper(ProtocolWrapper protocolWrapper) external onlyOwner`

## `abstract contract ProtocolWrapper`

Base contract for protocol wrappers. `protocolName()` and `assetAmount(address,address)` functions are required to be implemented.

### State variables

```
address[] public assets;
// optional:
// asset => protocol
// mapping(address => address) public assetProtocol;
// asset => id
// mapping(address => SoloMargin.Token) public assetID;
```
### Functions

#### `constructor(address[] memory _assets) internal`

Stores `_assets`.

#### `function balance(address user) external view returns (ProtocolBalance memory protocolBalance)`

Iterates over `assets` and checks protocol balances using `assetAmount(asset, user)` function.

#### `function assetAmount(address asset, address user) internal view virtual returns(uint256)`

Checks asset balance on the current protocol.

#### `function protocolName() public view virtual returns(string memory)`

Returns protocol name.

#### `function removeAsset(uint256 index) external onlyOwner`

#### `function addAsset(address asset) external onlyOwner`

## `contract DSRWrapper is ProtocolWrapper`

Wrapper for DSR protocol.

### State variables

```
Pot public pot;
```

### Functions

#### `constructor(address[] memory _assets, Pot _pot) public`

Calls `ProtocolWrapper(_assets)`, stores `_pot` address

#### `function assetAmount(address, address user) internal view override returns(uint256)`
Checks user's balance (available after `drip()` function call).

#### `function protocolName() public view override returns(string memory)`

Returns `"DSR/MCD"` string.

#### `function updatePot(Pot _pot) external onlyOwner`

# Dev notes

This project uses Truffle and web3js for all Ethereum interactions and testing.

## Available Functionality

### Run tests

`npm run test`

### Run Solidity code coverage locally

`npm run coverage`

### Run Solidity code coverage in the docker container

`npm run coverage:docker`

### Run Solidity and JS linters

`npm run lint`

### Run all the migrations scripts

`npm run deploy:network`, `network` is `development` or `mainnet`

### Verify contract's code on Etherscan

`truffle run verify ContractName@0xcontractAddress --network mainnet`
