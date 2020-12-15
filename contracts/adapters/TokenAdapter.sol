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

import { ERC20 } from "../interfaces/ERC20.sol";
import { ERC20Metadata, Component } from "../shared/Structs.sol";

/**
 * @title Token adapter abstract contract.
 * @dev getComponents() function MUST be implemented.
 * getName(), getSymbol(), getDecimals() functions
 * or getMetadata() function may be overridden.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract TokenAdapter {
    /**
     * @dev MUST return array of Component structs with underlying tokens rates for the given token.
     * struct Component {
     *     address token;    // Address of token contract
     *     uint256 rate;     // Price per share (1e18)
     * }
     */
    function getComponents(address token) external virtual returns (Component[] memory);

    /**
     * @return ERC20Metadata struct with ERC20-style token info.
     * @dev It is recommended to override getName(), getSymbol(), and getDecimals() functions.
     * struct ERC20Metadata {
     *     string name;
     *     string symbol;
     *     uint8 decimals;
     * }
     */
    function getMetadata(address token) public view virtual returns (ERC20Metadata memory) {
        return
            ERC20Metadata({
                name: getName(token),
                symbol: getSymbol(token),
                decimals: getDecimals(token)
            });
    }

    /**
     * @return String that will be treated like token name.
     */
    function getName(address token) internal view virtual returns (string memory) {
        return ERC20(token).name();
    }

    /**
     * @return String that will be treated like token symbol.
     */
    function getSymbol(address token) internal view virtual returns (string memory) {
        return ERC20(token).symbol();
    }

    /**
     * @return Number (of uint8 type) that will be treated like token decimals.
     */
    function getDecimals(address token) internal view virtual returns (uint8) {
        return ERC20(token).decimals();
    }
}
