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

pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import { TokenAdapter } from "../TokenAdapter.sol";
import { Component } from "../../shared/Structs.sol";
import { IClusterToken } from "../../interfaces/IClusterToken.sol";

/**
 * @title Token adapter for ClusterTokens.
 * @dev Implementation of TokenAdapter abstract contract.
 */
contract ClusterTokenAdapter is TokenAdapter {
    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     * @param token Cluster address
     */
    function getComponents(address token) external override view returns (Component[] memory) {
        address[] memory underlyings = IClusterToken(token).getUnderlyings();
        uint256[] memory underlyingsShares = IClusterToken(token).getUnderlyingInCluster();

        Component[] memory components = new Component[](underlyings.length);
        for(uint256 i = 0; i < underlyings.length; i++) {
            components[i] = Component({
                token: underlyings[i],
                rate: int256(underlyingsShares[i] * 1e18 / 1e6)
            });
        }

        return components;
    }
}
