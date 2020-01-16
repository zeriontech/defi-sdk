pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;

import { ProtocolWatcher } from "../watchers/ProtocolWatcher.sol";

/**
 * @title Base contract for protocol wrappers.
 * @dev deposit() and withdraw() functions MUST be implemented
 * as well as functions from ProtocolWatcher abstract contract.
 */
abstract contract ProtocolWrapper is ProtocolWatcher {

    /**
     * @dev The function must deposit asset to the protocol.
     * @return MUST return array of assets sent back to the msg.sender.
     */
    function deposit(
        address asset,
        uint256 amount,
        bytes calldata data
    )
        external
        payable
        virtual
        returns (address[] memory);

    /**
     * @dev The function must withdraw asset to the protocol and
     * @return MUST return array of assets sent back to the msg.sender.
     */
    function withdraw(
        address asset,
        uint256 amount,
        bytes calldata data
    )
        external
        payable
        virtual
        returns (address[] memory);
}
