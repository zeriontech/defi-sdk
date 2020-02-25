pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Protocol, AssetBalance, AssetRate, Component, Asset } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev BasePool contract interface.
 * Only the functions required for PoolTogetherAdapter contract are added.
 * The BasePool contract is available here
 * github.com/pooltogether/pooltogether-contracts/blob/master/contracts/BasePool.sol.
 */
interface BasePool {
    function totalBalanceOf(address) external view returns(uint256);
    function token() external view returns (address);
}


/**
 * @title Adapter for PoolTogether protocol.
 * @dev Implementation of Adapter interface.
 */
contract PoolTogetherAdapter is Adapter {

    address internal constant SAI = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359;
    address internal constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address internal constant POOL_SAI = 0xb7896fce748396EcFC240F5a0d3Cc92ca42D7d84;
    address internal constant POOL_DAI = 0x29fe7D60DdF151E5b52e5FAB4f1325da6b2bD958;

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "PoolTogether",
            description: "Decentralized no-loss lottery",
            icon: "https://protocol-icons.s3.amazonaws.com/pooltogether.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of DAI/SAI locked on the protocol by the given user.
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
            balance: int256(getPool(asset).totalBalanceOf(user))
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
        if (asset == SAI) {
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

    function getPool(address asset) internal pure returns (BasePool) {
        return asset == DAI ? BasePool(POOL_DAI) : BasePool(POOL_SAI);
    }
}
