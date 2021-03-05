// Copyright (C) 2020 Zerion Inc. <https://zerion.io>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.
//
// SPDX-License-Identifier: LGPL-3.0-only

pragma solidity 0.6.5;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../ERC20.sol";
import { TokenMetadata, Component } from "../../Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";

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
    address internal constant SD_VECRV = 0x478bBC744811eE8310B461514BDc29D03739084D;
    address internal constant CRV = 0xD533a949740bb3306d119CC777fa900bA034cd52;

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

        if (token == SD_VECRV) {
            components[0] = Component({
                token: CRV,
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
