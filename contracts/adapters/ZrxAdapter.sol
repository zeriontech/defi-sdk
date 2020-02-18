pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Component } from "../Structs.sol";


/**
 * @dev Staking contract interface.
 * Only the functions required for ZrxAdapter contract are added.
 * The Staking contract is available here
 * .
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
     * @return Name of the protocol.
     * @dev Implementation of Adapter function.
     */
    function getProtocolName() external pure override returns (string memory) {
        return("0x");
    }

    /**
     * @return Amount of ZRX locked on the protocol by the given user.
     * @dev Implementation of Adapter function.
     */
    function getAssetAmount(address, address user) external view override returns (int128) {
        return int128(Staking(STAKING).getTotalStake(user));
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
