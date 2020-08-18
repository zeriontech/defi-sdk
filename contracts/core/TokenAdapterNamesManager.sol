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

pragma solidity 0.6.11;
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
    mapping (bytes32 => bytes32) internal _tokenAdapterNameByHash;
    // Contract's address => token adapter's name
    mapping (address => bytes32) internal _tokenAdapterNameByToken;

    /**
     * @notice Adds token adapters' names by hashes.
     * The function is callable only by the owner.
     * @param newHashes Array of new hashes.
     * @param newTokenAdapterNames Array of new token adapters' names.
     */
    function addTokenAdapterNamesByHashes(
        bytes32[] calldata newHashes,
        bytes32[] calldata newTokenAdapterNames
    )
        external
        onlyOwner
    {
        uint256 length = newHashes.length;
        require(length != 0, "PM: empty![1]");
        require(length == newTokenAdapterNames.length, "PM: lengths differ![1]");

        for (uint256 i = 0; i < length; i++) {
            addTokenAdapterNameByHash(newHashes[i], newTokenAdapterNames[i]);
        }
    }

    /**
     * @notice Adds token adapters' names by tokens.
     * The function is callable only by the owner.
     * @param newToken Array of new tokens.
     * @param newTokenAdapterNames Array of new token adapters' names.
     */
    function addTokenAdapterNamesByTokens(
        address[] calldata newToken,
        bytes32[] calldata newTokenAdapterNames
    )
        external
        onlyOwner
    {
        uint256 length = newToken.length;
        require(length != 0, "PM: empty![2]");
        require(length == newTokenAdapterNames.length, "PM: lengths differ![2]");

        for (uint256 i = 0; i < length; i++) {
            addTokenAdapterNameByToken(newToken[i], newTokenAdapterNames[i]);
        }
    }

    /**
     * @notice Removes token adapters' names by hashes.
     * The function is callable only by the owner.
     * @param hashes Array of hashes.
     */
    function removeTokenAdapterNamesByHashes(
        bytes32[] calldata hashes
    )
        external
        onlyOwner
    {
        uint256 length = hashes.length;
        require(length != 0, "PM: empty![3]");

        for (uint256 i = 0; i < length; i++) {
            removeTokenAdapterNameByHash(hashes[i]);
        }
    }

    /**
     * @notice Removes token adapters' names by tokens.
     * The function is callable only by the owner.
     * @param tokens Array of tokens.
     */
    function removeTokenAdapterNamesByTokens(
        address[] calldata tokens
    )
        external
        onlyOwner
    {
        uint256 length = tokens.length;
        require(length != 0, "PM: empty![4]");

        for (uint256 i = 0; i < length; i++) {
            removeTokenAdapterNameByToken(tokens[i]);
        }
    }

    /**
     * @notice Updates token adapters' names by hashes.
     * The function is callable only by the owner.
     * @param hashes Array of hashes.
     * @param newTokenAdapterNames Array of the new token adapters' names.
     */
    function updateTokenAdapterNamesByHashes(
        bytes32[] calldata hashes,
        bytes32[] calldata newTokenAdapterNames
    )
        external
        onlyOwner
    {
        uint256 length = hashes.length;
        require(length != 0, "PM: empty![5]");
        require(length == newTokenAdapterNames.length, "PM: lengths differ![3]");

        for (uint256 i = 0; i < length; i++) {
            updateTokenAdapterNameByHash(hashes[i], newTokenAdapterNames[i]);
        }
    }

    /**
     * @notice Updates token adapters' names by tokens.
     * The function is callable only by the owner.
     * @param tokens Array of tokens.
     * @param newTokenAdapterNames Array of the new token adapters' names.
     */
    function updateTokenAdapterNamesByTokens(
        address[] calldata tokens,
        bytes32[] calldata newTokenAdapterNames
    )
        external
        onlyOwner
    {
        uint256 length = tokens.length;
        require(length != 0, "PM: empty![6]");
        require(length == newTokenAdapterNames.length, "PM: lengths differ![4]");

        for (uint256 i = 0; i < length; i++) {
            updateTokenAdapterNameByToken(tokens[i], newTokenAdapterNames[i]);
        }
    }

    /**
     * @param hash Hash of token.
     * @return Name of token adapter.
     */
    function getTokenAdapterNameByHash(
        bytes32 hash
    )
        public
        view
        returns (bytes32)
    {
        return _tokenAdapterNameByHash[hash];
    }

    /**
     * @param token Address of token.
     * @return Name of token adapter.
     */
    function getTokenAdapterNameByToken(
        address token
    )
        public
        view
        returns (bytes32)
    {
        bytes32 tokenAdapterName = _tokenAdapterNameByToken[token];
        if (tokenAdapterName == bytes32(0)) {
            bytes32 hash = getTokenHash(token);
            tokenAdapterName = _tokenAdapterNameByHash[hash];
        }
        return tokenAdapterName;
    }

    /**
     * @notice Adds a token adapters' name by hash.
     * @param newHash New hash.
     * @param newTokenAdapterName New token adapter's name.
     */
    function addTokenAdapterNameByHash(
        bytes32 newHash,
        bytes32 newTokenAdapterName
    )
        internal
    {
        require(newHash != bytes32(0), "PM: zero![1]");
        require(newTokenAdapterName != bytes32(0), "PM: zero![2]");
        require(_tokenAdapterNameByHash[newHash] == bytes32(0), "PM: exists![1]");

        _tokenAdapterNameByHash[newHash] = newTokenAdapterName;
    }

    /**
     * @notice Adds a token adapters' name by token.
     * @param newToken New token.
     * @param newTokenAdapterName New token adapter's name.
     */
    function addTokenAdapterNameByToken(
        address newToken,
        bytes32 newTokenAdapterName
    )
        internal
    {
        require(newToken != address(0), "PM: zero![3]");
        require(newTokenAdapterName != bytes32(0), "PM: zero![4]");
        require(_tokenAdapterNameByToken[newToken] == bytes32(0), "PM: exists![2]");

        _tokenAdapterNameByToken[newToken] = newTokenAdapterName;
    }

    /**
     * @notice Removes a token adapters' name by hash.
     * @param hash Hash.
     */
    function removeTokenAdapterNameByHash(
        bytes32 hash
    )
        internal
    {
        require(_tokenAdapterNameByHash[hash] != bytes32(0), "PM: does not exist![1]");

        delete _tokenAdapterNameByHash[hash];
    }

    /**
     * @notice Removes a token adapters' name by token.
     * @param token Token.
     */
    function removeTokenAdapterNameByToken(
        address token
    )
        internal
    {
        require(_tokenAdapterNameByToken[token] != bytes32(0), "PM: does not exist![2]");

        delete _tokenAdapterNameByToken[token];
    }

    /**
     * @notice Updates a token adapters' name by hash.
     * @param hash Hash.
     * @param newTokenAdapterName New token adapter's name.
     */
    function updateTokenAdapterNameByHash(
        bytes32 hash,
        bytes32 newTokenAdapterName
    )
        internal
    {
        bytes32 oldName = _tokenAdapterNameByHash[hash];
        require(oldName != bytes32(0), "PM: does not exist![3]");
        require(newTokenAdapterName != bytes32(0), "PM: zero![5]");
        require(oldName != newTokenAdapterName, "PM: same name![1]");

        _tokenAdapterNameByHash[hash] = newTokenAdapterName;
    }

    /**
     * @notice Updates a token adapters' name by token.
     * @param token Token.
     * @param newTokenAdapterName New token adapter's name.
     */
    function updateTokenAdapterNameByToken(
        address token,
        bytes32 newTokenAdapterName
    )
        internal
    {
        bytes32 oldName = _tokenAdapterNameByToken[token];
        require(oldName != bytes32(0), "PM: does not exist![3]");
        require(newTokenAdapterName != bytes32(0), "PM: zero![5]");
        require(oldName != newTokenAdapterName, "PM: same name![1]");

        _tokenAdapterNameByToken[token] = newTokenAdapterName;
    }

    function getTokenHash(
        address token
    )
        internal
        view
        returns (bytes32)
    {
        bytes32 hash;

        assembly {
            hash := extcodehash(token)
        }

        return hash;
    }
}
