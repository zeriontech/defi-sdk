pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;

import { Component } from "../Structs.sol";


/**
 * @title Base contract for protocol watchers.
 * @dev protocolName(), balanceOf(), and exchangeRate() functions MUST be implemented.
 */
abstract contract ProtocolWatcher {

    /**
     * @dev MUST return name of the protocol.
     */
    function protocolName() external pure virtual returns (string memory);

    /**
     * @dev MUST return amount of the given asset locked on the protocol by the given user.
     */
    function balanceOf(address asset, address user) external view virtual returns (uint256);

    /**
     * @dev MUST return struct with underlying assets rates for the given asset.
     */
    function exchangeRate(address asset) external view virtual returns (Component[] memory);
}
