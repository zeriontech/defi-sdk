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

/**
 * @title TokenAdapterRegistry part responsible for contracts' hashes management.
 * @dev Interface for TokenAdapterRegistry.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
interface ITokenAdapterNamesManager {
    event TokenAdapterNameSet(
        bytes32 indexed hash,
        bytes32 indexed oldTokenAdapterName,
        bytes32 indexed newTokenAdapterName
    );

    /**
     * @notice Sets token adapters' names by tokens' hashes using tokens addresses.
     * @param tokens Array of tokens addresses.
     * @param newTokenAdapterNames Array of new token adapters' names.
     * @dev Can be called only by this contract's owner.
     */
    function setTokenAdapterNamesByHashes(
        address[] calldata tokens,
        bytes32[] calldata newTokenAdapterNames
    ) external;

    /**
     * @notice Sets token adapters' names by tokens addresses.
     * @param tokens Array of tokens addresses.
     * @param newTokenAdapterNames Array of new token adapters' names.
     * @dev Can be called only by this contract's owner.
     */
    function setTokenAdapterNamesByTokens(
        address[] calldata tokens,
        bytes32[] calldata newTokenAdapterNames
    ) external;

    /**
     * @notice Sets token adapters' names using hashes.
     * @param hashes Array of hashes.
     * @param newTokenAdapterNames Array of new token adapters' names.
     * @dev Can be called only by this contract's owner.
     */
    function setTokenAdapterNames(
        bytes32[] calldata hashes,
        bytes32[] calldata newTokenAdapterNames
    ) external;

    /**
     * @param token Address of token.
     * @return Name of token adapter.
     */
    function getTokenAdapterName(address token) external view returns (bytes32);

    /**
     * @param token Address of token.
     * @return Hash of token's bytecode.
     */
    function getTokenHash(address token) external view returns (bytes32);
}
