pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Component } from "../Structs.sol";
import "../adapters/Adapter.sol";


contract MockAdapter is Adapter {

    mapping (address => int128) internal balances;

    constructor() public {
        balances[msg.sender] = 1000;
    }

    function getProtocolName() external pure override returns(string memory) {
        return("Mock");
    }

    function getAssetAmount(address, address user) external view override returns(int128) {
        return balances[user];
    }

    function getUnderlyingRates(address) external view override returns (Component[] memory) {
        Component[] memory components = new Component[](1);
        components[0] = Component({
            underlying: address(this),
            rate: uint256(1e18)
            });
        return components;
    }

    /**
     * @dev this function is here as this contract is mock for both adapter and asset
     */
    function decimals() external pure returns(uint256) {
        return 18;
    }
}
