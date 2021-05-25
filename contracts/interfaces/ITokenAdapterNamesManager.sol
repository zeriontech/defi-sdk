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

pragma solidity 0.8.4;

import { HashAndAdapterName, TokenAndAdapterName } from "../shared/Structs.sol";

/**
 * @title TokenAdapterRegistry part responsible for contracts' hashes management.
 * @dev Interface for TokenAdapterRegistry.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
interface ITokenAdapterNamesManager {
    /**
     * @notice Emits old and new token adapter names.
     * @param hash Hash of token address or token code.
     * @param oldTokenAdapterName Old token adapter's name.
     * @param newTokenAdapterName New token adapter's name.
     */
    event TokenAdapterNameSet(
        bytes32 indexed hash,
        bytes32 indexed oldTokenAdapterName,
        bytes32 indexed newTokenAdapterName
    );

    /**
     * @notice Sets token adapters' names by tokens' hashes using tokens addresses.
     * @param tokensAndAdapterNames Array of tokens addresses and new token adapters' names.
     * @dev Can be called only by this contract's owner.
     */
    function setTokenAdapterNamesByHashes(
        TokenAndAdapterName[] calldata tokensAndAdapterNames
    ) external;

    /**
     * @notice Sets token adapters' names by tokens addresses.
     * @param tokensAndAdapterNames Array of tokens addresses and new token adapters' names.
     * @dev Can be called only by this contract's owner.
     */
    function setTokenAdapterNamesByTokens(
        TokenAndAdapterName[] calldata tokensAndAdapterNames
    ) external;

    /**
     * @notice Sets token adapters' names using hashes.
     * @param hashesAndAdapterNames Array of hashes and new token adapters' names.
     * @dev Can be called only by this contract's owner.
     */
    function setTokenAdapterNames(
        HashAndAdapterName[] calldata hashesAndAdapterNames
    ) external;

    /**
     * @param token Address of token.
     * @return name Name of token adapter.
     */
    function getTokenAdapterName(address token) external view returns (bytes32 name);

    /**
     * @param token Address of token.
     * @return hash Hash of token's bytecode.
     */
    function getTokenHash(address token) external view returns (bytes32 hash);
}
