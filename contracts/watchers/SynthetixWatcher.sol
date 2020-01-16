pragma solidity 0.6.1;
pragma experimental ABIEncoderV2;

import { ProtocolWatcher } from "./ProtocolWatcher.sol";
import { Component } from "../Structs.sol";


/**
 * @dev Synthetix contract interface.
 * Only the functions required for SynthetixWatcher contract are added.
 * The Synthetix contract is available here
 * https://github.com/Synthetixio/synthetix/blob/master/contracts/Synthetix.sol.
 */
interface Synthetix {
    function balanceOf(address) external view returns (uint256);
    function transferableSynthetix(address) external view returns (uint256);
}


/**
 * @title Watcher for Synthetix protocol.
 * @dev Implementation of ProtocolWatcher abstract contract.
 */
contract SynthetixWatcher is ProtocolWatcher {

    /**
     * @return Name of the protocol.
     * @dev Implementation of ProtocolWatcher function.
     */
    function protocolName() external pure override returns (string memory) {
        return("Synthetix");
    }

    /**
     * @return Amount of SNX locked on the protocol by the given user.
     * @dev Implementation of ProtocolWatcher function.
     */
    function balanceOf(address asset, address user) external view override returns (uint256) {
        Synthetix synthetix = Synthetix(asset);
        return synthetix.balanceOf(user) - synthetix.transferableSynthetix(user);
    }

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of ProtocolWatcher function.
     */
    function exchangeRate(address asset) external view override returns (Component[] memory) {
        Component[] memory components = new Component[](1);
        components[0] = Component({
            underlying: asset,
            rate: uint256(1e18)
        });
        return components;
    }
}
