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
import { CurveRegistry, PoolInfo } from "./CurveRegistry.sol";
import { Stableswap } from "../../interfaces/Stableswap.sol";

/**
 * @title Token adapter for Curve Pool Tokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CurveTokenAdapter is TokenAdapter {
    address internal constant REGISTRY = 0x3fb5Cd4b0603C3D5828D3b5658B10C9CB81aa922;

    address internal constant THREE_CRV = 0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490;
    address internal constant HBTC_CRV = 0xb19059ebb43466C323583928285a49f558E572Fd;

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        PoolInfo memory poolInfo = CurveRegistry(REGISTRY).getPoolInfo(token);
        address swap = poolInfo.swap;
        uint256 totalCoins = poolInfo.totalCoins;

        Component[] memory components = new Component[](totalCoins);

        if (token == THREE_CRV || token == HBTC_CRV) {
            for (uint256 i = 0; i < totalCoins; i++) {
                components[i] = Component({
                    token: Stableswap(swap).coins(i),
                    rate: int256(
                        (Stableswap(swap).balances(i) * 1e18) / ERC20(token).totalSupply()
                    )
                });
            }
        } else {
            for (uint256 i = 0; i < totalCoins; i++) {
                components[i] = Component({
                    token: Stableswap(swap).coins(int128(i)),
                    rate: int256(
                        (Stableswap(swap).balances(int128(i)) * 1e18) / ERC20(token).totalSupply()
                    )
                });
            }
        }

        return components;
    }

    /**
     * @return Pool name.
     */
    function getName(address token) internal view override returns (string memory) {
        return CurveRegistry(REGISTRY).getPoolInfo(token).name;
    }
}
