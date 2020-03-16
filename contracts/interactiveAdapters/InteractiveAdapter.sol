pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../adapters/ProtocolAdapter.sol";


/**
 * @title Base contract for interactive protocol adapters.
 * @dev deposit() and withdraw() functions MUST be implemented
 * as well as all the functions from Adapter interface.
 */
interface InteractiveAdapter is ProtocolAdapter {

    /**
     * @dev The function must deposit assets to the protocol.
     * @return MUST return assets to be sent back to the `msg.sender`.
     */
    function deposit(
        address[] calldata assets,
        uint256[] calldata amounts,
        bytes calldata data
    )
        external
        payable
        returns (address[] memory);

    /**
     * @dev The function must withdraw assets from the protocol.
     * @return MUST return assets to be sent back to the `msg.sender`.
     */
    function withdraw(
        address[] calldata assets,
        uint256[] calldata amounts,
        bytes calldata data
    )
        external
        payable
        returns (address[] memory);
}
