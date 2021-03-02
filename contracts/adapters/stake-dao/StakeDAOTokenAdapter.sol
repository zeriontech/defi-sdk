// SPDX-License-Identifier: None

pragma solidity 0.6.5;
pragma experimental ABIEncoderV2;

import {ERC20} from "../../ERC20.sol";
import {TokenMetadata, Component} from "../../Structs.sol";
import {TokenAdapter} from "../TokenAdapter.sol";

interface Vault {
    function token() external view returns (address);

    function getPricePerFullShare() external view returns (uint256);
}

/**
 * @title Token adapter for Stake DAO Vaults.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Elephant memory/strength
 */
contract StakeDaoTokenAdapter is TokenAdapter {
    address public sdveCrv = 0x478bBC744811eE8310B461514BDc29D03739084D;

    function setSdveCrv(address newSdveCrv) external {
        sdveCrv = newSdveCrv;
    }

    /**
     * @return TokenMetadata struct with ERC20-style token info.
     * @dev Implementation of TokenAdapter interface function.
     */
    function getMetadata(address token)
        external
        view
        override
        returns (TokenMetadata memory)
    {
        return
            TokenMetadata({
                token: token,
                name: ERC20(token).name(),
                symbol: ERC20(token).symbol(),
                decimals: ERC20(token).decimals()
            });
    }

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token)
        external
        view
        override
        returns (Component[] memory)
    {
        Component[] memory components = new Component[](1);

        if (token == sdveCrv) {
            components[0] = Component({
                token: sdveCrv,
                tokenType: "ERC20",
                rate: 1e18
            });
        } else {
            components[0] = Component({
                token: Vault(token).token(),
                tokenType: "ERC20",
                rate: Vault(token).getPricePerFullShare()
            });
        }

        return components;
    }
}
