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

pragma solidity 0.6.9;
pragma experimental ABIEncoderV2;

import { Ownable } from "./Ownable.sol";
import { ProtocolMetadata } from "./Structs.sol";


/**
 * @title AdapterRegistry part responsible for protocols and adapters management.
 * @dev Base contract for AdapterRegistry.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract ProtocolManager is Ownable {

    // protocol names
    bytes32[] internal protocols;
    // protocol name => ProtocolMetadata struct with protocol info
    mapping (bytes32 => ProtocolMetadata) internal protocolMetadata;
    // protocol name => array of protocol adapters
    mapping (bytes32 => address[]) internal protocolAdapters;
    // protocol adapter => array of supported tokens
    mapping (address => address[]) internal supportedTokens;

    /**
     * @notice Adds new protocols.
     * The function is callable only by the owner.
     * @param protocolNames Names of the protocols to be added.
     * @param metadata Array with new protocols' metadata.
     * @param adapters Nested arrays with new protocols' adapters.
     * @param tokens Nested arrays with adapters' supported tokens.
     */
    function addProtocols(
        bytes32[] calldata protocolNames,
        ProtocolMetadata[] calldata metadata,
        address[][] calldata adapters,
        address[][][] calldata tokens
    )
        external
        onlyOwner
    {
        uint256 length = protocolNames.length;
        require(length == metadata.length, "PM: protocols & metadata differ!");
        require(length == adapters.length, "PM: protocols & adapters differ!");
        require(length == tokens.length, "PM: protocols & tokens differ!");
        require(length != 0, "PM: empty!");

        for (uint256 i = 0; i < length; i++) {
            addProtocol(protocolNames[i], metadata[i], adapters[i], tokens[i]);
        }
    }

    /**
     * @notice Removes protocols.
     * The function is callable only by the owner.
     * @param protocolNames Names of the protocols to be removed.
     */
    function removeProtocols(
        bytes32[] calldata protocolNames
    )
        external
        onlyOwner
    {
        require(protocolNames.length != 0, "PM: empty!");

        for (uint256 i = 0; i < protocolNames.length; i++) {
            removeProtocol(protocolNames[i]);
        }
    }

    /**
     * @notice Updates a protocol info.
     * The function is callable only by the owner.
     * @param protocolName Name of the protocol to be updated.
     * @param name Name of the protocol to be added instead.
     * @param description Description of the protocol to be added instead.
     * @param websiteURL URL of the protocol website to be added instead.
     * @param iconURL URL of the protocol icon to be added instead.
     */
    function updateProtocolMetadata(
        bytes32 protocolName,
        string calldata name,
        string calldata description,
        string calldata websiteURL,
        string calldata iconURL
    )
        external
        onlyOwner
    {
        require(isValidProtocol(protocolName), "PM: bad name!");
        require(abi.encodePacked(name, description, websiteURL, iconURL).length != 0, "PM: empty!");

        ProtocolMetadata storage metadata = protocolMetadata[protocolName];

        if (bytes(name).length != 0) {
            metadata.name = name;
        }

        if (bytes(description).length != 0) {
            metadata.description = description;
        }

        if (bytes(websiteURL).length != 0) {
            metadata.websiteURL = websiteURL;
        }

        if (bytes(iconURL).length != 0) {
            metadata.iconURL = iconURL;
        }

        metadata.version++;
    }

    /**
     * @notice Adds protocol adapters.
     * The function is callable only by the owner.
     * @param protocolName Name of the protocol to be updated.
     * @param adapters Array of new adapters to be added.
     * @param tokens Array of new adapters' supported tokens.
     */
    function addProtocolAdapters(
        bytes32 protocolName,
        address[] calldata adapters,
        address[][] calldata tokens
    )
        external
        onlyOwner
    {
        require(isValidProtocol(protocolName), "PM: bad name!");
        require(adapters.length != 0, "PM: empty!");

        for (uint256 i = 0; i < adapters.length; i++) {
            addProtocolAdapter(protocolName, adapters[i], tokens[i]);
        }

        protocolMetadata[protocolName].version++;
    }

    /**
     * @notice Removes protocol adapters.
     * The function is callable only by the owner.
     * @param protocolName Name of the protocol to be updated.
     * @param adapterIndices Array of adapter indexes to be removed.
     * @dev NOTE: indexes will change during execution of this function!!!
     */
    function removeProtocolAdapters(
        bytes32 protocolName,
        uint256[] calldata adapterIndices
    )
        external
        onlyOwner
    {
        require(isValidProtocol(protocolName), "PM: bad name!");
        require(adapterIndices.length != 0, "PM: empty!");

        for (uint256 i = 0; i < adapterIndices.length; i++) {
            removeProtocolAdapter(protocolName, adapterIndices[i]);
        }

        protocolMetadata[protocolName].version++;
    }

    /**
     * @notice Updates a protocol adapter.
     * The function is callable only by the owner.
     * @param protocolName Name of the protocol to be updated.
     * @param index Index of the adapter to be updated.
     * @param newAdapterAddress New adapter address to be added instead.
     * Zero address is allowed, but only with empty newSupportedTokens array.
     * @param newSupportedTokens New supported tokens to be added instead.
     * Empty array is always allowed.
     */
    function updateProtocolAdapter(
        bytes32 protocolName,
        uint256 index,
        address newAdapterAddress,
        address[] calldata newSupportedTokens
    )
        external
        onlyOwner
    {
        require(isValidProtocol(protocolName), "PM: bad name!");
        require(index < protocolAdapters[protocolName].length, "PM: bad index!");
        if (newAdapterAddress == address(0)) {
            require(newSupportedTokens.length == 0, "PM: tokens for zero adapter!");
        }

        address adapterAddress = protocolAdapters[protocolName][index];

        if (newAdapterAddress == adapterAddress) {
            supportedTokens[adapterAddress] = newSupportedTokens;
        } else {
            protocolAdapters[protocolName][index] = newAdapterAddress;
            supportedTokens[newAdapterAddress] = newSupportedTokens;
            delete supportedTokens[adapterAddress];
        }

        protocolMetadata[protocolName].version++;
    }

    /**
     * @return Array of protocol names.
     */
    function getProtocolNames()
        external
        view
        returns (bytes32[] memory)
    {
        return protocols;
    }

    /**
     * @param protocolNames Array of protocols protocols.
     * @return Array of protocols metadata.
     */
    function getProtocolsMetadata(
        bytes32[] calldata protocolNames
    )
        external
        view
        returns (ProtocolMetadata[] memory)
    {
        ProtocolMetadata[] memory protocolsMetadata = new ProtocolMetadata[](protocolNames.length);

        for (uint256 i = 0; i < protocolNames.length; i++) {
            protocolsMetadata[i] = protocolMetadata[protocolNames[i]];
        }

        return protocolsMetadata;
    }

    /**
     * @param protocolName Name of the protocol.
     * @return Array of protocol's adapters.
     */
    function getProtocolAdapters(
        bytes32 protocolName
    )
        external
        view
        returns (address[] memory)
    {
        return protocolAdapters[protocolName];
    }

    /**
     * @param adapter Address of the adapter.
     * @return Array of supported tokens.
     */
    function getSupportedTokens(
        address adapter
    )
        external
        view
        returns (address[] memory)
    {
        return supportedTokens[adapter];
    }

    /**
     * @param protocolName Name of the protocol.
     * @return Whether the protocol name is valid.
     */
    function isValidProtocol(
        bytes32 protocolName
    )
        public
        view
        returns (bool)
    {
        return protocolMetadata[protocolName].version > 0;
    }

    /**
     * @notice Adds a new protocol.
     * The function is callable only by the owner.
     * @param protocolName Name of the protocol to be added.
     * @param metadata Info about new protocol.
     * @param adapters Addresses of new protocol's adapters.
     * @param tokens Addresses of new protocol's adapters' supported tokens.
     */
    function addProtocol(
        bytes32 protocolName,
        ProtocolMetadata calldata metadata,
        address[] calldata adapters,
        address[][] calldata tokens
    )
        internal
    {
        require(!isValidProtocol(protocolName), "PM: name exists!");
        require(adapters.length == tokens.length, "PM: adapters & tokens differ!");

        protocols.push(protocolName);

        protocolMetadata[protocolName] = ProtocolMetadata({
            name: metadata.name,
            description: metadata.description,
            websiteURL: metadata.websiteURL,
            iconURL: metadata.iconURL,
            version: 1
        });

        for (uint256 i = 0; i < adapters.length; i++) {
            addProtocolAdapter(protocolName, adapters[i], tokens[i]);
        }
    }

    /**
     * @notice Removes one of the protocols.
     * @param protocolName Name of the protocol to be removed.
     */
    function removeProtocol(
        bytes32 protocolName
    )
        internal
    {
        require(isValidProtocol(protocolName), "PM: bad name!");

        uint256 length = protocolAdapters[protocolName].length;
        for (uint256 i = length - 1; i < length; i--) {
            removeProtocolAdapter(protocolName, i);
        }

        delete protocolMetadata[protocolName];

        uint256 index = 0;
        while (protocols[index] != protocolName) {
            index++;
        }

        length = protocols.length;
        if (index != length - 1) {
            protocols[index] = protocols[length - 1];
        }

        protocols.pop();
    }

    /**
     * @notice Adds a protocol adapter.
     * The function is callable only by the owner.
     * @param protocolName Name of the protocol to be updated.
     * @param adapter New adapter to be added.
     * Zero address is allowed, but only with empty tokens array.
     * @param tokens New adapter's supported tokens.
     * Empty array is always allowed.
     */
    function addProtocolAdapter(
        bytes32 protocolName,
        address adapter,
        address[] calldata tokens
    )
        internal
    {
        if (adapter == address(0)) {
            require(tokens.length == 0, "PM: tokens for zero adapter!");
        }
        require(supportedTokens[adapter].length == 0, "PM: exists!");

        protocolAdapters[protocolName].push(adapter);
        supportedTokens[adapter] = tokens;
    }

    /**
     * @notice Removes a protocol adapter.
     * The function is callable only by the owner.
     * @param protocolName Name of the protocol to be updated.
     * @param index Adapter index to be removed.
     */
    function removeProtocolAdapter(
        bytes32 protocolName,
        uint256 index
    )
        internal
    {
        uint256 length = protocolAdapters[protocolName].length;
        require(index < length, "PM: bad index!");

        delete supportedTokens[protocolAdapters[protocolName][index]];

        if (index != length - 1) {
            protocolAdapters[protocolName][index] = protocolAdapters[protocolName][length - 1];
        }

        protocolAdapters[protocolName].pop();
    }
}
