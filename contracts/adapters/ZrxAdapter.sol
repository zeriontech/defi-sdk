pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Protocol, AssetBalance, AssetRate, Component, Asset } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev Staking contract interface.
 * Only the functions required for ZrxAdapter contract are added.
 * The Staking contract is available here
 * github.com/0xProject/0x-monorepo/blob/development/contracts/staking/contracts/src/Staking.sol.
 */
interface Staking {
    function getTotalStake(address) external view returns (uint256);
}


/**
 * @title Adapter for 0x protocol.
 * @dev Implementation of Adapter interface.
 */
contract ZrxAdapter is Adapter {

    address internal constant STAKING = 0xa26e80e7Dea86279c6d778D702Cc413E6CFfA777;

    /**
     * @return Protocol struct with protocol info.
     * @dev Implementation of Adapter interface function.
     */
    function getProtocol() external pure override returns (Protocol memory) {
        return Protocol({
            name: "0x Staking",
            description: "Liquidity rewards with ZRX",
            icon: "https://protocol-icons.s3.amazonaws.com/0x-staking.png",
            version: uint256(1)
        });
    }

    /**
     * @return Amount of ZRX locked on the protocol by the given user.
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
            balance: int256(Staking(STAKING).getTotalStake(user))
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
        return Asset({
            contractAddress: asset,
            decimals: ERC20(asset).decimals(),
            symbol: ERC20(asset).symbol()
        });
    }
}
