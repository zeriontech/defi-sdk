pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Component } from "../Structs.sol";


/**
 * @title Base contract for protocol adapters.
 * @dev getProtocolName(), getAssetAmount(), and getUnderlyingRates() functions MUST be implemented.
 */
interface Adapter {

    /**
     * @dev MUST return name of the protocol.
     */
    function getProtocolName() external pure returns (string memory);

    /**
     * @dev MUST return amount of the given asset locked on the protocol by the given user.
     */
    function getAssetAmount(address asset, address user) external view returns (int256);

    /**
     * @dev MUST return struct with underlying assets rates for the given asset.
     */
    function getUnderlyingRates(address asset) external view returns (Component[] memory);
}
