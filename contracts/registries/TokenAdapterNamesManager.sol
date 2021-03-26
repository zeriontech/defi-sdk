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

pragma solidity 0.8.1;

import { Ownable } from "../shared/Ownable.sol";
import { TokenAdapter } from "../tokenAdapters/TokenAdapter.sol";

/**
 * @title TokenAdapterRegistry part responsible for contracts' hashes management.
 * @dev Base contract for TokenAdapterRegistry.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract TokenAdapterNamesManager is Ownable {
    // Contract's or address hash => token adapter's name
    mapping(bytes32 => bytes32) private _tokenAdapterName;

    event TokenAdapterNameSet(
        bytes32 indexed hash,
        bytes32 indexed oldTokenAdapterName,
        bytes32 indexed newTokenAdapterName
    );

    /**
     * @notice Adds token adapters' names by tokens' hashes using tokens addresses.
     * The function is callable only by the owner.
     * @param tokens Array of tokens addresses.
     * @param newTokenAdapterNames Array of new token adapters' names.
     */
    function setTokenAdapterNamesByHashes(
        address[] calldata tokens,
        bytes32[] calldata newTokenAdapterNames
    ) external onlyOwner {
        uint256 length = tokens.length;
        require(length != 0, "TANM: empty");
        require(length == newTokenAdapterNames.length, "TANM: lengths differ");

        for (uint256 i = 0; i < length; i++) {
            setTokenAdapterName(getTokenHash(tokens[i]), newTokenAdapterNames[i]);
        }
    }

    /**
     * @notice Adds token adapters' names by tokens addresses.
     * The function is callable only by the owner.
     * @param tokens Array of tokens addresses.
     * @param newTokenAdapterNames Array of new token adapters' names.
     */
    function setTokenAdapterNamesByTokens(
        address[] calldata tokens,
        bytes32[] calldata newTokenAdapterNames
    ) external onlyOwner {
        uint256 length = tokens.length;
        require(length != 0, "TANM: empty");
        require(length == newTokenAdapterNames.length, "TANM: lengths differ");

        for (uint256 i = 0; i < length; i++) {
            setTokenAdapterName(keccak256(abi.encodePacked(tokens[i])), newTokenAdapterNames[i]);
        }
    }

    /**
     * @notice Adds token adapters' names using hashes.
     * The function is callable only by the owner.
     * @param hashes Array of hashes.
     * @param newTokenAdapterNames Array of new token adapters' names.
     */
    function setTokenAdapterNames(
        bytes32[] calldata hashes,
        bytes32[] calldata newTokenAdapterNames
    ) external onlyOwner {
        uint256 length = hashes.length;
        require(length != 0, "TANM: empty");
        require(length == newTokenAdapterNames.length, "TANM: lengths differ");

        for (uint256 i = 0; i < length; i++) {
            setTokenAdapterName(hashes[i], newTokenAdapterNames[i]);
        }
    }

    /**
     * @param token Address of token.
     * @return Name of token adapter.
     */
    function getTokenAdapterName(address token) public view returns (bytes32) {
        bytes32 tokenAdapterName = _tokenAdapterName[keccak256(abi.encodePacked(token))];

        if (tokenAdapterName == bytes32(0)) {
            tokenAdapterName = _tokenAdapterName[getTokenHash(token)];
        }

        return tokenAdapterName;
    }

    /**
     * @param token Address of token.
     * @return Hash of token's bytecode.
     */
    function getTokenHash(address token) public view returns (bytes32) {
        bytes32 hash;

        // solhint-disable-next-line no-inline-assembly
        assembly {
            hash := extcodehash(token)
        }

        return hash;
    }

    /**
     * @dev Sets token adapters' name by hash.
     * @param hash Hash.
     * @param newTokenAdapterName New token adapter's name.
     */
    function setTokenAdapterName(bytes32 hash, bytes32 newTokenAdapterName) internal {
        bytes32 oldTokenAdapterName = _tokenAdapterName[hash];
        require(oldTokenAdapterName != newTokenAdapterName, "TANM: same");

        emit TokenAdapterNameSet(hash, oldTokenAdapterName, newTokenAdapterName);

        _tokenAdapterName[hash] = newTokenAdapterName;
    }
}