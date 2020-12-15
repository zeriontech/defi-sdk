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
import { Helpers } from "../../shared/Helpers.sol";
import { BPool } from "../../interfaces/BPool.sol";

/**
 * @title Token adapter for Balancer Pool Tokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract BalancerTokenAdapter is TokenAdapter {
    using Helpers for bytes32;
    using Helpers for uint256;

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external view override returns (Component[] memory) {
        address[] memory currentTokens;
        currentTokens = BPool(token).getCurrentTokens();

        uint256 totalSupply = ERC20(token).totalSupply();

        Component[] memory components = new Component[](currentTokens.length);
        if (totalSupply == 0) {
            for (uint256 i = 0; i < components.length; i++) {
                components[i] = Component({ token: currentTokens[i], rate: int256(0) });
            }
        } else {
            for (uint256 i = 0; i < components.length; i++) {
                components[i] = Component({
                    token: currentTokens[i],
                    rate: int256(
                        ((BPool(token).getBalance(currentTokens[i])) * 1e18) / totalSupply
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
        address[] memory currentTokens;
        try BPool(token).getCurrentTokens() returns (address[] memory result) {
            currentTokens = result;
        } catch {
            return "Unknown Pool";
        }

        string memory poolName = "";
        uint256 lastIndex = currentTokens.length - 1;
        for (uint256 i = 0; i < currentTokens.length; i++) {
            poolName = string(
                abi.encodePacked(
                    poolName,
                    getPoolElement(token, currentTokens[i]),
                    i == lastIndex ? " Pool" : " + "
                )
            );
        }

        return poolName;
    }

    function getPoolElement(address pool, address token) internal view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    (BPool(pool).getNormalizedWeight(token) / 1e16).toString(),
                    "% ",
                    getUnderlyingSymbol(token)
                )
            );
    }

    function getUnderlyingSymbol(address token) internal view returns (string memory) {
        (, bytes memory returnData) =
            token.staticcall(abi.encodeWithSelector(ERC20(token).symbol.selector));

        if (returnData.length == 32) {
            return abi.decode(returnData, (bytes32)).toString();
        } else {
            return abi.decode(returnData, (string));
        }
    }
}
