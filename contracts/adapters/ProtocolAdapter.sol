pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;


/**
 * @title Base contract for protocol adapters.
 * @dev adapterType(), tokenType(), and getBalance() functions MUST be implemented.
 */
interface ProtocolAdapter {

    /**
     * @notice MUST return "Asset" or "Debt".
     */
    function adapterType() external pure returns (string memory);

    /**
     * @notice MUST return token type (default is "ERC20").
     */
    function tokenType() external pure returns (string memory);

    /**
     * @dev MUST return amount of the given token locked on the protocol by the given account.
     */
    function getBalance(address token, address account) external view returns (uint256);
}
