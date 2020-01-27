pragma solidity 0.6.1;
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
 * @dev Implementation of Adapter abstract contract.
 */
contract CurveAdapter is Adapter {

    address constant internal SS = 0x2e60CF74d81ac34eB21eEff58Db4D385920ef419;
    address constant internal SS_TOKEN = 0x3740fb63ab7a09891d7c0d4299442A551D06F5fD;

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
        if (asset == SS_TOKEN) {
            return int128(ERC20(SS_TOKEN).balanceOf(user));
        } else {
            return int128(0);
        }
    }

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of Adapter function.
     * Repeats calculations made in swaprate contract.
     */
    function getUnderlyingRates(address asset) external view override returns (Component[] memory) {
        Component[] memory components;

        if (asset == SS_TOKEN) {
            components = new Component[](2);
            for (uint256 i = 0; i < 2; i++) {
                components[i] = Component({
                    underlying: stableswap(SS).coins(int128(i)),
                    rate: stableswap(SS).balances(int128(i)) * 1e18 / ERC20(asset).totalSupply()
                });
            }
        } else {
            components = new Component[](0);
        }

        return components;
    }
}
