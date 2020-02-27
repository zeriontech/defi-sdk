pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Component } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev YToken contract interface.
 * Only the functions required for IearnAdapter contract are added.
 * The YToken contracts is available here
 * https://github.com/iearn-finance/itoken/tree/master/contracts.
 */
interface YToken {
    function token() external view returns (address);
    function getPricePerFullShare() external view returns (uint256);
}


/**
 * @title Adapter for iearn.finance protocol.
 * @dev Implementation of Adapter interface.
 */
contract IearnAdapter is Adapter {

    /**
     * @return Name of the protocol.
     * @dev Implementation of Adapter function.
     */
    function getProtocolName() external pure override returns (string memory) {
        return("iearn.finance");
    }

    /**
     * @return Amount of yToken held by the given user.
     * @dev Implementation of Adapter function.
     */
    function getAssetAmount(address asset, address user) external view override returns (int256) {
        return int256(ERC20(asset).balanceOf(user));
    }

    /**
     * @return Struct with underlying assets rates for the given asset.
     * @dev Implementation of Adapter function.
     * Repeats calculations made in stableswap contract.
     */
    function getUnderlyingRates(address asset) external view override returns (Component[] memory) {
        Component[] memory components = new Component[](1);

        components[0] = Component({
            underlying: YToken(asset).token(),
            rate: YToken(asset).getPricePerFullShare()
        });

        return components;
    }
}
