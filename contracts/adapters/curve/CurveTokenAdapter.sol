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

pragma solidity 0.7.1;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../shared/ERC20.sol";
import { Component } from "../../shared/Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";
import { CurveRegistry, PoolInfo } from "./CurveRegistry.sol";

/**
 * @dev stableswap contract interface.
 * Only the functions required for CurveTokenAdapter contract are added.
 * The stableswap contract is available here
 * github.com/curvefi/curve-contract/blob/compounded/vyper/stableswap.vy.
 */
// solhint-disable-next-line contract-name-camelcase
interface stableswap {
    function coins(int128) external view returns (address);
    function balances(int128) external view returns (uint256);
}


/**
 * @title Token adapter for Curve Pool Tokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CurveTokenAdapter is TokenAdapter {

    address internal constant REGISTRY = 0x86A1755BA805ecc8B0608d56c22716bd1d4B68A8;

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        PoolInfo memory poolInfo = CurveRegistry(REGISTRY).getPoolInfo(token);
        address swap = poolInfo.swap;
        uint256 totalCoins = poolInfo.totalCoins;

        Component[] memory components = new Component[](totalCoins);

        for (uint256 i = 0; i < totalCoins; i++) {
            components[i] = Component({
                token: stableswap(swap).coins(int128(i)),
                rate: stableswap(swap).balances(int128(i)) * 1e18 / ERC20(token).totalSupply()
            });
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
