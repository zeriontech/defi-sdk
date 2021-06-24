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

pragma solidity 0.6.5;

import { Ownable } from "../../Ownable.sol";


/**
 * @title Registry for Cozy CTokens.
 * @dev Implements the only function - getCToken(address).
 * @notice Call getCToken(token) function and get address
 * of CToken contract for the given token address.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
contract CozyRegistry is Ownable {
    mapping(address => address) internal tokenToCToken;

    event CTokenSet(address indexed token, address indexed cToken);

    constructor(address[] memory tokens, address[] memory cTokens) public {
        setCTokensInternal(tokens, cTokens);
    }

    function setCTokens(address[] calldata tokens, address[] calldata cTokens) external onlyOwner {
        setCTokensInternal(tokens, cTokens);
    }

    function getCToken(address token) external view returns (address) {
        return tokenToCToken[token];
    }

    function setCTokensInternal(address[] memory tokens, address[] memory cTokens) internal {
        uint256 length = tokens.length;
        require(length == cTokens.length, "CR: lengths differ!");

        for (uint256 i = 0; i < length; i++) {
            setCToken(tokens[i], cTokens[i]);
        }
    }

    function setCToken(address token, address cToken) internal {
        tokenToCToken[token] = cToken;

        emit CTokenSet(token, cToken);
    }
}
