pragma solidity 0.6.3;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @dev Staking contract interface.
 * Only the functions required for ZrxAdapter contract are added.
 * The Staking contract is available here
 * github.com/0xProject/0x-monorepo/blob/development/contracts/staking/contracts/src/Staking.sol.
 */
interface Staking {
    function getTotalStake(address) external view returns (uint256);
}


/**
 * @title Adapter for 0x protocol.
 * @dev Implementation of ProtocolAdapter interface.
 */
contract ZrxAdapter is ProtocolAdapter {

    address internal constant STAKING = 0xa26e80e7Dea86279c6d778D702Cc413E6CFfA777;

    /**
     * @return Type of the adapter.
     */
    function adapterType() external pure override returns (string memory) {
        return "Asset";
    }

    /**
     * @return Type of the token used in adapter.
     */
    function tokenType() external pure override returns (string memory) {
        return "ERC20";
    }

    /**
     * @return Amount of ZRX locked on the protocol by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address, address account) external view override returns (uint256) {
        return Staking(STAKING).getTotalStake(account);
    }
}
