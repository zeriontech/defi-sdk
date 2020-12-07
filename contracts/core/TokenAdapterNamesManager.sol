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

pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import { Ownable } from "./Ownable.sol";
import { TokenAdapter } from "../adapters/TokenAdapter.sol";

/**
 * @title TokenAdapterRegistry part responsible for contracts' hashes management.
 * @dev Base contract for TokenAdapterRegistry.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract TokenAdapterNamesManager is Ownable {
    // Contract's or address hash => token adapter's name
    mapping(bytes32 => bytes32) private _tokenAdapterName;

    /**
     * @notice Adds token adapters' names by tokens' hashes.
     * The function is callable only by the owner.
     * @param newTokens Array of new tokens.
     * @param newTokenAdapterNames Array of new token adapters' names.
     */
    function addTokenAdapterNamesByHashes(
        address[] calldata newTokens,
        bytes32[] calldata newTokenAdapterNames
    ) external onlyOwner {
        validateInput(newTokens, newTokenAdapterNames);
        uint256 length = newTokens.length;

        for (uint256 i = 0; i < length; i++) {
            addTokenAdapterName(getTokenHash(newTokens[i]), newTokenAdapterNames[i]);
        }
    }

    /**
     * @notice Adds token adapters' names by hashes.
     * The function is callable only by the owner.
     * @param newTokens Array of new tokens.
     * @param newTokenAdapterNames Array of new token adapters' names.
     */
    function addTokenAdapterNamesByTokens(
        address[] calldata newTokens,
        bytes32[] calldata newTokenAdapterNames
    ) external onlyOwner {
        validateInput(newTokens, newTokenAdapterNames);
        uint256 length = newTokens.length;

        for (uint256 i = 0; i < length; i++) {
            addTokenAdapterName(
                keccak256(abi.encodePacked(newTokens[i])),
                newTokenAdapterNames[i]
            );
        }
    }

    /**
     * @notice Removes token adapters' names by tokens' hashes.
     * The function is callable only by the owner.
     * @param tokens Array of tokens.
     */
    function removeTokenAdapterNamesByHashes(address[] calldata tokens) external onlyOwner {
        validateInput(tokens);
        uint256 length = tokens.length;

        for (uint256 i = 0; i < length; i++) {
            removeTokenAdapterName(getTokenHash(tokens[i]));
        }
    }

    /**
     * @notice Removes token adapters' names by tokens.
     * The function is callable only by the owner.
     * @param tokens Array of tokens.
     */
    function removeTokenAdapterNamesByTokens(address[] calldata tokens) external onlyOwner {
        validateInput(tokens);
        uint256 length = tokens.length;

        for (uint256 i = 0; i < length; i++) {
            removeTokenAdapterName(keccak256(abi.encodePacked(tokens[i])));
        }
    }

    /**
     * @notice Updates token adapters' names by tokens' hashes.
     * The function is callable only by the owner.
     * @param tokens Array of tokens.
     * @param newTokenAdapterNames Array of the new token adapters' names.
     */
    function updateTokenAdapterNamesByHashes(
        address[] calldata tokens,
        bytes32[] calldata newTokenAdapterNames
    ) external onlyOwner {
        validateInput(tokens, newTokenAdapterNames);
        uint256 length = tokens.length;

        for (uint256 i = 0; i < length; i++) {
            updateTokenAdapterName(getTokenHash(tokens[i]), newTokenAdapterNames[i]);
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
    ) external onlyOwner {
        validateInput(tokens, newTokenAdapterNames);
        uint256 length = tokens.length;

        for (uint256 i = 0; i < length; i++) {
            updateTokenAdapterName(
                keccak256(abi.encodePacked(tokens[i])),
                newTokenAdapterNames[i]
            );
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
     * @dev Adds a token adapters' name by hash.
     * @param newHash New hash.
     * @param newTokenAdapterName New token adapter's name.
     */
    function addTokenAdapterName(bytes32 newHash, bytes32 newTokenAdapterName) internal {
        require(newTokenAdapterName != bytes32(0), "TANM: zero[1]");
        require(_tokenAdapterName[newHash] == bytes32(0), "TANM: exists");

        _tokenAdapterName[newHash] = newTokenAdapterName;
    }

    /**
     * @dev Removes a token adapters' name by hash.
     * @param hash Hash.
     */
    function removeTokenAdapterName(bytes32 hash) internal {
        require(_tokenAdapterName[hash] != bytes32(0), "TANM: does not exist[1]");

        delete _tokenAdapterName[hash];
    }

    /**
     * @dev Updates a token adapters' name by hash.
     * @param hash Hash.
     * @param newTokenAdapterName New token adapter's name.
     */
    function updateTokenAdapterName(bytes32 hash, bytes32 newTokenAdapterName) internal {
        bytes32 oldTokenAdapterName = _tokenAdapterName[hash];
        require(oldTokenAdapterName != bytes32(0), "TANM: does not exist[2]");
        require(newTokenAdapterName != bytes32(0), "TANM: zero[2]");
        require(oldTokenAdapterName != newTokenAdapterName, "TANM: same name");

        _tokenAdapterName[hash] = newTokenAdapterName;
    }

    /**
     * @dev Checks that arrays' lengths are equal and non-zero.
     * @param tokens Array of tokens' addresses.
     * @param tokenAdapterNames Array of token adapters' names.
     */
    function validateInput(address[] calldata tokens, bytes32[] calldata tokenAdapterNames)
        internal
        pure
    {
        validateInput(tokens);
        uint256 length = tokens.length;
        require(length == tokenAdapterNames.length, "TANM: lengths differ");

        for (uint256 i = 0; i < length; i++) {
            require(tokens[i] != address(0), "TANM: zero[3]");
        }
    }

    /**
     * @dev Checks that array's length is non-zero.
     * @param tokens Array of tokens' addresses.
     */
    function validateInput(address[] calldata tokens) internal pure {
        require(tokens.length != 0, "TANM: empty");
    }
}
