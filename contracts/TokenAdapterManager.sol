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

pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;

import { Ownable } from "./Ownable.sol";
import { TokenAdapter } from "./adapters/TokenAdapter.sol";


/**
 * @title AdapterRegistry part responsible for token adapters management.
 * @dev Base contract for AdapterRegistry.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract TokenAdapterManager is Ownable {

    // token adapters names
    bytes32[] internal tokenAdapters;
    // token adapter tokenAdapterName => adapter address
    mapping (bytes32 => address) internal tokenAdapterAddress;

    /**
     * @notice Adds new token adapters.
     * The function is callable only by the owner.
     * @param tokenAdapterNames Names of token adapters to be added.
     * @param adapters Addresses of token adapters to be added.
     */
    function addTokenAdapters(
        bytes32[] memory tokenAdapterNames,
        address[] memory adapters
    )
        public
        onlyOwner
    {
        uint256 length = tokenAdapterNames.length;
        require(length != 0, "TAM: empty![1]");
        require(length == adapters.length, "TAM: lengths differ!");

        for (uint256 i = 0; i < length; i++) {
            addTokenAdapter(tokenAdapterNames[i], adapters[i]);
        }
    }

    /**
     * @notice Removes token adapters.
     * The function is callable only by the owner.
     * @param tokenAdapterNames Names of token adapters to be removed.
     */
    function removeTokenAdapters(
        bytes32[] memory tokenAdapterNames
    )
        public
        onlyOwner
    {
        require(tokenAdapterNames.length != 0, "TAM: empty![2]");

        for (uint256 i = 0; i < tokenAdapterNames.length; i++) {
            removeTokenAdapter(tokenAdapterNames[i]);
        }
    }

    /**
     * @notice Updates token adapter.
     * The function is callable only by the owner.
     * @param tokenAdapterName Name of token adapter to be updated.
     * @param adapter Address of token adapter to be added instead.
     */
    function updateTokenAdapterAddress(
        bytes32 tokenAdapterName,
        address adapter
    )
        public
        onlyOwner
    {
        require(isValidTokenAdapterName(tokenAdapterName), "TAM: bad name![1]");
        require(adapter != address(0), "TAM: zero![1]");

        tokenAdapterAddress[tokenAdapterName] = adapter;
    }

    /**
     * @return Array of token adapter names.
     */
    function getTokenAdapterNames()
        public
        view
        returns (bytes32[] memory)
    {
        return tokenAdapters;
    }

    /**
     * @param tokenAdapterName Name of token adapter.
     * @return Address of token adapter.
     */
    function getTokenAdapterAddress(
        bytes32 tokenAdapterName
    )
        public
        view
        returns (address)
    {
        return tokenAdapterAddress[tokenAdapterName];
    }

    /**
     * @param tokenAdapterName Name of token adapter.
     * @return Whether token adapter is valid.
     */
    function isValidTokenAdapterName(
        bytes32 tokenAdapterName
    )
        public
        view
        returns (bool)
    {
        return tokenAdapterAddress[tokenAdapterName] != address(0);
    }

    /**
     * @notice Adds new token adapter.
     * The function is callable only by the owner.
     * @param tokenAdapterName Name of token adapter to be added.
     * @param adapter Address of token adapter to be added.
     */
    function addTokenAdapter(
        bytes32 tokenAdapterName,
        address adapter
    )
        internal
    {
        require(!isValidTokenAdapterName(tokenAdapterName), "TAM: name exists!");
        require(adapter != address(0), "TAM: zero![2]");
        require(TokenAdapter(adapter).tokenType() == tokenAdapterName, "TAM: wrong name/type!");

        tokenAdapters.push(tokenAdapterName);

        tokenAdapterAddress[tokenAdapterName] = adapter;
    }

    /**
     * @notice Removes one of token adapters.
     * @param tokenAdapterName Name of token adapter to be removed.
     */
    function removeTokenAdapter(
        bytes32 tokenAdapterName
    )
        internal
    {
        require(isValidTokenAdapterName(tokenAdapterName), "TAM: bad name![2]");

        delete tokenAdapterAddress[tokenAdapterName];

        uint256 index = 0;
        while (tokenAdapters[index] != tokenAdapterName) {
            index++;
        }

        uint256 length = tokenAdapters.length;
        if (index != length - 1) {
            tokenAdapters[index] = tokenAdapters[length - 1];
        }

        tokenAdapters.pop();
    }
}
