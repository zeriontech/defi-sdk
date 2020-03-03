pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Ownable } from "./Ownable.sol";
import { Strings } from "./Strings.sol";


/**
 * @title Base contract for AdapterRegistry.
 */
abstract contract TokenAdapterManager is Ownable {

    using Strings for string;

    string internal constant INITIAL_NAME = "Initial name";

    // adapter name => adapter info
    mapping (string => address) internal tokenAdapter;
    // adapter name => next adapter name
    mapping (string => string) internal nextTokenAdapterName; // linked list

    /**
     * @notice Initializes contract storage.
     * @param tokenAdapters Array with `tokenAdapter` mapping keys (adapters names).
     * @param tokenAdapters Array with `tokenAdapter` mapping values (adapters addresses).
     */
    constructor(
        string[] memory tokenAdapterNames,
        address[] memory tokenAdapters
    )
        internal
    {
        require(tokenAdapterNames.length == tokenAdapters.length,
            "TAM: wrong constructor params!");

        nextTokenAdapterName[INITIAL_NAME] = INITIAL_NAME;

        for (uint256 i = 0; i < tokenAdapterNames.length; i++) {
            addTokenAdapter(tokenAdapterNames[i], tokenAdapters[i]);
        }
    }

    /**
     * @notice Adds new token adapter.
     * The function is callable only by the owner.
     * @param newTokenAdapter Name of token adapter to be added.
     * @param newTokenAdapter Address of token adapter to be added.
     */
    function addTokenAdapter(
        string memory newTokenAdapterName,
        address newTokenAdapter
    )
        public
        onlyOwner
    {
        require(newTokenAdapter != address(0), "TAM: zero address!");
        require(!newTokenAdapterName.isEqualTo(INITIAL_NAME), "TAM: initial name!");
        require(!newTokenAdapterName.isEmpty(), "TAM: empty name!");
        require(nextTokenAdapterName[newTokenAdapterName].isEmpty(), "TAM: adapter exists!");

        nextTokenAdapterName[newTokenAdapterName] = nextTokenAdapterName[INITIAL_NAME];
        nextTokenAdapterName[INITIAL_NAME] = newTokenAdapterName;

        tokenAdapter[newTokenAdapterName] = newTokenAdapter;
    }

    /**
     * @notice Removes one of token adapters.
     * The function is callable only by the owner.
     * @param oldTokenAdapterName Name of token adapter to be removed.
     */
    function removeTokenAdapter(
        string memory oldTokenAdapterName
    )
        public
        onlyOwner
    {
        require(isValidTokenAdapter(oldTokenAdapterName), "AAM: invalid adapter!");

        string memory prevTokenAdapterName;
        string memory currentTokenAdapterName = nextTokenAdapterName[oldTokenAdapterName];
        while (!currentTokenAdapterName.isEqualTo(oldTokenAdapterName)) {
            prevTokenAdapterName = currentTokenAdapterName;
            currentTokenAdapterName = nextTokenAdapterName[currentTokenAdapterName];
        }

        nextTokenAdapterName[prevTokenAdapterName] = nextTokenAdapterName[oldTokenAdapterName];
        delete nextTokenAdapterName[oldTokenAdapterName];

        delete tokenAdapter[oldTokenAdapterName];
    }

    /**
     * @notice Updates token adapter.
     * The function is callable only by the owner.
     * @param oldTokenAdapterName Name of token adapter to be updated.
     * @param newTokenAdapter Address of token adapter to be added instead.
     */
    function updateTokenAdapter(
        string memory oldTokenAdapterName,
        address newTokenAdapter
    )
        public
        onlyOwner
    {
        require(isValidTokenAdapter(oldTokenAdapterName), "TAM: adapter does not exist!");
        require(newTokenAdapter != address(0), "TAM: zero address!");

        tokenAdapter[oldTokenAdapterName] = newTokenAdapter;
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
     * @return Array of token adapter names.
     */
    function getTokenAdapters()
        external
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
}
