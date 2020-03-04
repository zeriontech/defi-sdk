pragma solidity 0.6.2;
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
    function token() external view returns (address);
}


/**
 * @title Adapter for PoolTogether protocol.
 * @dev Implementation of Adapter interface.
 */
contract PoolTogetherAdapter is Adapter {

    address internal constant SAI = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359;
    address internal constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address internal constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address internal constant POOL_SAI = 0xb7896fce748396EcFC240F5a0d3Cc92ca42D7d84;
    address internal constant POOL_DAI = 0x29fe7D60DdF151E5b52e5FAB4f1325da6b2bD958;
    address internal constant POOL_USDC = 0x0034Ea9808E620A0EF79261c51AF20614B742B24;

    /**
     * @return Name of the protocol.
     * @dev Implementation of Adapter function.
     */
    function getProtocolName() external pure override returns (string memory) {
        return("PoolTogether");
    }

    /**
     * @return Amount of DAI/SAI/USDC locked on the protocol by the given user.
     * @dev Implementation of Adapter function.
     */
    function getAssetAmount(address asset, address user) external view override returns (int256) {
        if (asset == DAI) {
            return int256(BasePool(POOL_DAI).totalBalanceOf(user));
        } else if (asset == SAI) {
            return int256(BasePool(POOL_SAI).totalBalanceOf(user));
        } else if (asset == USDC) {
            return int256(BasePool(POOL_USDC).totalBalanceOf(user));
        } else {
            return int256(0);
        }
    }

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of Adapter function.
     */
    function getUnderlyingRates(address asset) external view override returns (Component[] memory) {
        Component[] memory components = new Component[](1);

        components[0] = Component({
            underlying: asset,
            rate: uint256(1e18)
        });

        return components;
    }
}
