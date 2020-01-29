pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;

import { Adapter } from "./adapters/Adapter.sol";
import { AdapterAssetsManager } from "./AdapterAssetsManager.sol";
import { ERC20 } from "./ERC20.sol";
import {
    ProtocolDetail,
    ProtocolBalance,
    ProtocolRate,
    AssetBalance,
    AssetRate
} from "./Structs.sol";


/**
* @title Registry for protocol adapters.
* @notice balance() and exchangeRates() functions
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
    {}

    /**
     * @return All the amounts and rates of supported assets
     * via supported adapters by the given user.
     */
    function getBalancesAndRates(
        address user
    )
        external
        view
        returns(ProtocolDetail[] memory)
    {
        address[] memory adapters = getAdapters();
        ProtocolDetail[] memory protocolDetails = new ProtocolDetail[](adapters.length);

        for (uint256 i = 0; i < adapters.length; i++) {
            protocolDetails[i] = ProtocolDetail({
                name: Adapter(adapters[i]).getProtocolName(),
                balances: getBalances(user, adapters[i]),
                rates: getRates(adapters[i])
            });
        }

        return protocolDetails;
    }

    /**
     * @return All the amounts of supported assets
     * via supported adapters by the given user.
     */
    function getBalances(
        address user
    )
        external
        view
        returns(ProtocolBalance[] memory)
    {
        address[] memory adapters = getAdapters();
        ProtocolBalance[] memory protocolBalances = new ProtocolBalance[](adapters.length);

        for (uint256 i = 0; i < adapters.length; i++) {
            protocolBalances[i] = ProtocolBalance({
                name: Adapter(adapters[i]).getProtocolName(),
                balances: getBalances(user, adapters[i])
            });
        }

        return protocolBalances;
    }

    /**
     * @return All the exchange rates for supported assets
     * via the supported adapters.
     */
    function getRates()
        external
        view
        returns (ProtocolRate[] memory)
    {
        address[] memory adapters = getAdapters();
        ProtocolRate[] memory protocolRates = new ProtocolRate[](adapters.length);

        for (uint256 i = 0; i < adapters.length; i++) {
            protocolRates[i] = ProtocolRate({
                name: Adapter(adapters[i]).getProtocolName(),
                rates: getRates(adapters[i])
            });
        }

        return protocolRates;
    }

    /**
     * @return All the amounts of supported assets
     * via the given adapter by the given user.
     */
    function getBalances(
        address user,
        address adapter
    )
        public
        view
        returns (AssetBalance[] memory)
    {
        address[] memory adapterAssets = getAdapterAssets(adapter);

        return getBalances(user, adapter, adapterAssets);
    }

    /**
     * @return All the amounts of the given assets
     * via the given adapter by the given user.
     */
    function getBalances(
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
            assetBalances[i] = AssetBalance({
                asset: asset,
                amount: Adapter(adapter).getAssetAmount(asset, user),
                decimals: getAssetDecimals(asset)
            });
        }

        return assetBalances;
    }

    /**
     * @return All the exchange rates for supported assets
     * via the given adapter.
     */
    function getRates(
        address adapter
    )
        public
        view
        returns (AssetRate[] memory)
    {
        address[] memory adapterAssets = assets[adapter];

        return getRates(adapter, adapterAssets);
    }

    /**
     * @return All the exchange rates for the given assets
     * via the given adapter.
     */
    function getRates(
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
            rates[i] = AssetRate({
                asset: asset,
                components: Adapter(adapter).getUnderlyingRates(asset)
            });
        }

        return rates;
    }

    function getAssetDecimals(
        address asset
    )
        internal
        view
        returns (uint8)
    {
        return asset == ETH ? uint8(18) : ERC20(asset).decimals();
    }

}
