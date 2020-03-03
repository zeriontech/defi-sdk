pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Ownable } from "./Ownable.sol";
import { ProtocolAdapter } from "./Structs.sol";
import { TokenAdapterManager } from "./TokenAdapterManager.sol";
import { Strings } from "./Strings.sol";


/**
 * @title Base contract for AdapterRegistry.
 */
abstract contract ProtocolAdapterManager is TokenAdapterManager {

    using Strings for string;

    // adapter name => adapter info
    mapping (string => ProtocolAdapter) internal protocolAdapter;
    // adapter name => next adapter name
    mapping (string => string) internal nextProtocolAdapterName; // linked list

    /**
     * @notice Initializes contract storage.
     * @param protocolAdapterNames Array with `protocolAdapter` mapping keys (adapters names).
     * @param protocolAdapters Array with `protocolAdapter` mapping values (adapters info).
     */
    constructor(
        string[] memory protocolAdapterNames,
        ProtocolAdapter[] memory protocolAdapters
    )
        internal
    {
        require(protocolAdapterNames.length == protocolAdapters.length,
            "PAM: wrong constructor parameters!");

        nextProtocolAdapterName[INITIAL_NAME] = INITIAL_NAME;

        for (uint256 i = 0; i < protocolAdapterNames.length; i++) {
            addProtocolAdapter(protocolAdapterNames[i], protocolAdapters[i]);
        }
    }

    /**
     * @notice Adds new protocol adapter.
     * The function is callable only by the owner.
     * @param newProtocolAdapterName Name of protocol adapter to be added.
     * @param newProtocolAdapter Info about new protocol adapter.
     */
    function addProtocolAdapter(
        string memory newProtocolAdapterName,
        ProtocolAdapter memory newProtocolAdapter
    )
        public
        onlyOwner
    {
        require(newProtocolAdapter.adapter != address(0), "PAM: zero adapter!");
        require(!newProtocolAdapterName.isEqualTo(INITIAL_NAME), "PAM: initial name!");
        require(!newProtocolAdapterName.isEmpty(), "PAM: empty name!");
        require(nextProtocolAdapterName[newProtocolAdapterName].isEmpty(), "PAM: adapter exists!");

        nextProtocolAdapterName[newProtocolAdapterName] = nextProtocolAdapterName[INITIAL_NAME];
        nextProtocolAdapterName[INITIAL_NAME] = newProtocolAdapterName;

        protocolAdapter[newProtocolAdapterName] = ProtocolAdapter({
            adapter: newProtocolAdapter.adapter,
            addedAt: block.number,
            supportedTokens: newProtocolAdapter.supportedTokens
        });
    }

    /**
     * @notice Removes one of protocol adapters.
     * The function is callable only by the owner.
     * @param oldProtocolAdapterName Name of protocol adapter to be removed.
     */
    function removeProtocolAdapter(
        string memory oldProtocolAdapterName
    )
        public
        onlyOwner
    {
        require(isValidProtocolAdapter(oldProtocolAdapterName), "PAM: invalid adapter!");

        string memory prevProtocolAdapterName;
        string memory currentProtocolAdapterName = nextProtocolAdapterName[oldProtocolAdapterName];
        while (!currentProtocolAdapterName.isEqualTo(oldProtocolAdapterName)) {
            prevProtocolAdapterName = currentProtocolAdapterName;
            currentProtocolAdapterName = nextProtocolAdapterName[currentProtocolAdapterName];
        }

        delete protocolAdapter[oldProtocolAdapterName];

        nextProtocolAdapterName[prevProtocolAdapterName] = nextProtocolAdapterName[oldProtocolAdapterName];
        delete nextProtocolAdapterName[oldProtocolAdapterName];
    }

    /**
     * @notice Updates protocol adapter.
     * The function is callable only by the owner.
     * @param oldProtocolAdapterName Name of protocol adapter to be updated.
     * @param newProtocolAdapter Info for protocol adapter to be added instead.
     */
    function updateProtocolAdapter(
        string memory oldProtocolAdapterName,
        ProtocolAdapter memory newProtocolAdapter
    )
        public
        onlyOwner
    {
        require(isValidProtocolAdapter(oldProtocolAdapterName), "PAM: adapter does not exist!");
        require(newProtocolAdapter.adapter != address(0), "PAM: zero adapter!");

        ProtocolAdapter storage currentProtocolAdapter = protocolAdapter[oldProtocolAdapterName];

        currentProtocolAdapter.adapter = newProtocolAdapter.adapter;

        if (newProtocolAdapter.supportedTokens.length != 0) {
            currentProtocolAdapter.supportedTokens = newProtocolAdapter.supportedTokens;
        }
    }

    /**
     * @notice Adds new token to adapter's supportedTokens.
     * The function is callable only by the owner.
     * @param protocolAdapterName Name of protocol adapter.
     * @param token Address of new adapter's asset.
     */
    function addProtocolAdapterSupportedTokens(
        string memory protocolAdapterName,
        address token
    )
        public
        onlyOwner
    {
        require(isValidProtocolAdapter(protocolAdapterName), "PAM: adapter is not valid!");
        require(token != address(0), "PAM: zero asset!");

        protocolAdapter[protocolAdapterName].supportedTokens.push(token);
    }

    /**
     * @notice Removes one of adapter's supportedTokens by its index.
     * The function is callable only by the owner.
     * @param protocolAdapterName Name of protocol adapter.
     * @param tokenIndex Index of adapter's asset to be removed.
     */
    function removeProtocolAdapterAsset(
        string memory protocolAdapterName,
        uint256 tokenIndex
    )
        public
        onlyOwner
    {
        require(isValidProtocolAdapter(protocolAdapterName), "PAM: adapter is not valid!");

        address[] storage supportedTokens = protocolAdapter[protocolAdapterName].supportedTokens;
        uint256 length = supportedTokens.length;
        require(tokenIndex < length, "PAM: asset index is too large!");

        if (tokenIndex != length - 1) {
            supportedTokens[tokenIndex] = supportedTokens[length - 1];
        }

        supportedTokens.pop();
    }

    /**
     * @param protocolAdapterName Name of protocol adapter.
     * @return Info for protocol adapter.
     */
    function getProtocolAdapter(
        string calldata protocolAdapterName
    )
        external
        view
        returns (ProtocolAdapter memory)
    {
        return protocolAdapter[protocolAdapterName];
    }

    /**
     * @return Array of protocol adapter names.
     */
    function getProtocolAdapters()
        public
        view
        returns (string[] memory)
    {
        uint256 counter = 0;
        string memory currentProtocolAdapterName = nextProtocolAdapterName[INITIAL_NAME];

        while (!currentProtocolAdapterName.isEqualTo(INITIAL_NAME)) {
            currentProtocolAdapterName = nextProtocolAdapterName[currentProtocolAdapterName];
            counter++;
        }

        string[] memory protocolAdapters = new string[](counter);
        counter = 0;
        currentProtocolAdapterName = nextProtocolAdapterName[INITIAL_NAME];

        while (!currentProtocolAdapterName.isEqualTo(INITIAL_NAME)) {
            protocolAdapters[counter] = currentProtocolAdapterName;
            currentProtocolAdapterName = nextProtocolAdapterName[currentProtocolAdapterName];
            counter++;
        }

        return protocolAdapters;
    }

    /**
     * @param protocolAdapterName Name of protocol adapter.
     * @return Whether adapter is valid.
     */
    function isValidProtocolAdapter(
        string memory protocolAdapterName
    )
        public
        view
        returns (bool)
    {
        return !nextProtocolAdapterName[protocolAdapterName].isEmpty() && !protocolAdapterName.isEqualTo(INITIAL_NAME);
    }
}
