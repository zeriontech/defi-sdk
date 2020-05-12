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
import { ProtocolMetadata } from "./Structs.sol";
import { Strings } from "./Strings.sol";


/**
 * @title AdapterRegistry part responsible for protocols and adapters management.
 * @dev Base contract for AdapterRegistry.
 * @author Igor Sobolev <sobolev@zerion.io>
 */
abstract contract ProtocolManager is Ownable {

    using Strings for string;

    string internal constant INITIAL_PROTOCOL_NAME = "Initial protocol name";

    // protocol name => next protocol name (linked list)
    mapping(string => string) internal nextProtocolName;
    // protocol name => protocol struct with info and adapters
    mapping(string => ProtocolMetadata) internal protocolMetadata;
    // protocol name => array of protocol adapters
    mapping(string => address[]) internal protocolAdapters;
    // protocol adapter => array of supported tokens
    mapping(address => address[]) internal supportedTokens;

    /**
     * @notice Initializes contract storage.
     */
    constructor() internal {
        nextProtocolName[INITIAL_PROTOCOL_NAME] = INITIAL_PROTOCOL_NAME;
    }

    /**
     * @notice Adds new protocols.
     * The function is callable only by the owner.
     * @param protocolNames Names of the protocols to be added.
     * @param metadata Array with new protocols metadata.
     * @param adapters Nested arrays with new protocols' adapters.
     * @param tokens Nested arrays with adapters' supported tokens.
     */
    function addProtocols(
        string[] memory protocolNames,
        ProtocolMetadata[] memory metadata,
        address[][] memory adapters,
        address[][][] memory tokens
    )
        public
        onlyOwner
    {
        require(protocolNames.length == metadata.length, "PM: protocolNames & metadata differ!");
        require(protocolNames.length == adapters.length, "PM: protocolNames & adapters differ!");
        require(protocolNames.length == tokens.length, "PM: protocolNames & tokens differ!");
        require(protocolNames.length != 0, "PM: empty!");

        for (uint256 i = 0; i < protocolNames.length; i++) {
            addProtocol(protocolNames[i], metadata[i], adapters[i], tokens[i]);
        }
    }

    /**
     * @notice Removes protocols.
     * The function is callable only by the owner.
     * @param protocolNames Names of the protocols to be removed.
     */
    function removeProtocols(
        string[] memory protocolNames
    )
        public
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
        string memory protocolName,
        string memory name,
        string memory description,
        string memory websiteURL,
        string memory iconURL
    )
        public
        onlyOwner
    {
        require(isValidProtocol(protocolName), "PM: bad name!");
        require(abi.encodePacked(name, description, websiteURL, iconURL).length != 0, "PM: empty!");

        ProtocolMetadata storage metadata = protocolMetadata[protocolName];

        if (!name.isEmpty()) {
            metadata.name = name;
        }

        if (!description.isEmpty()) {
            metadata.description = description;
        }

        if (!websiteURL.isEmpty()) {
            metadata.websiteURL = websiteURL;
        }

        if (!iconURL.isEmpty()) {
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
        string memory protocolName,
        address[] memory adapters,
        address[][] memory tokens
    )
        public
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
        string memory protocolName,
        uint256[] memory adapterIndices
    )
        public
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
     * @param newSupportedTokens New supported tokens to be added instead.
     */
    function updateProtocolAdapter(
        string memory protocolName,
        uint256 index,
        address newAdapterAddress,
        address[] memory newSupportedTokens
    )
        public
        onlyOwner
    {
        require(isValidProtocol(protocolName), "PM: bad name!");
        require(index < protocolAdapters[protocolName].length, "PM: bad index!");
        require(newAdapterAddress != address(0), "PM: empty!");

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
        public
        view
        returns (string[] memory)
    {
        uint256 counter = 0;
        string memory currentProtocolName = nextProtocolName[INITIAL_PROTOCOL_NAME];

        while (!currentProtocolName.isEqualTo(INITIAL_PROTOCOL_NAME)) {
            currentProtocolName = nextProtocolName[currentProtocolName];
            counter++;
        }

        string[] memory protocols = new string[](counter);
        counter = 0;
        currentProtocolName = nextProtocolName[INITIAL_PROTOCOL_NAME];

        while (!currentProtocolName.isEqualTo(INITIAL_PROTOCOL_NAME)) {
            protocols[counter] = currentProtocolName;
            currentProtocolName = nextProtocolName[currentProtocolName];
            counter++;
        }

        return protocols;
    }

    /**
     * @param protocolName Name of the protocol.
     * @return Metadata of the protocol.
     */
    function getProtocolMetadata(
        string memory protocolName
    )
        public
        view
        returns (ProtocolMetadata memory)
    {
        return (protocolMetadata[protocolName]);
    }

    /**
     * @param protocolName Name of the protocol.
     * @return Array of protocol adapters.
     */
    function getProtocolAdapters(
        string memory protocolName
    )
        public
        view
        returns (address[] memory)
    {
        return protocolAdapters[protocolName];
    }

    /**
     * @param adapter Address of the protocol adapter.
     * @return Array of supported tokens.
     */
    function getSupportedTokens(
        address adapter
    )
        public
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
        string memory protocolName
    )
        public
        view
        returns (bool)
    {
        return !nextProtocolName[protocolName].isEmpty() && !protocolName.isEqualTo(INITIAL_PROTOCOL_NAME);
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
        string memory protocolName,
        ProtocolMetadata memory metadata,
        address[] memory adapters,
        address[][] memory tokens
    )
        internal
    {
        require(!protocolName.isEqualTo(INITIAL_PROTOCOL_NAME), "PM: initial name!");
        require(!protocolName.isEmpty(), "PM: empty name!");
        require(nextProtocolName[protocolName].isEmpty(), "PM: name exists!");
        require(adapters.length == tokens.length, "PM: adapters & tokens differ!");

        nextProtocolName[protocolName] = nextProtocolName[INITIAL_PROTOCOL_NAME];
        nextProtocolName[INITIAL_PROTOCOL_NAME] = protocolName;

        protocolMetadata[protocolName] = ProtocolMetadata({
            name: metadata.name,
            description: metadata.description,
            websiteURL: metadata.websiteURL,
            iconURL: metadata.iconURL,
            version: metadata.version
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
        string memory protocolName
    )
        internal
    {
        require(isValidProtocol(protocolName), "PM: bad name!");

        string memory prevProtocolName;
        string memory currentProtocolName = nextProtocolName[protocolName];
        while (!currentProtocolName.isEqualTo(protocolName)) {
            prevProtocolName = currentProtocolName;
            currentProtocolName = nextProtocolName[currentProtocolName];
        }

        delete protocolMetadata[protocolName];

        nextProtocolName[prevProtocolName] = nextProtocolName[protocolName];
        delete nextProtocolName[protocolName];

        uint256 length = protocolAdapters[protocolName].length;
        for (uint256 i = length - 1; i < length; i--) {
            removeProtocolAdapter(protocolName, i);
        }
    }

    /**
     * @notice Adds a protocol adapter.
     * The function is callable only by the owner.
     * @param protocolName Name of the protocol to be updated.
     * @param adapter New adapter to be added.
     * @param tokens New adapter's supported tokens.
     */
    function addProtocolAdapter(
        string memory protocolName,
        address adapter,
        address[] memory tokens
    )
        internal
    {
        require(adapter != address(0), "PM: zero!");
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
        string memory protocolName,
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
