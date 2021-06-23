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

import { ITokenAdapterNamesManager } from "../interfaces/ITokenAdapterNamesManager.sol";
import { BadLength, ZeroLength } from "../shared/Errors.sol";
import { Ownable } from "../shared/Ownable.sol";
import { HashAndAdapterName, TokenAndAdapterName } from "../shared/Structs.sol";

/**
 * @title TokenAdapterRegistry part responsible for contracts' hashes management.
 * @dev Base contract for TokenAdapterRegistry.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract TokenAdapterNamesManager is ITokenAdapterNamesManager, Ownable {
    // Contract's or address hash => token adapter's name
    mapping(bytes32 => bytes32) private _tokenAdapterName;

    /**
     * @inheritdoc ITokenAdapterNamesManager
     */
    function setTokenAdapterNamesByHashes(TokenAndAdapterName[] calldata tokensAndAdapterNames)
        external
        override
        onlyOwner
    {
        uint256 length = tokensAndAdapterNames.length;
        if (length == 0) {
            revert ZeroLength();
        }

        for (uint256 i = 0; i < length; i++) {
            setTokenAdapterName(
                getTokenHash(tokensAndAdapterNames[i].token),
                tokensAndAdapterNames[i].name
            );
        }
    }

    /**
     * @inheritdoc ITokenAdapterNamesManager
     */
    function setTokenAdapterNamesByTokens(TokenAndAdapterName[] calldata tokensAndAdapterNames)
        external
        override
        onlyOwner
    {
        uint256 length = tokensAndAdapterNames.length;
        if (length == 0) {
            revert ZeroLength();
        }

        for (uint256 i = 0; i < length; i++) {
            setTokenAdapterName(
                keccak256(abi.encodePacked(tokensAndAdapterNames[i].token)),
                tokensAndAdapterNames[i].name
            );
        }
    }

    /**
     * @inheritdoc ITokenAdapterNamesManager
     */
    function setTokenAdapterNames(HashAndAdapterName[] calldata hashesAndAdapterNames)
        external
        override
        onlyOwner
    {
        uint256 length = hashesAndAdapterNames.length;
        if (length == 0) {
            revert ZeroLength();
        }

        for (uint256 i = 0; i < length; i++) {
            setTokenAdapterName(hashesAndAdapterNames[i].hash, hashesAndAdapterNames[i].name);
        }
    }

    /**
     * @inheritdoc ITokenAdapterNamesManager
     */
    function getTokenAdapterName(address token) public view override returns (bytes32 name) {
        name = _tokenAdapterName[keccak256(abi.encodePacked(token))];

        if (name == bytes32(0)) {
            name = _tokenAdapterName[getTokenHash(token)];
        }

        return name;
    }

    /**
     * @inheritdoc ITokenAdapterNamesManager
     */
    function getTokenHash(address token) public view override returns (bytes32 hash) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            hash := extcodehash(token)
        }

        return hash;
    }

    /**
     * @dev Sets token adapters' name by hash.
     * @param hash Hash of token's bytecode or address.
     * @param name Token adapter's name.
     */
    function setTokenAdapterName(bytes32 hash, bytes32 name) internal {
        emit TokenAdapterNameSet(hash, _tokenAdapterName[hash], name);

        _tokenAdapterName[hash] = name;
    }
}
