pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;

import { Component } from "../Structs.sol";
import "../watchers/ProtocolWatcher.sol";


contract MockWatcher is ProtocolWatcher {

    mapping (address => uint256) internal balances;

    constructor() public {
        balances[msg.sender] = 1000;
    }

    function protocolName() external pure override returns(string memory) {
        return("Mock");
    }

    function balanceOf(address, address user) external view override returns(uint256) {
        return balances[user];
    }

    function exchangeRate(address) external view override returns (Component[] memory) {
        Component[] memory components = new Component[](1);
        components[0] = Component({
            underlying: address(this),
            rate: uint256(1)
            });
        return components;
    }

    /**
     * @dev this function is here as this contract is mock for both watcher and asset
     */
    function decimals() external pure returns(uint256) {
        return 18;
    }
}
