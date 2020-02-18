pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Component } from "../Structs.sol";
import { MKRAdapter } from "./MKRAdapter.sol";


/**
 * @dev Pot contract interface.
 * Only the functions required for DSRAdapter contract are added.
 * The Pot contract is available here
 * https://github.com/makerdao/dss/blob/master/src/pot.sol.
 */
interface Pot {
    function pie(address) external view returns(uint256);
    function dsr() external view returns(uint256);
    function rho() external view returns(uint256);
    function chi() external view returns(uint256);
}


/**
 * @title Adapter for DSR protocol.
 * @dev Implementation of Adapter interface.
 */
contract DSRAdapter is Adapter, MKRAdapter {

    /**
     * @return Name of the protocol.
     * @dev Implementation of Adapter function.
     */
    function getProtocolName() external pure override returns (string memory) {
        return("DSR");
    }

    /**
     * @return Amount of DAI locked on the protocol by the given user.
     * @dev Implementation of Adapter function.
     * This function repeats the calculations made in drip() function of Pot contract.
     */
    function getAssetAmount(address, address user) external view override returns (int128) {
        Pot pot = Pot(POT);
        // solhint-disable-next-line not-rely-on-time
        uint256 chi = rmultiply(rpower(pot.dsr(), now - pot.rho(), ONE), pot.chi());
        return int128(rmultiply(chi, pot.pie(user)));
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
