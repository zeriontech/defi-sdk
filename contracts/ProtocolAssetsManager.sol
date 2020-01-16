pragma solidity 0.6.1;

import { Ownable } from "./Ownable.sol";

/**
 * @title Base contract for WatcherRegistry.
 */
contract ProtocolAssetsManager is Ownable {

    address[] internal protocolWatchers;

    mapping(address => address[]) internal assets;

    /**
     * @notice Initializes contract storage.
     * @param _protocolWatchers Array with protocolWatchers.
     * @param _assets Nested array of supported assets for each protocol.
     */
    constructor(
        address[] memory _protocolWatchers,
        address[][] memory _assets
    )
        internal
    {
        require(_protocolWatchers.length == _assets.length, "PAM: wrong constructor parameters!");

        for (uint256 i = 0; i < _protocolWatchers.length; i++) {
            assets[_protocolWatchers[i]] = _assets[i];
        }

        protocolWatchers = _protocolWatchers;
    }

    /**
     * @notice Adds new protocolWatcher to protocolWatchers array.
     * The function is callable only by the owner.
     * @param protocolWatcher Address of new protocolWatcher
     * @param _assets Addresses of protocolWatcher's assets
     */
    function addProtocolWatcher(
        address protocolWatcher,
        address[] calldata _assets
    )
        external
        onlyOwner
    {
        protocolWatchers.push(protocolWatcher);
        assets[protocolWatcher] = _assets;
    }

    /**
     * @notice Removes one of protocolWatchers by its index.
     * The function is callable only by the owner.
     * @param watcherIndex Index of protocolWatcher to be deleted.
     */
    function removeProtocolWatcher(
        uint256 watcherIndex
    )
        external
        onlyOwner
    {
        uint256 length = protocolWatchers.length;
        require(watcherIndex < length, "PAM: watcher index is too large!");
        delete assets[protocolWatchers[watcherIndex]];
        if (watcherIndex != length - 1) {
            protocolWatchers[watcherIndex] = protocolWatchers[length - 1];
        }
        protocolWatchers.pop();
    }

    /**
     * @notice Adds new asset to protocolWatcher.
     * The function is callable only by the owner.
     * @param watcherIndex Address of protocolWatcher.
     * @param asset Address of new protocolWatcher's asset.
     */
    function addProtocolWatcherAsset(
        uint256 watcherIndex,
        address asset
    )
        external
        onlyOwner
    {
        require(watcherIndex < protocolWatchers.length, "PAM: watcher index is too large!");
        assets[protocolWatchers[watcherIndex]].push(asset);
    }

    /**
     * @notice Removes one of protocolWatcher's assets by its index.
     * The function is callable only by the owner.
     * @param watcherIndex Address of protocolWatcher.
     * @param assetIndex Index of protocolWatcher's asset to be deleted.
     */
    function removeProtocolWatcherAsset(
        uint256 watcherIndex,
        uint256 assetIndex
    )
        external
        onlyOwner
    {
        require(watcherIndex < protocolWatchers.length, "PAM: watcher index is too large!");
        address[] storage protocolWatcherAssets = assets[protocolWatchers[watcherIndex]];
        uint256 length = protocolWatcherAssets.length;
        require(assetIndex < length, "PAM: asset index is too large!");
        if (assetIndex != length - 1) {
            protocolWatcherAssets[assetIndex] = protocolWatcherAssets[length - 1];
        }
        protocolWatcherAssets.pop();
    }

    /**
     * @param protocolWatcher Address of protocolWatcher.
     * @return Array of protocolWatcher's assets.
     */
    function getProtocolWatcherAssets(
        address protocolWatcher
    )
        external
        view
        returns (address[] memory)
    {
        return assets[protocolWatcher];
    }

    /**
     * @return Array of protocolWatchers.
     */
    function getProtocolWatchers() external view returns (address[] memory) {
        return protocolWatchers;
    }
}
