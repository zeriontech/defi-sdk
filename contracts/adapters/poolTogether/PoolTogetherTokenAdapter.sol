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
import { BasePool } from "../../interfaces/BasePool.sol";

/**
 * @title Token adapter for PoolTogether pools.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract PoolTogetherTokenAdapter is TokenAdapter {
    address internal constant SAI_POOL = 0xb7896fce748396EcFC240F5a0d3Cc92ca42D7d84;

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        Component[] memory components = new Component[](1);

        components[0] = Component({ token: BasePool(token).token(), rate: int256(1e18) });

        return components;
    }

    /**
     * @return Pool name.
     */
    function getName(address token) internal view override returns (string memory) {
        if (token == SAI_POOL) {
            return "SAI Pool";
        } else {
            address underlying = BasePool(token).token();
            return string(abi.encodePacked(ERC20(underlying).symbol(), " Pool"));
        }
    }

    /**
     * @return Pool symbol.
     */
    function getSymbol(address) internal pure override returns (string memory) {
        return "PLT";
    }

    /**
     * @return Pool decimals.
     */
    function getDecimals(address token) internal view override returns (uint8) {
        return ERC20(BasePool(token).token()).decimals();
    }
}
