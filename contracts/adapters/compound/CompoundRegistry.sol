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

import { Ownable } from "../../core/Ownable.sol";

/**
 * @title Registry for Compound contracts.
 * @dev Implements the only function - getCToken(address).
 * @notice Call getCToken(token) function and get address
 * of CToken contract for the given token address.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CompoundRegistry is Ownable {
    mapping(address => address) internal cToken_;

    function setCTokens(address[] calldata tokens, address[] calldata cTokens) external {
        uint256 length = tokens.length;
        require(cTokens.length == length, "CR: inconsistent arrays");

        for (uint256 i = 0; i < length; i++) {
            setCToken(tokens[i], cTokens[i]);
        }
    }

    function getCToken(address token) external view returns (address) {
        return cToken_[token];
    }

    function setCToken(address token, address cToken) internal {
        cToken_[token] = cToken;
    }
}
