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

import { Ownable } from "./Ownable.sol";
import { TokenAdapter } from "../adapters/TokenAdapter.sol";


/**
 * @title TokenAdapterRegistry part responsible for contracts' hashes management.
 * @dev Base contract for TokenAdapterRegistry.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract TokenAdapterNamesManager is Ownable {

    // Contract's hash => token adapter's name
    mapping (bytes32 => bytes32) internal _tokenAdapterName;

    /**
     * @notice Adds token adapters' names by tokens.
     * The function is callable only by the owner.
     * @param newTokens Array of new tokens.
     * @param newTokenAdapterNames Array of new token adapters' names.
     */
    function addTokenAdapterNames(
        address[] calldata newTokens,
        bytes32[] calldata newTokenAdapterNames
    )
        external
        onlyOwner
    {
        uint256 length = newTokens.length;
        require(length != 0, "TANM: empty[1]");
        require(length == newTokenAdapterNames.length, "TANM: lengths differ[1]");

        for (uint256 i = 0; i < length; i++) {
            require(newTokens[i] != address(0), "TANM: zero[1]");
            addTokenAdapterName(getTokenHash(newTokens[i]), newTokenAdapterNames[i]);
        }
    }

    /**
     * @notice Removes token adapters' names by tokens.
     * The function is callable only by the owner.
     * @param tokens Array of tokens.
     */
    function removeTokenAdapterNames(
        address[] calldata tokens
    )
        external
        onlyOwner
    {
        uint256 length = tokens.length;
        require(length != 0, "TANM: empty[2]");

        for (uint256 i = 0; i < length; i++) {
            removeTokenAdapterName(getTokenHash(tokens[i]));
        }
    }

    /**
     * @notice Updates token adapters' names by tokens.
     * The function is callable only by the owner.
     * @param tokens Array of tokens.
     * @param newTokenAdapterNames Array of the new token adapters' names.
     */
    function updateTokenAdapterNames(
        address[] calldata tokens,
        bytes32[] calldata newTokenAdapterNames
    )
        external
        onlyOwner
    {
        uint256 length = tokens.length;
        require(length != 0, "TANM: empty[3]");
        require(length == newTokenAdapterNames.length, "TANM: lengths differ[2]");

        for (uint256 i = 0; i < length; i++) {
            updateTokenAdapterName(getTokenHash(tokens[i]), newTokenAdapterNames[i]);
        }
    }

    /**
     * @param token Address of token.
     * @return Name of token adapter.
     */
    function getTokenAdapterName(
        address token
    )
        public
        view
        returns (bytes32)
    {
        return _tokenAdapterName[getTokenHash(token)];
    }

    function getTokenHash(
        address token
    )
        public
        view
        returns (bytes32)
    {
        bytes32 hash;

        // solhint-disable-next-line no-inline-assembly
        assembly {
            hash := extcodehash(token)
        }

        return hash;
    }

    /**
     * @notice Adds a token adapters' name by hash.
     * @param newHash New hash.
     * @param newTokenAdapterName New token adapter's name.
     */
    function addTokenAdapterName(
        bytes32 newHash,
        bytes32 newTokenAdapterName
    )
        internal
    {
        require(newTokenAdapterName != bytes32(0), "TANM: zero[2]");
        require(_tokenAdapterName[newHash] == bytes32(0), "TANM: exists");

        _tokenAdapterName[newHash] = newTokenAdapterName;
    }

    /**
     * @notice Removes a token adapters' name by hash.
     * @param hash Hash.
     */
    function removeTokenAdapterName(
        bytes32 hash
    )
        internal
    {
        require(_tokenAdapterName[hash] != bytes32(0), "TANM: does not exist[1]");

        delete _tokenAdapterName[hash];
    }

    /**
     * @notice Updates a token adapters' name by hash.
     * @param hash Hash.
     * @param newTokenAdapterName New token adapter's name.
     */
    function updateTokenAdapterName(
        bytes32 hash,
        bytes32 newTokenAdapterName
    )
        internal
    {
        bytes32 oldTokenAdapterName = _tokenAdapterName[hash];
        require(oldTokenAdapterName != bytes32(0), "TANM: does not exist[2]");
        require(newTokenAdapterName != bytes32(0), "TANM: zero[3]");
        require(oldTokenAdapterName != newTokenAdapterName, "TANM: same name[1]");

        _tokenAdapterName[hash] = newTokenAdapterName;
    }
}
