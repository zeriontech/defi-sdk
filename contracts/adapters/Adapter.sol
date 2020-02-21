pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Protocol, AssetBalance, AssetRate, Asset } from "../Structs.sol";


/**
 * @title Base contract for protocol adapters.
 * @dev getProtocol(), getAsset(), getAssetBalance(),
  and getAssetRate() functions MUST be implemented.
 */
interface Adapter {

    /**
     * @dev MUST return Protocol struct with protocol info.
     */
    function getProtocol() external pure returns (Protocol memory);

    /**
    * @dev MUST return amount of the given asset locked on the protocol by the given user.
    */
    function getAssetBalance(address asset, address user) external view returns (AssetBalance memory);

    /**
    * @dev MUST return Component structs array with underlying assets rates for the given asset.
    */
    function getAssetRate(address asset) external view returns (AssetRate memory);

    /**
     * @dev MUST return Asset struct with asset info for the given asset.
     */
    function getAsset(address asset) external view returns (Asset memory);
}
