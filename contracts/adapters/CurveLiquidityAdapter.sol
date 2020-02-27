pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Protocol, AssetBalance, AssetRate, Component, Asset } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev stableswap contract interface.
 * Only the functions required for CurveLiquidityAdapter contract are added.
 * The stableswap contract is available here
 * github.com/curvefi/curve-contract/blob/compounded/vyper/stableswap.vy.
 */
// solhint-disable-next-line contract-name-camelcase
interface stableswap {
    function coins(int128) external view returns (address);
    function balances(int128) external view returns(uint256);
}


/**
 * @title Adapter for Curve.fi protocol.
 * @dev Implementation of Adapter interface.
 */
contract CurveLiquidityAdapter is Adapter {

    address constant internal SS = 0x2e60CF74d81ac34eB21eEff58Db4D385920ef419;

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "Curve Liquidity",
            description: "Exchange liquidity pool for stablecoin trading",
            class: "Pool",
            icon: "https://protocol-icons.s3.amazonaws.com/curve.fi.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of stableswapToken locked on the protocol by the given user.
     * @dev Implementation of Adapter interface function.
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
     * Repeats calculations made in stableswap contract.
     */
    function getAssetRate(
        address asset
    )
        external
        view
        override
        returns (AssetRate memory)
    {
        stableswap ss = stableswap(SS);
        uint256 length = 0;
        while (length < 2 ** 64) {
            try ss.coins(int128(length)) {
                length++;
            } catch {
                continue;
            }
        }

        Component[] memory components = new Component[](length);

        for (uint256 i = 0; i < length; i++) {
            components[i] = Component({
                underlying: getAsset(ss.coins(int128(i))),
                rate: ss.balances(int128(i)) * 1e18 / ERC20(asset).totalSupply()
            });
        }

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
