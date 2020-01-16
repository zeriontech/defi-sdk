pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;

import { ProtocolWatcher } from "./ProtocolWatcher.sol";
import { Component } from "../Structs.sol";
import { IERC20 } from "../IERC20.sol";


/**
 * @dev stableswap contract interface.
 * Only the functions required for CurveWatcher contract are added.
 * The stableswap contract is available here
 * https://github.com/curvefi/curve-contract/blob/compounded/vyper/stableswap.vy.
 */
interface stableswap {
    function coins(int128) external view returns (address);
    function balances(int128) external view returns(uint256);
}


/**
 * @title Watcher for Curve.fi protocol.
 * @dev Implementation of ProtocolWatcher abstract contract.
 */
contract CurveWatcher is ProtocolWatcher {

    stableswap constant internal STABLESWAP = stableswap(0xe5FdBab9Ad428bBB469Dee4CB6608C0a8895CbA5);

    /**
     * @return Name of the protocol.
     * @dev Implementation of ProtocolWatcher function.
     */
    function protocolName() external pure override returns (string memory) {
        return("Curve.fi");
    }

    /**
     * @return Amount of stableswapToken locked on the protocol by the given user.
     * @dev Implementation of ProtocolWatcher function.
     */
    function balanceOf(address asset, address user) external view override returns (uint256) {
        return IERC20(asset).balanceOf(user);
    }

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of ProtocolWatcher function.
     * Repeats calculations made in swaprate contract.
     */
    function exchangeRate(address asset) external view override returns (Component[] memory) {
        Component[] memory components = new Component[](2);
        for (uint256 i = 0; i < 2; i++) {
            components[i] = Component({
                underlying: STABLESWAP.coins(int128(i)),
                rate: STABLESWAP.balances(int128(i)) * 1e18 / IERC20(asset).totalSupply()
            });
        }
        return components;
    }
}
