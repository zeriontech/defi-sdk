pragma solidity 0.6.3;
pragma experimental ABIEncoderV2;

import { ProtocolAdapter } from "../ProtocolAdapter.sol";
import { ERC20 } from "../../ERC20.sol";


/**
 * @title Asset adapter for Aave protocol.
 * @dev Implementation of ProtocolAdapter interface.
 */
contract AaveAssetAdapter is ProtocolAdapter {

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
        return "AToken";
    }

    /**
     * @return Amount of ATokens held by the given account.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account) external view override returns (uint256) {
        return ERC20(token).balanceOf(account);
    }
}
