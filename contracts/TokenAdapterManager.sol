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
pragma experimental ABIEncoderV2;

import { Ownable } from "./Ownable.sol";
import { Strings } from "./Strings.sol";


/**
 * @title AdapterRegistry part responsible for token adapters management.
 * @dev Base contract for AdapterRegistry.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract TokenAdapterManager is Ownable {

    using Strings for string;

    string internal constant INITIAL_NAME = "Initial token name";

    // adapter name => next adapter name (linked list)
    mapping(string => string) internal nextTokenAdapterName;
    // adapter name => adapter info
    mapping(string => address) internal tokenAdapter;

    /**
     * @notice Initializes contract storage.
     */
    constructor() internal {
        nextTokenAdapterName[INITIAL_NAME] = INITIAL_NAME;
    }

    /**
     * @notice Adds new token adapters.
     * The function is callable only by the owner.
     * @param tokenAdapterNames Names of token adapters to be added.
     * @param adapters Addresses of token adapters to be added.
     */
    function addTokenAdapters(
        string[] memory tokenAdapterNames,
        address[] memory adapters
    )
        public
        onlyOwner
    {
        uint256 length = tokenAdapterNames.length;
        require(length == adapters.length, "TAM: lengths differ!");
        require(length != 0, "PM: empty!");

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
        string[] memory tokenAdapterNames
    )
        public
        onlyOwner
    {
        require(tokenAdapterNames.length != 0, "PM: empty!");

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
    function updateTokenAdapter(
        string memory tokenAdapterName,
        address adapter
    )
        public
        onlyOwner
    {
        require(isValidTokenAdapter(tokenAdapterName), "TAM: bad name!");
        require(adapter != address(0), "TAM: zero!");

        tokenAdapter[tokenAdapterName] = adapter;
    }

    /**
     * @return Array of token adapter names.
     */
    function getTokenAdapterNames()
        public
        view
        returns (string[] memory)
    {
        uint256 counter = 0;
        string memory currentTokenAdapterName = nextTokenAdapterName[INITIAL_NAME];

        while (!currentTokenAdapterName.isEqualTo(INITIAL_NAME)) {
            currentTokenAdapterName = nextTokenAdapterName[currentTokenAdapterName];
            counter++;
        }

        string[] memory tokenAdapters = new string[](counter);
        counter = 0;
        currentTokenAdapterName = nextTokenAdapterName[INITIAL_NAME];

        while (!currentTokenAdapterName.isEqualTo(INITIAL_NAME)) {
            tokenAdapters[counter] = currentTokenAdapterName;
            currentTokenAdapterName = nextTokenAdapterName[currentTokenAdapterName];
            counter++;
        }

        return tokenAdapters;
    }

    /**
     * @param tokenAdapterName Name of token adapter.
     * @return Address of token adapter.
     */
    function getTokenAdapter(
        string memory tokenAdapterName
    )
        public
        view
        returns (address)
    {
        return tokenAdapter[tokenAdapterName];
    }

    /**
     * @param tokenAdapterName Name of token adapter.
     * @return Whether token adapter is valid.
     */
    function isValidTokenAdapter(
        string memory tokenAdapterName
    )
        public
        view
        returns (bool)
    {
        return !nextTokenAdapterName[tokenAdapterName].isEmpty() && !tokenAdapterName.isEqualTo(INITIAL_NAME);
    }

    /**
     * @notice Adds new token adapter.
     * The function is callable only by the owner.
     * @param tokenAdapterName Name of token adapter to be added.
     * @param adapter Address of token adapter to be added.
     */
    function addTokenAdapter(
        string memory tokenAdapterName,
        address adapter
    )
        internal
    {
        require(!tokenAdapterName.isEqualTo(INITIAL_NAME), "TAM: initial name!");
        require(!tokenAdapterName.isEmpty(), "TAM: empty name!");
        require(nextTokenAdapterName[tokenAdapterName].isEmpty(), "TAM: name exists!");
        require(adapter != address(0), "TAM: zero!");

        nextTokenAdapterName[tokenAdapterName] = nextTokenAdapterName[INITIAL_NAME];
        nextTokenAdapterName[INITIAL_NAME] = tokenAdapterName;

        tokenAdapter[tokenAdapterName] = adapter;
    }

    /**
     * @notice Removes one of token adapters.
     * @param tokenAdapterName Name of token adapter to be removed.
     */
    function removeTokenAdapter(
        string memory tokenAdapterName
    )
        internal
    {
        require(isValidTokenAdapter(tokenAdapterName), "TAM: bad name!");

        string memory prevTokenAdapterName;
        string memory currentTokenAdapterName = nextTokenAdapterName[tokenAdapterName];
        while (!currentTokenAdapterName.isEqualTo(tokenAdapterName)) {
            prevTokenAdapterName = currentTokenAdapterName;
            currentTokenAdapterName = nextTokenAdapterName[currentTokenAdapterName];
        }

        nextTokenAdapterName[prevTokenAdapterName] = nextTokenAdapterName[tokenAdapterName];
        delete nextTokenAdapterName[tokenAdapterName];

        delete tokenAdapter[tokenAdapterName];
    }
}
