pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { CompoundRegistry } from "./CompoundRegistry.sol";
import { AssetRate, Component, Asset } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev CToken contract interface.
 * Only the functions required for CompoundBorrowAdapter contract are added.
 * The CToken contract is available here
 * github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
 */
interface CToken {
    function exchangeRateStored() external view returns (uint256);
    function underlying() external view returns (address);
}


/**
 * @title Adapter for Compound protocol.
 * @dev Implementation of Adapter interface.
 */
abstract contract CompoundAdapter is Adapter {

    address internal constant REGISTRY = 0xE6881a7d699d3A350Ce5bba0dbD59a9C36778Cb7;
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant CETH = 0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5;
    address internal constant SAI = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359;

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of Adapter interface function.
     * Repeats calculations made in CToken contract.
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

        if (CompoundRegistry(REGISTRY).getCToken(asset) == address(0)) {
            components[0] = Component({
                underlying: getAsset(getUnderlying(asset)),
                rate: CToken(asset).exchangeRateStored()
            });

            return AssetRate({
                asset: getAsset(asset),
                components: components
            });
        } else {
            components[0] = Component({
                underlying: getAsset(asset),
                rate: uint256(1e18)
            });

            return AssetRate({
                asset: getAsset(asset),
                components: components
            });
        }


    }

    /**
     * @return Asset struct with asset info for the given asset.
     * @dev Implementation of Adapter interface function.
     */
    function getAsset(address asset) public view override returns (Asset memory) {
        if (asset == ETH) {
            return Asset({
                contractAddress: ETH,
                decimals: uint8(18),
                symbol: "ETH"
            });
        } else if (asset == SAI) {
            return Asset({
                contractAddress: SAI,
                decimals: uint8(18),
                symbol: "SAI"
            });
        } else {
            return Asset({
                contractAddress: asset,
                decimals: ERC20(asset).decimals(),
                symbol: ERC20(asset).symbol()
            });
        }
    }

    function getUnderlying(address asset) internal view returns (address) {
        return asset == CETH ? ETH : CToken(asset).underlying();
    }
}
