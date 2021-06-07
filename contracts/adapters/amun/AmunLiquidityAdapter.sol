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

import { ERC20 } from "../../shared/ERC20.sol";
import { Component } from "../../shared/Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";
import { IVault } from "../../interfaces/IVault.sol";

/**
 * @title Token adapter for amun liquidity tokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Timo Hedke <timo@amun.com>
 */
contract AmunLiquidityAdapter is TokenAdapter {
    /**
     * @return Array of Component structs with underlying tokens rates for the given asset.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external override returns (Component[] memory) {
        Component[] memory components = new Component[](1);

        components[0] = Component({
            token: IVault(token).underlying(),
            rate: int256(IVault(token).getPricePerFullShare())
        });

        return components;
    }
}
