pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Ownable } from "./Ownable.sol";


/**
 * @title Base contract for AdapterRegistry.
 */
contract AdapterAssetsManager is Ownable {

    address internal constant INITIAL_ADAPTER = address(1);

    mapping(address => address) internal adapters;

    mapping(address => address[]) internal assets;

    /**
     * @notice Initializes contract storage.
     * @param _adapters Array with adapters.
     * @param _assets Nested array of supported assets for each adapter.
     */
    constructor(
        address[] memory _adapters,
        address[][] memory _assets
    )
        internal
    {
        require(_adapters.length == _assets.length, "AAM: wrong constructor parameters!");

        adapters[INITIAL_ADAPTER] = INITIAL_ADAPTER;

        for (uint256 i = 0; i < _adapters.length; i++) {
            addAdapter(_adapters[i], _assets[i]);
        }
    }

    /**
     * @notice Adds new adapter to adapters list.
     * The function is callable only by the owner.
     * @param newAdapter Address of new adapter.
     * @param _assets Addresses of adapter's assets.
     */
    function addAdapter(
        address newAdapter,
        address[] memory _assets
    )
        public
        onlyOwner
    {
        require(newAdapter != address(0), "AAM: zero adapter!");
        require(newAdapter != INITIAL_ADAPTER, "AAM: initial adapter!");
        require(adapters[newAdapter] == address(0), "AAM: adapter exists!");

        adapters[newAdapter] = adapters[INITIAL_ADAPTER];
        adapters[INITIAL_ADAPTER] = newAdapter;

        assets[newAdapter] = _assets;
    }

    /**
     * @notice Removes one of adapters from adapters list.
     * The function is callable only by the owner.
     * @param adapter Address of adapter to be removed.
     */
    function removeAdapter(
        address adapter
    )
        public
        onlyOwner
    {
        require(isValidAdapter(adapter), "AAM: invalid adapter!");

        address prevAdapter;
        address currentAdapter = adapters[adapter];
        while (currentAdapter != adapter) {
            prevAdapter = currentAdapter;
            currentAdapter = adapters[currentAdapter];
        }

        delete assets[adapter];

        adapters[prevAdapter] = adapters[adapter];
        adapters[adapter] = address(0);
    }

    /**
     * @notice Adds new asset to adapter.
     * The function is callable only by the owner.
     * @param adapter Address of adapter.
     * @param asset Address of new adapter's asset.
     */
    function addAdapterAsset(
        address adapter,
        address asset
    )
        public
        onlyOwner
    {
        require(isValidAdapter(adapter), "AAM: adapter is not valid!");
        assets[adapter].push(asset);
    }

    /**
     * @notice Removes one of adapter's assets by its index.
     * The function is callable only by the owner.
     * @param adapter Address of adapter.
     * @param assetIndex Index of adapter's asset to be removed.
     */
    function removeAdapterAsset(
        address adapter,
        uint256 assetIndex
    )
        public
        onlyOwner
    {
        require(isValidAdapter(adapter), "AAM: adapter is not valid!");

        address[] storage adapterAssets = assets[adapter];
        uint256 length = adapterAssets.length;
        require(assetIndex < length, "AAM: asset index is too large!");

        if (assetIndex != length - 1) {
            adapterAssets[assetIndex] = adapterAssets[length - 1];
        }

        adapterAssets.pop();
    }

    /**
     * @param adapter Address of adapter.
     * @return Array of adapter's assets.
     */
    function getAdapterAssets(
        address adapter
    )
        public
        view
        returns (address[] memory)
    {
        return assets[adapter];
    }

    /**
     * @return Array of adapters.
     */
    function getAdapters()
        public
        view
        returns (address[] memory)
    {
        uint256 counter = 0;
        address currentAdapter = adapters[INITIAL_ADAPTER];

        while (currentAdapter != INITIAL_ADAPTER) {
            currentAdapter = adapters[currentAdapter];
            counter++;
        }

        address[] memory adaptersList = new address[](counter);
        counter = 0;
        currentAdapter = adapters[INITIAL_ADAPTER];

        while (currentAdapter != INITIAL_ADAPTER) {
            adaptersList[counter] = currentAdapter;
            currentAdapter = adapters[currentAdapter];
            counter++;
        }

        return adaptersList;
    }

    /**
     * @param adapter Address of adapter.
     * @return Whether adapter is valid.
     */
    function isValidAdapter(
        address adapter
    )
        public
        view
        returns (bool)
    {
        return adapters[adapter] != address(0) && adapter != INITIAL_ADAPTER;
    }
}
