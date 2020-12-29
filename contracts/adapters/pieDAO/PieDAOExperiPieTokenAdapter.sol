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

pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../interfaces/ERC20.sol";
import { Component } from "../../shared/Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";
import { ExperiPie } from "../../interfaces/ExperiPie.sol";

/**
 * @title Token adapter for Pie pool tokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Mick de Graaf <mick@dexlab.io>
 */
contract PieDAOExperiPieTokenAdapter is TokenAdapter {
    /**
     * @return Array of Component structs with underlying tokens rates for the given asset.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        address[] memory tokens = ExperiPie(token).getTokens();

        uint256 totalSupply = ERC20(token).totalSupply();

        Component[] memory components = new Component[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            components[i] = Component({
                token: tokens[i],
                rate: int256((ExperiPie(token).balance(tokens[i]) * 1e18) / totalSupply)
            });
        }

        return components;
    }
}
