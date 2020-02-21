pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./adapters/Adapter.sol";
import { AdapterAssetsManager } from "./AdapterAssetsManager.sol";
import {
    ProtocolBalancesAndRates,
    ProtocolBalances,
    ProtocolRates,
    AssetBalance,
    AssetRate,
    Component,
    Asset
} from "./Structs.sol";


/**
* @title Registry for protocol adapters.
* @notice getAssetBalances() and getAssetRates() functions
* with different arguments implement the main functionality.
*/
contract AdapterRegistry is AdapterAssetsManager {

    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    constructor(
        address[] memory _adapters,
        address[][] memory _assets
    )
        public
        AdapterAssetsManager(_adapters, _assets)
    // solhint-disable-next-line no-empty-blocks
    {}

    /**
     * @return All the amounts and rates of supported assets
     * via supported adapters by the given user.
     */
    function getProtocolsBalancesAndRates(
        address user
    )
        external
        view
        returns(ProtocolBalancesAndRates[] memory)
    {
        address[] memory adapters = getAdapters();
        ProtocolBalancesAndRates[] memory protocolBalancesAndRates =
            new ProtocolBalancesAndRates[](adapters.length);

        for (uint256 i = 0; i < adapters.length; i++) {
            protocolBalancesAndRates[i] = ProtocolBalancesAndRates({
                protocol: Adapter(adapters[i]).getProtocol(),
                balances: getAssetBalances(user, adapters[i]),
                rates: getAssetRates(adapters[i])
            });
        }

        return protocolBalancesAndRates;
    }

    /**
     * @return All the amounts of supported assets
     * via supported adapters by the given user.
     */
    function getProtocolsBalances(
        address user
    )
        external
        view
        returns(ProtocolBalances[] memory)
    {
        address[] memory adapters = getAdapters();
        ProtocolBalances[] memory protocolsBalances = new ProtocolBalances[](adapters.length);

        for (uint256 i = 0; i < adapters.length; i++) {
            protocolsBalances[i] = ProtocolBalances({
                protocol: Adapter(adapters[i]).getProtocol(),
                balances: getAssetBalances(user, adapters[i])
            });
        }

        return protocolsBalances;
    }

    /**
     * @return All the exchange rates for supported assets
     * via the supported adapters.
     */
    function getProtocolsRates()
        external
        view
        returns (ProtocolRates[] memory)
    {
        address[] memory adapters = getAdapters();
        ProtocolRates[] memory protocolsRates = new ProtocolRates[](adapters.length);

        for (uint256 i = 0; i < adapters.length; i++) {
            protocolsRates[i] = ProtocolRates({
                protocol: Adapter(adapters[i]).getProtocol(),
                rates: getAssetRates(adapters[i])
            });
        }

        return protocolsRates;
    }

    /**
     * @return All the amounts of supported assets
     * via the given adapter by the given user.
     */
    function getAssetBalances(
        address user,
        address adapter
    )
        public
        view
        returns (AssetBalance[] memory)
    {
        address[] memory adapterAssets = getAdapterAssets(adapter);

        return getAssetBalances(user, adapter, adapterAssets);
    }

    /**
     * @return All the amounts of the given assets
     * via the given adapter by the given user.
     */
    function getAssetBalances(
        address user,
        address adapter,
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

            try Adapter(adapter).getAssetBalance(asset, user) returns (AssetBalance memory result) {
                assetBalances[i] = result;
            } catch {
                continue;
            }
        }

        return assetBalances;
    }

    /**
     * @return All the exchange rates for supported assets
     * via the given adapter.
     */
    function getAssetRates(
        address adapter
    )
        public
        view
        returns (AssetRate[] memory)
    {
        address[] memory adapterAssets = assets[adapter];

        return getAssetRates(adapter, adapterAssets);
    }

    /**
     * @return All the exchange rates for the given assets
     * via the given adapter.
     */
    function getAssetRates(
        address adapter,
        address[] memory assets
    )
        public
        view
        returns (AssetRate[] memory)
    {
        uint256 length = assets.length;
        AssetRate[] memory rates = new AssetRate[](length);

        for (uint256 i = 0; i < length; i++) {
            address asset = assets[i];

            try Adapter(adapter).getAssetRate(asset) returns (AssetRate memory result) {
                rates[i] = result;
            } catch {
                continue;
            }
        }

        return rates;
    }
}
