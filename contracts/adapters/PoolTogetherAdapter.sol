pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Component } from "../Structs.sol";


/**
 * @dev BasePool contract interface.
 * Only the functions required for PoolTogetherAdapter contract are added.
 * The BasePool contract is available here
 * https://github.com/pooltogether/pooltogether-contracts/blob/master/contracts/BasePool.sol.
 */
interface BasePool {
    function totalBalanceOf(address) external view returns(uint256);
}


/**
 * @title Adapter for PoolTogether protocol.
 * @dev Implementation of Adapter abstract contract.
 */
contract PoolTogetherAdapter is Adapter {

    address constant internal DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address constant internal SAI = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359;
    BasePool constant internal DAIPool = BasePool(0x29fe7D60DdF151E5b52e5FAB4f1325da6b2bD958);
    BasePool constant internal SAIPool = BasePool(0xb7896fce748396EcFC240F5a0d3Cc92ca42D7d84);

    /**
     * @return Name of the protocol.
     * @dev Implementation of Adapter function.
     */
    function getProtocolName() external pure override returns (string memory) {
        return("PoolTogether");
    }

    /**
     * @return Amount of DAI/SAI locked on the protocol by the given user.
     * @dev Implementation of Adapter function.
     */
    function getAssetAmount(address asset, address user) external view override returns (int128) {
        if (asset == DAI) {
            return int128(DAIPool.totalBalanceOf(user));
        } else if (asset == SAI) {
            return int128(SAIPool.totalBalanceOf(user));
        } else {
            return int128(0);
        }
    }

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of Adapter function.
     */
    function getUnderlyingRates(address asset) external view override returns (Component[] memory) {
        Component[] memory components;

        if (asset == DAI || asset == SAI) {
            components = new Component[](1);
            components[0] = Component({
                underlying: asset,
                rate: uint256(1e18)
            });
        } else {
            components = new Component[](0);
        }

        return components;
    }
}