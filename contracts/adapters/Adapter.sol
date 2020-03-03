pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { ProtocolInfo } from "../Structs.sol";


/**
 * @title Base contract for protocol adapters.
 * @dev getInfo() and getBalance() functions MUST be implemented.
 */
interface Adapter {

    /**
     * @dev MUST return ProtocolInfo struct with protocol info.
     * struct ProtocolInfo {
     *     string name;         // Short protocol name
     *     string description;  // One line description
     *     string protocolType; // "Asset", "Debt", or "Lock"
     *     string iconURL;      // URL with protocol iconURL (200x200)
     *     uint256 version;     // Version number
     * }
     */
    function getInfo() external pure returns (ProtocolInfo memory);

    /**
     * @dev MUST return amount of the given token locked on the protocol by the given user.
     * struct Token {
     *     address tokenAddress; // Address of token contract
     *     string tokenType;     // "ERC20" by default
     *     uint256 value;        // Amount locked on the protocol
     * }
     */
    function getBalance(address token, address user) external view returns (uint256);
}
