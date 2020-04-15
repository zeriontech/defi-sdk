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

pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import { ERC20 } from "../ERC20.sol";
import { TokenMetadata, Component } from "../Structs.sol";


/**
 * @title Token adapter interface.
 * @dev getMetadata() and getComponents() functions MUST be implemented.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract TokenAdapter {

    /**
     * @dev MUST return TokenMetadata struct with ERC20-style token info.
     * It is recommended to override getName(), getSymbol() and getDecimals() functions.
     * struct TokenMetadata {
     *     address token;
     *     string name;
     *     string symbol;
     *     uint8 decimals;
     * }
     */
    function getMetadata(address token) public view virtual returns (TokenMetadata memory) {
        return TokenMetadata({
            token: token,
            name: getName(token),
            symbol: getSymbol(token),
            decimals: getDecimals(token)
        });
    }

    /**
     * @dev MUST return array of Component structs with underlying tokens rates for the given token.
     * struct Component {
     *     address token;    // Address of token contract
     *     string tokenType; // Token type ("ERC20" by default)
     *     uint256 rate;     // Price per share (1e18)
     * }
     */
    function getComponents(address token) external view virtual returns (Component[] memory);

    /**
     * @dev MUST return string that will be treated like token name.
     */
    function getName(address token) internal view virtual returns (string memory) {
        return ERC20(token).name();
    }

    /**
     * @dev MUST return string that will be treated like token symbol.
     */
    function getSymbol(address token) internal view virtual returns (string memory) {
        return ERC20(token).symbol();
    }

    /**
     * @dev MUST return uint8 that will be treated like token decimals.
     */
    function getDecimals(address token) internal view virtual returns (uint8) {
        return ERC20(token).decimals();
    }
}
