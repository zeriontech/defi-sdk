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
 * @title TokenAdapterRegistry part responsible for protocols' hashes management.
 * @dev Base contract for TokenAdapterRegistry.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract ProtocolManager is Ownable {

    // Protocols' hashes
    bytes32[] internal _protocolHashes;
    // Protocol's hash => token adapter's name
    mapping (bytes32 => bytes32) internal _tokenAdapterName;

    /**
     * @notice Adds protocols' hashes.
     * The function is callable only by the owner.
     * @param newProtocolHashes Array of the new protocols' hashes.
     * @param newTokenAdapterNames Array of the new token adapters' names.
     */
    function addProtocoles(
        bytes32[] calldata newProtocolHashes,
        bytes32[] calldata newTokenAdapterNames
    )
        external
        onlyOwner
    {
        uint256 length = newProtocolHashes.length;
        require(length != 0, "PM: empty![1]");
        require(length == newTokenAdapterNames.length, "PM: lengths differ![1]");

        for (uint256 i = 0; i < length; i++) {
            addProtocol(newProtocolHashes[i], newTokenAdapterNames[i]);
        }
    }

    /**
     * @notice Removes protocols.
     * The function is callable only by the owner.
     * @param hashes Array of the protocols' hashes.
     */
    function removeProtocoles(
        bytes32[] calldata hashes
    )
        external
        onlyOwner
    {
        uint256 length = hashes.length;
        require(length != 0, "PM: empty![2]");

        for (uint256 i = 0; i < length; i++) {
            removeProtocol(hashes[i]);
        }
    }

    /**
     * @notice Updates hashes.
     * The function is callable only by the owner.
     * @param hashes Array of the protocols' hashes.
     * @param newTokenAdapterNames Array of the new token adapters' names.
     */
    function updateProtocoles(
        bytes32[] calldata hashes,
        bytes32[] calldata newTokenAdapterNames
    )
        external
        onlyOwner
    {
        uint256 length = hashes.length;
        require(length != 0, "PM: empty![3]");
        require(length == newTokenAdapterNames.length, "PM: lengths differ![2]");

        for (uint256 i = 0; i < length; i++) {
            updateProtocol(hashes[i], newTokenAdapterNames[i]);
        }
    }

    /**
     * @return Array of protocol hashes.
     */
    function getProtocolHashes()
        external
        view
        returns (bytes32[] memory)
    {
        return _protocolHashes;
    }

    /**
     * @param hash Hash of protocol's contracts.
     * @return Name of token adapter.
     */
    function getTokenAdapterName(
        bytes32 hash
    )
        public
        view
        returns (bytes32)
    {
        return _tokenAdapterName[hash];
    }

    /**
     * @notice Adds a protocol hash.
     * @param newProtocolHash New protocol's hash.
     * @param newTokenAdapterName New token adapter's name.
     */
    function addProtocol(
        bytes32 newProtocolHash,
        bytes32 newTokenAdapterName
    )
        internal
    {
        require(newProtocolHash != bytes32(0), "PM: zero![1]");
        require(newTokenAdapterName != bytes32(0), "PM: zero![2]");
        require(_tokenAdapterName[newProtocolHash] == bytes32(0), "PM: exists!");

        _protocolHashes.push(newProtocolHash);
        _tokenAdapterName[newProtocolHash] = newTokenAdapterName;
    }

    /**
     * @notice Removes a protocol hash.
     * @param hash Protocol's hash.
     */
    function removeProtocol(
        bytes32 hash
    )
        internal
    {
        require(_tokenAdapterName[hash] != bytes32(0), "PM: does not exist![1]");

        uint256 length = _protocolHashes.length;
        uint256 index = 0;
        while (_protocolHashes[index] != hash) {
            index++;
        }

        if (index != length - 1) {
            _protocolHashes[index] = _protocolHashes[length - 1];
        }

        _protocolHashes.pop();

        delete _tokenAdapterName[hash];
    }

    /**
     * @notice Updates a protocol hash.
     * @param hash Protocol's hash.
     * @param newTokenAdapterName Token adapter's new name.
     */
    function updateProtocol(
        bytes32 hash,
        bytes32 newTokenAdapterName
    )
        internal
    {
        bytes32 oldName = _tokenAdapterName[hash];
        require(oldName != bytes32(0), "PM: does not exist![2]");
        require(newTokenAdapterName != bytes32(0), "PM: zero![3]");
        require(oldName != newTokenAdapterName, "PM: same name!");

        _tokenAdapterName[hash] = newTokenAdapterName;
    }
}
