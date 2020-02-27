pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Protocol, AssetBalance, AssetRate, Component, Asset } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev YToken contract interface.
 * Only the functions required for IearnAdapter contract are added.
 * The YToken contracts is available here
 * https://github.com/iearn-finance/itoken/tree/master/contracts.
 */
interface YToken {
    function token() external view returns (address);
    function getPricePerFullShare() external view returns (uint256);
}


/**
 * @title Adapter for iearn.finance protocol.
 * @dev Implementation of Adapter interface.
 */
contract IearnAdapter is Adapter {

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "iearn.finance",
            description: "Decentralized lending protocol",
            class: "Deposit",
            icon: "https://protocol-icons.s3.amazonaws.com/iearn.finance.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of yToken held by the given user.
     * @dev Implementation of Adapter function.
     */
    function getAssetBalance(
        address asset,
        address user
    )
        external
        view
        override
        returns (AssetBalance memory)
    {
        return AssetBalance({
            asset: getAsset(asset),
            balance: ERC20(asset).balanceOf(user)
        });
    }

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of Adapter interface function.
     */
    function getAssetRate(
        address asset
    )
        external
        view
        override
        returns (AssetRate memory)
    {
        Component[] memory components = new Component[](1);

        components[0] = Component({
            underlying: getAsset(YToken(asset).token()),
            rate: YToken(asset).getPricePerFullShare()
        });

        return AssetRate({
            asset: getAsset(asset),
            components: components
        });
    }

    /**
     * @return Asset struct with asset info for the given asset.
     * @dev Implementation of Adapter interface function.
     */
    function getAsset(address asset) public view override returns (Asset memory) {
        return Asset({
            contractAddress: asset,
            decimals: ERC20(asset).decimals(),
            symbol: ERC20(asset).symbol()
        });
    }
}
