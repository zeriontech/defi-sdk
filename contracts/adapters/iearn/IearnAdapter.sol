pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @title Adapter for iearn.finance protocol.
 * @dev Implementation of Adapter interface.
 */
contract IearnAdapter is ProtocolAdapter {

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
        return "YToken";
    }

    /**
     * @return Amount of YTokens held by the given account.
     * @dev Implementation of Adapter function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        return ERC20(token).balanceOf(account);
    }
}
