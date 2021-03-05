// SPDX-License-Identifier: None

pragma solidity 0.6.5;
pragma experimental ABIEncoderV2;

import {ERC20} from "../../ERC20.sol";
import {ProtocolAdapter} from "../ProtocolAdapter.sol";

/**
 * @title Adapter for Yearn Token Vaults.
 * @dev Implementation of ProtocolAdapter interface.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract StakeDAOVaultAdapter is ProtocolAdapter {
    string public constant override adapterType = "Asset";

    string public constant override tokenType = "Stake DAO Vault";

    /**
     * @return Amount of Stake DAO Vault Tokens owned by the given account.
     * @param token Address of the vault token.
     * @dev Implementation of ProtocolAdapter interface function.
     */
    function getBalance(address token, address account)
        external
        view
        override
        returns (uint256)
    {
        return ERC20(token).balanceOf(account);
    }
}
