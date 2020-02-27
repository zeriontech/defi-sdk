pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { AssetRate, Component, Asset } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev Proxy contract interface.
 * Only the functions required for AaveDepositAdapter contract are added.
 * The Synthetix contract is available here
 * github.com/Synthetixio/synthetix/blob/master/contracts/Proxy.sol.
 */
interface Proxy {
    function target() external view returns (address);
}


/**
 * @title Adapter for Aave protocol.
 * @dev Implementation of Adapter interface.
 */
abstract contract AaveAdapter is Adapter {

    address internal constant PROVIDER = 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8;
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal constant SNX = 0xC011A72400E58ecD99Ee497CF89E3775d4bd732F;
    address internal constant MKR = 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2;

    /**
     * @return Component structs array with underlying assets rates for the given asset.
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
            underlying: getAsset(asset),
            rate: uint256(1e18)
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
        if (asset == ETH) {
            return Asset({
                contractAddress: ETH,
                decimals: uint8(18),
                symbol: "ETH"
            });
        } else if (asset == SNX) {
            return Asset({
                contractAddress: asset,
                decimals: ERC20(Proxy(asset).target()).decimals(),
                symbol: ERC20(Proxy(asset).target()).symbol()
            });
        } else if (asset == MKR) {
            return Asset({
                contractAddress: asset,
                decimals: uint8(18),
                symbol: "MKR"
            });
        } else {
            return Asset({
                contractAddress: asset,
                decimals: ERC20(asset).decimals(),
                symbol: ERC20(asset).symbol()
            });
        }
    }
}
