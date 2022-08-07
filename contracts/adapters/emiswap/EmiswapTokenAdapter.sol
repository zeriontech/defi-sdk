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

pragma solidity >=0.7.6;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../../interfaces/ERC20.sol";
import { Component } from "../../shared/Structs.sol";
import { TokenAdapter } from "../TokenAdapter.sol";
import { Helpers } from "../../shared/Helpers.sol";
import { IEmiswap } from "../../interfaces/IEmiswap.sol";

/**
 * @title Token adapter for Emiswap Pool Tokens.
 * @dev Implementation of TokenAdapter abstract contract.
 * @author Eugene Rupakov <eugene.rupakov@emirex.com>
 */
contract EmiswapTokenAdapter is TokenAdapter {
    using Helpers for bytes32;

    /**
     * @return Array of Component structs with underlying tokens rates for the given token.
     * @dev Implementation of TokenAdapter abstract contract function.
     */
    function getComponents(address token) external override returns (Component[] memory) {
        address[] memory tokens = new address[](2);
        tokens[0] = address(IEmiswap(token).tokens(0));
        tokens[1] = address(IEmiswap(token).tokens(1));
        uint256 totalSupply = ERC20(token).totalSupply();

        Component[] memory components = new Component[](2);

        for (uint256 i = 0; i < 2; i++) {
            components[i] = Component({
                token: tokens[i],
                rate: int256((ERC20(tokens[i]).balanceOf(token) * 1e18) / totalSupply)
            });
        }

        return components;
    }

    /**
     * @return Pool name.
     */
    function getName(address token) internal view override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    getUnderlyingSymbol(address(IEmiswap(token).tokens(0))),
                    "/",
                    getUnderlyingSymbol(address(IEmiswap(token).tokens(1))),
                    " Pool"
                )
            );
    }

    function getUnderlyingSymbol(address token) internal view returns (string memory) {
        (, bytes memory returnData) = token.staticcall(
            abi.encodeWithSelector(ERC20(token).symbol.selector)
        );

        if (returnData.length == 32) {
            return abi.decode(returnData, (bytes32)).toString();
        } else {
            return abi.decode(returnData, (string));
        }
    }
}
