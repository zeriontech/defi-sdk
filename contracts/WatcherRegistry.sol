pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;

import { ProtocolWatcher } from "./watchers/ProtocolWatcher.sol";
import { ProtocolBalance, AssetBalance, Rate } from "./Structs.sol";
import { ProtocolAssetsManager } from "./ProtocolAssetsManager.sol";
import { IERC20 } from "./IERC20.sol";


/**
* @title Registry for protocol watchers.
* @notice balanceOf() and exchangeRates() functions
* with different arguments implement the main functionality.
*/
contract WatcherRegistry is ProtocolAssetsManager {

    constructor(
        address[] memory _protocolWatchers,
        address[][] memory _assets
    )
        public
        ProtocolAssetsManager(_protocolWatchers, _assets)
    {}

    /**
     * @return All the amounts of supported assets locked on supported protocols by the given user.
     */
    function balanceOf(
        address user
    )
        external
        view
        returns(ProtocolBalance[] memory)
    {
        uint256 length = protocolWatchers.length;
        ProtocolBalance[] memory protocolBalances = new ProtocolBalance[](length);
        for (uint256 i = 0; i < length; i++) {
            address protocolWatcher = protocolWatchers[i];
            protocolBalances[i] = ProtocolBalance({
                name: ProtocolWatcher(protocolWatcher).protocolName(),
                balances: balanceOf(user, protocolWatcher),
                rates: exchangeRates(protocolWatcher)
            });
        }
        return protocolBalances;
    }

    /**
     * @return All the amounts of supported assets locked on the given protocol by the given user.
     */
    function balanceOf(
        address user,
        address protocolWatcher
    )
        public
        view
        returns (AssetBalance[] memory)
    {
        address[] memory protocolWatcherAssets = assets[protocolWatcher];
        return balanceOf(user, protocolWatcher, protocolWatcherAssets);
    }

    /**
     * @return All the amounts of the given assets locked on the given protocol by the given user.
     */
    function balanceOf(
        address user,
        address protocolWatcher,
        address[] memory assets
    )
        public
        view
        returns (AssetBalance[] memory)
    {
        uint256 length = assets.length;
        AssetBalance[] memory assetBalances = new AssetBalance[](length);
        for (uint256 i = 0; i < length; i++) {
            address asset = assets[i];
            assetBalances[i] = AssetBalance({
                asset: asset,
                amount: ProtocolWatcher(protocolWatcher).balanceOf(asset, user),
                decimals: IERC20(asset).decimals()
            });
        }
        return assetBalances;
    }

    /**
     * @return All the exchange rates for assets supported by the given protocol.
     */
    function exchangeRates(
        address protocolWatcher
    )
        public
        view
        returns (Rate[] memory)
    {
        address[] memory protocolWatcherAssets = assets[protocolWatcher];
        return exchangeRates(protocolWatcher, protocolWatcherAssets);
    }

    /**
     * @return All the exchange rates for the given assets of the given protocol.
     */
    function exchangeRates(
        address protocolWatcher,
        address[] memory assets
    )
        public
        view
        returns (Rate[] memory)
    {
        uint256 length = assets.length;
        Rate[] memory rates = new Rate[](length);
        for (uint256 i = 0; i < length; i++) {
            address asset = assets[i];
            rates[i] = Rate({
                asset: asset,
                components: ProtocolWatcher(protocolWatcher).exchangeRate(asset)
            });
        }
        return rates;
    }
}
