pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Component } from "../Structs.sol";


/**
 * @dev Synthetix contract interface.
 * Only the functions required for SynthetixAdapter contract are added.
 * The Synthetix contract is available here
 * https://github.com/Synthetixio/synthetix/blob/master/contracts/Synthetix.sol.
 */
interface Synthetix {
    function balanceOf(address) external view returns (uint256);
    function transferableSynthetix(address) external view returns (uint256);
    function debtBalanceOf(address, bytes32) external view returns (uint256);
    function synths(bytes32) external view returns (address);
}


/**
 * @title Adapter for Synthetix protocol.
 * @dev Implementation of Adapter interface.
 */
contract SynthetixAdapter is Adapter {

    address internal constant SNX = 0x153C3148A0a285A6f9F6d1996E1348832249bF7e;
    address internal constant SUSD = 0x2A020C1ad728f1C12735bC4877CEECa4491A4a3D;

    /**
     * @return Name of the protocol.
     * @dev Implementation of Adapter function.
     */
    function getProtocolName() external pure override returns (string memory) {
        return("Synthetix");
    }

    /**
     * @return Amount of SNX locked on the protocol by the given user.
     * @dev Implementation of Adapter function.
     */
    function getAssetAmount(address asset, address user) external view override returns (int256) {
        Synthetix synthetix = Synthetix(SNX);
        if (asset == SNX) {
            return int256(synthetix.balanceOf(user) - synthetix.transferableSynthetix(user));
        } else if (asset == SUSD) {
            return -int256(synthetix.debtBalanceOf(user, "sUSD"));
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
