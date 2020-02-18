pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Component } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev stableswap contract interface.
 * Only the functions required for CurveAdapter contract are added.
 * The stableswap contract is available here
 * https://github.com/curvefi/curve-contract/blob/compounded/vyper/stableswap.vy.
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
contract CurveAdapter is Adapter {

    address constant internal SS = 0x2e60CF74d81ac34eB21eEff58Db4D385920ef419;

    /**
     * @return Name of the protocol.
     * @dev Implementation of Adapter function.
     */
    function getProtocolName() external pure override returns (string memory) {
        return("Curve.fi");
    }

    /**
     * @return Amount of stableswapToken locked on the protocol by the given user.
     * @dev Implementation of Adapter function.
     */
    function getAssetAmount(address asset, address user) external view override returns (int128) {
        return int128(ERC20(asset).balanceOf(user));
    }

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of Adapter function.
     * Repeats calculations made in stableswap contract.
     */
    function getUnderlyingRates(address asset) external view override returns (Component[] memory) {
        Component[] memory components = new Component[](2);
        stableswap ss = stableswap(SS);

        for (uint256 i = 0; i < 2; i++) {
            components[i] = Component({
                underlying: ss.coins(int128(i)),
                rate: ss.balances(int128(i)) * 1e18 / ERC20(asset).totalSupply()
            });
        }

        return components;
    }
}
