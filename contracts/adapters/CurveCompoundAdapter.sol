pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Component } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev CToken contract interface.
 * Only the functions required for CurveCompoundAdapter contract are added.
 * The CToken contract is available here
 * https://github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol.
 */
interface CToken {
    function underlying() external view returns (address);
    function exchangeRateStored() external view returns (uint256);
}


/**
 * @dev stableswap contract interface.
 * Only the functions required for CurveCompoundAdapter contract are added.
 * The stableswap contract is available here
 * https://github.com/curvefi/curve-contract/blob/compounded/vyper/stableswap.vy.
 */
// solhint-disable-next-line contract-name-camelcase
interface stableswap {
    function coins(int128) external view returns (address);
    function balances(int128) external view returns(uint256);
}


/**
 * @title Adapter for Curve protocol.
 * @dev Implementation of Adapter interface.
 */
contract CurveCompoundAdapter is Adapter {

    address constant internal SS = 0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56;

    /**
     * @return Name of the protocol.
     * @dev Implementation of Adapter function.
     */
    function getProtocolName() external pure override returns (string memory) {
        return("Curve ∙ Compound pool");
    }

    /**
     * @return Amount of stableswapToken locked on the protocol by the given user.
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
        Component[] memory components = new Component[](2);
        stableswap ss = stableswap(SS);

        for (uint256 i = 0; i < 2; i++) {
            CToken cToken = CToken(ss.coins(int128(i)));
            components[i] = Component({
                underlying: cToken.underlying(),
                rate: ss.balances(int128(i)) * cToken.exchangeRateStored() / ERC20(asset).totalSupply()
            });
        }

        return components;
    }
}
