pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import { TokenMetadata, Component } from "../Structs.sol";


/**
 * @title Base contract for token adapters.
 * @dev getMetadata() and getComponents() functions MUST be implemented.
 */
interface TokenAdapter {

    /**
     * @dev MUST return TokenMetadata struct with ERC20-style token info.
     * struct TokenMetadata {
     *     address token;
     *     string name;
     *     string symbol;
     *     uint8 decimals;
     * }
     */
    function getMetadata(address token) external view returns (TokenMetadata memory);

    /**
    * @dev MUST return array of Component structs with underlying tokens rates for the given token.
    * struct Component {
    *     address token; // Address of token contract
    *     string tokenType;     // Token type ("ERC20" by default)
    *     uint256 rate;        // Price per share (1e18)
    * }
    */
    function getComponents(address token) external view returns (Component[] memory);
}
