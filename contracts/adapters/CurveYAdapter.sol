pragma solidity 0.6.2;
pragma experimental ABIEncoderV2;

import { Adapter } from "./Adapter.sol";
import { Component } from "../Structs.sol";
import { ERC20 } from "../ERC20.sol";


/**
 * @dev YToken contract interface.
 * Only the functions required for CurveYAdapter contract are added.
 * The YToken contracts are available here
 * https://github.com/iearn-finance/itoken/tree/master/contracts.
 */
interface YToken {
    function token() external view returns (address);
    function getPricePerFullShare() external view returns (uint256);
}


/**
 * @dev stableswap contract interface.
 * Only the functions required for CurveYAdapter contract are added.
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
contract CurveYAdapter is Adapter {

    address constant internal SS = 0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51;

    /**
     * @return Name of the protocol.
     * @dev Implementation of Adapter function.
     */
    function getProtocolName() external pure override returns (string memory) {
        return("Curve ∙ Y pool");
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
        Component[] memory components = new Component[](4);
        stableswap ss = stableswap(SS);

        for (uint256 i = 0; i < 4; i++) {
            YToken yToken = YToken(ss.coins(int128(i)));
            components[i] = Component({
                underlying: yToken.token(),
                rate: ss.balances(int128(i)) * yToken.getPricePerFullShare() / ERC20(asset).totalSupply()
            });
        }

        return components;
    }
}
