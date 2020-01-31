pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "../adapters/Adapter.sol";


/**
 * @title Base contract for interactive protocol adapters.
 * @dev deposit() and withdraw() functions MUST be implemented
 * as well as all the functions from Adapter abstract contract.
 */
interface InteractiveAdapter is Adapter {

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
