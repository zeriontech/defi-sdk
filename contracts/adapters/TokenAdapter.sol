pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { TokenInfo, Token } from "../Structs.sol";


/**
 * @title Base contract for token adapters.
 * @dev getInfo() and getUnderlyingTokens() functions MUST be implemented.
 */
interface TokenAdapter {

    /**
     * @dev MUST return TokenInfo struct with ERC20-style token info.
     * struct TokenInfo {
     *     address tokenAddress;
     *     string name;
     *     string symbol;
     *     uint8 decimals;
     * }
     */
    function getInfo(address token) external view returns (TokenInfo memory);

    /**
    * @dev MUST return array of Token structs with underlying tokens rates for the given asset.
    * struct Token {
    *     address tokenAddress; // Address of token contract
    *     string tokenType;     // "ERC20" by default
    *     uint256 value;        // Exchange rate
    * }
    */
    function getUnderlyingTokens(address token) external view returns (Token[] memory);
}
